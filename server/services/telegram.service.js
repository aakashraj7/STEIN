import config from '../config/index.js';
import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import { ingestMessage, reclassifyMessage } from './messagePipeline.service.js';

/**
 * Telegram service — Bot API ingestion for Telegram channel & linked discussion group.
 * Supports update types: channel_post, edited_channel_post, message, edited_message.
 */

const API_BASE = 'https://api.telegram.org/bot';

let polling = false;
let pollTimeout = null;
let offset = 0;
let lastUpdateTime = null;
let lastError = null;
let botInfo = null;

// Pipeline callback — set by the server on startup
let onMessageIngested = null;

export function setMessageHandler(handler) {
  onMessageIngested = handler;
}

/**
 * Call the Telegram Bot API.
 */
async function botApiCall(method, params = {}) {
  const token = config.telegram.botToken;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured');

  const url = `${API_BASE}${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || `Bot API error: ${method}`);
  return data.result;
}

/**
 * Extract raw message object, update type, and edit flag from Telegram update.
 */
function extractMessageFromUpdate(update) {
  if (!update || typeof update !== 'object') return null;

  if (update.channel_post) {
    return { rawMsg: update.channel_post, updateType: 'channel_post', isEdit: false };
  }
  if (update.edited_channel_post) {
    return { rawMsg: update.edited_channel_post, updateType: 'edited_channel_post', isEdit: true };
  }
  if (update.message) {
    return { rawMsg: update.message, updateType: 'message', isEdit: false };
  }
  if (update.edited_message) {
    return { rawMsg: update.edited_message, updateType: 'edited_message', isEdit: true };
  }
  return null;
}

/**
 * Determine source type based on update type and chat type.
 * Channel post -> "channel"
 * Group/supergroup message -> "discussion_group"
 */
function determineSourceType(updateType, chatType) {
  if (updateType === 'channel_post' || updateType === 'edited_channel_post' || chatType === 'channel') {
    return 'channel';
  }
  return 'discussion_group';
}

/**
 * Check if the chat ID is authorized against configured channel or discussion group.
 */
function isChatAuthorized(chatId) {
  const configuredChannel = config.telegram.channelId;
  const configuredGroup = config.telegram.discussionGroupId;

  // If neither channel nor group is configured, allow all in dev/test mode
  if (!configuredChannel && !configuredGroup) return true;

  if (configuredChannel && chatId === configuredChannel) return true;
  if (configuredGroup && chatId === configuredGroup) return true;

  return false;
}

/**
 * Normalize a Telegram update into canonical message payload.
 */
function normalizeMessage(rawMsg, updateType, isEdit = false) {
  const chatType = rawMsg.chat?.type || 'channel';
  const sourceType = determineSourceType(updateType, chatType);
  const text = rawMsg.text || rawMsg.caption || '';
  const chatId = String(rawMsg.chat?.id || '');

  // Extract sender details (for ordinary group members, rawMsg.from exists)
  const senderId = rawMsg.from?.id ? String(rawMsg.from.id) : (rawMsg.sender_chat?.id ? String(rawMsg.sender_chat.id) : null);
  const senderName = rawMsg.from
    ? [rawMsg.from.first_name, rawMsg.from.last_name].filter(Boolean).join(' ')
    : (rawMsg.sender_chat?.title || rawMsg.author_signature || '');
  const username = rawMsg.from?.username || rawMsg.sender_chat?.username || '';

  const configuredChannel = config.telegram.channelId;
  const configuredGroup = config.telegram.discussionGroupId;

  let channelId = chatId;
  let discussionGroupId = null;

  if (sourceType === 'discussion_group') {
    discussionGroupId = chatId;
    channelId = configuredChannel || chatId;
  } else {
    channelId = chatId;
    discussionGroupId = configuredGroup || null;
  }

  return {
    source: 'TELEGRAM',
    dataSource: 'LIVE',
    channelId,
    channelTitle: rawMsg.chat?.title || '',
    telegramMessageId: rawMsg.message_id,
    text,
    timestamp: new Date((rawMsg.date || 0) * 1000),
    rawUpdate: rawMsg,
    metadata: {
      chatType,
      updateType,
      sourceType,
      senderId,
      senderName,
      username,
      chatId,
      chatTitle: rawMsg.chat?.title || '',
      discussionGroupId,
      isEdited: isEdit,
      editDate: rawMsg.edit_date ? new Date(rawMsg.edit_date * 1000) : null,
      forwardOrigin: rawMsg.forward_origin || null,
      senderChat: rawMsg.sender_chat || null,
      authorSignature: rawMsg.author_signature || null,
    },
  };
}

/**
 * Process a single update from the Telegram Bot API via canonical message pipeline.
 */
export async function processUpdate(update) {
  if (!update) return null;

  const extracted = extractMessageFromUpdate(update);
  if (!extracted) {
    console.log(`[Telegram] Ignoring update ${update.update_id}: No matching message object.`);
    return null;
  }

  const { rawMsg, updateType, isEdit } = extracted;
  const chatType = rawMsg.chat?.type || 'unknown';
  const chatId = String(rawMsg.chat?.id || '');
  const sourceType = determineSourceType(updateType, chatType);

  const senderId = rawMsg.from?.id ? String(rawMsg.from.id) : (rawMsg.sender_chat?.id ? String(rawMsg.sender_chat.id) : 'N/A');

  // Requirement 11: Diagnostic logging (no secrets logged)
  console.log(`[Telegram] update received: update_id=${update.update_id}`);
  console.log(`[Telegram] update type: ${updateType}`);
  console.log(`[Telegram] chat type: ${chatType}`);
  console.log(`[Telegram] chat id: ${chatId}`);
  console.log(`[Telegram] sender id: ${senderId}`);
  console.log(`[Telegram] source: ${sourceType}`);

  // Security check: match against configured channel or discussion group
  if (!isChatAuthorized(chatId)) {
    console.log(`[Telegram] Ignoring update from unauthorized chat: ${chatId} (${sourceType})`);
    return null;
  }

  // Requirement 7 & 8: Support text/caption, safely ignore non-text service messages
  const text = rawMsg.text || rawMsg.caption || '';
  if (!text || !text.trim()) {
    console.log(`[Telegram] Safely ignoring non-text message (ID: ${rawMsg.message_id}) in chat ${chatId}`);
    return null;
  }

  const normalized = normalizeMessage(rawMsg, updateType, isEdit);

  // Requirement 10: Handle edited messages cleanly without duplicates
  if (isEdit) {
    const existing = await Message.findOne({
      channelId: normalized.channelId,
      telegramMessageId: normalized.telegramMessageId,
    });

    if (existing) {
      console.log(`[Telegram] Updating existing message ${existing._id} for edited message ID ${normalized.telegramMessageId}`);
      existing.text = normalized.text;
      existing.originalText = normalized.text;
      existing.rawUpdate = rawMsg;
      existing.metadata = {
        ...existing.metadata,
        ...normalized.metadata,
        isEdited: true,
        editDate: normalized.metadata.editDate || new Date(),
      };
      await existing.save();
      await reclassifyMessage(existing._id);

      if (onMessageIngested) {
        try { await onMessageIngested(existing); } catch (err) {
          console.error('[Telegram] Pipeline callback error:', err.message);
        }
      }
      return existing;
    }
  }

  // Delegate processing to canonical message pipeline
  const msg = await ingestMessage(normalized);

  // Update channel record
  if (msg) {
    await Channel.findOneAndUpdate(
      { channelId: normalized.channelId },
      {
        $set: { title: normalized.channelTitle, type: chatType, lastActivity: normalized.timestamp, dataSource: 'LIVE' },
        $inc: { messageCount: 1 },
        $setOnInsert: { firstSeen: normalized.timestamp },
      },
      { upsert: true }
    );
  }

  // Trigger optional callback
  if (onMessageIngested) {
    try { await onMessageIngested(msg); } catch (err) {
      console.error('[Telegram] Pipeline callback error:', err.message);
    }
  }

  return msg;
}

/**
 * Poll loop using getUpdates with long polling.
 */
async function pollLoop() {
  if (!polling) return;

  try {
    const updates = await botApiCall('getUpdates', {
      offset,
      timeout: 30,
      allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post'],
    });

    for (const update of updates) {
      offset = update.update_id + 1;
      try {
        await processUpdate(update);
        lastUpdateTime = new Date();
      } catch (err) {
        console.error('[Telegram] Error processing update:', err.message);
        lastError = err.message;
      }
    }
    lastError = null;
  } catch (err) {
    console.error('[Telegram] Poll error:', err.message);
    lastError = err.message;
  }

  // Schedule next poll
  if (polling) {
    pollTimeout = setTimeout(pollLoop, 1000);
  }
}

/**
 * Start polling the Telegram Bot API.
 */
export async function startPolling() {
  if (!config.telegram.botToken) {
    console.log('[Telegram] No bot token configured — running in DEMO mode.');
    return false;
  }

  try {
    botInfo = await botApiCall('getMe');
    console.log(`[Telegram] Bot authenticated: @${botInfo.username}`);
    polling = true;
    pollLoop(); // fire and forget
    console.log(`[Telegram] Polling started for channel: ${config.telegram.channelId || 'ANY'} / group: ${config.telegram.discussionGroupId || 'ANY'}`);
    return true;
  } catch (err) {
    console.error('[Telegram] Failed to start polling:', err.message);
    lastError = err.message;
    return false;
  }
}

/**
 * Stop polling.
 */
export function stopPolling() {
  polling = false;
  if (pollTimeout) clearTimeout(pollTimeout);
  console.log('[Telegram] Polling stopped.');
}

/**
 * Get connection status.
 */
export function getConnectionStatus() {
  return {
    configured: !!config.telegram.botToken,
    polling,
    botUsername: botInfo?.username || null,
    channelId: config.telegram.channelId || null,
    discussionGroupId: config.telegram.discussionGroupId || null,
    lastUpdateTime,
    lastError,
    mode: config.telegram.botToken ? (polling ? 'LIVE' : 'ERROR') : 'DEMO',
  };
}

/**
 * Test the bot token by calling getMe.
 */
export async function testConnection() {
  try {
    const me = await botApiCall('getMe');
    return { success: true, bot: me };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Handle incoming webhook update.
 */
export async function handleWebhookUpdate(update) {
  try {
    return await processUpdate(update);
  } catch (err) {
    console.error('[Telegram Webhook] Error processing update:', err.message);
    throw err;
  }
}

/**
 * Configure webhook URL with required allowed updates.
 */
export async function setupWebhook(url) {
  return await botApiCall('setWebhook', {
    url,
    allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post'],
  });
}

