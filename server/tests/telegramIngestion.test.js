import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import config from '../config/index.js';
import Message from '../models/message.model.js';
import Channel from '../models/channel.model.js';
import * as telegramService from '../services/telegram.service.js';

describe('Telegram Channel & Discussion Group Message Ingestion', () => {
  let mongoConnected = false;

  let originalChannelId;
  let originalGroupId;

  before(async () => {
    originalChannelId = config.telegram.channelId;
    originalGroupId = config.telegram.discussionGroupId;
    config.telegram.channelId = '-1001234567890';
    config.telegram.discussionGroupId = '-1009876543210';

    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(config.mongodb.uri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
        });
      }
      mongoConnected = mongoose.connection.readyState === 1;
    } catch {
      mongoConnected = false;
    }
  });

  after(async () => {
    config.telegram.channelId = originalChannelId;
    config.telegram.discussionGroupId = originalGroupId;
    if (mongoConnected && mongoose.connection.readyState !== 0) {
      await Message.deleteMany({ channelId: { $in: ['-1001234567890', '-1009876543210'] } });
      await Channel.deleteMany({ channelId: { $in: ['-1001234567890', '-1009876543210'] } });
      await mongoose.disconnect();
    }
  });

  it('TEST 1: Channel administrator publishes a channel post (channel_post)', async () => {
    const update = {
      update_id: 10001,
      channel_post: {
        message_id: 8001,
        date: 1700000000,
        chat: {
          id: -1001234567890,
          title: 'Official Announcements Channel',
          type: 'channel',
        },
        author_signature: 'AdminUser',
        text: 'Official channel update regarding listing schedule',
      },
    };

    const msg = await telegramService.processUpdate(update);

    assert.ok(msg, 'Message should be ingested');
    assert.equal(msg.text, 'Official channel update regarding listing schedule');
    assert.equal(msg.metadata.sourceType, 'channel');
    assert.equal(msg.metadata.chatType, 'channel');
    assert.equal(msg.metadata.updateType, 'channel_post');
  });

  it('TEST 2: Ordinary non-admin user posts in linked discussion group (message) — CRITICAL ACCEPTANCE TEST', async () => {
    const update = {
      update_id: 10002,
      message: {
        message_id: 8002,
        date: 1700000010,
        chat: {
          id: -1009876543210,
          title: 'Official Discussion Group',
          type: 'supergroup',
        },
        from: {
          id: 77665544,
          is_bot: false,
          first_name: 'Alice',
          last_name: 'Member',
          username: 'alice_ordinary_user',
        },
        text: 'hello',
      },
    };

    const msg = await telegramService.processUpdate(update);

    assert.ok(msg, 'Message from ordinary member in discussion group MUST be ingested');
    assert.equal(msg.text, 'hello');
    assert.equal(msg.metadata.sourceType, 'discussion_group');
    assert.equal(msg.metadata.chatType, 'supergroup');
    assert.equal(msg.metadata.updateType, 'message');
    assert.equal(msg.metadata.senderId, '77665544');
    assert.equal(msg.metadata.username, 'alice_ordinary_user');
    assert.equal(msg.metadata.senderName, 'Alice Member');
  });

  it('TEST 3: Ordinary user sends a message containing a photo with caption', async () => {
    const update = {
      update_id: 10003,
      message: {
        message_id: 8003,
        date: 1700000020,
        chat: {
          id: -1009876543210,
          title: 'Official Discussion Group',
          type: 'supergroup',
        },
        from: {
          id: 88776655,
          is_bot: false,
          first_name: 'Bob',
          username: 'bob_trader',
        },
        photo: [
          { file_id: 'ph_small', file_unique_id: 'ph_u1', width: 100, height: 100 },
          { file_id: 'ph_large', file_unique_id: 'ph_u2', width: 800, height: 800 },
        ],
        caption: 'Payment receipt proof for deal DM me for rate',
      },
    };

    const msg = await telegramService.processUpdate(update);

    assert.ok(msg, 'Photo message with caption should be ingested');
    assert.equal(msg.text, 'Payment receipt proof for deal DM me for rate');
    assert.equal(msg.metadata.sourceType, 'discussion_group');
    assert.equal(msg.metadata.senderId, '88776655');
  });

  it('TEST 4: Group receives a service message with no text (new_chat_members)', async () => {
    const update = {
      update_id: 10004,
      message: {
        message_id: 8004,
        date: 1700000030,
        chat: {
          id: -1009876543210,
          title: 'Official Discussion Group',
          type: 'supergroup',
        },
        new_chat_members: [
          { id: 990011, first_name: 'NewMember', is_bot: false },
        ],
      },
    };

    const msg = await telegramService.processUpdate(update);

    assert.equal(msg, null, 'Service message without text or caption MUST be safely ignored (return null)');
  });

  it('TEST 5: Edited discussion-group message (edited_message)', async () => {
    // 1. Send initial message
    const initialUpdate = {
      update_id: 10005,
      message: {
        message_id: 8005,
        date: 1700000040,
        chat: {
          id: -1009876543210,
          title: 'Official Discussion Group',
          type: 'supergroup',
        },
        from: {
          id: 77665544,
          username: 'alice_ordinary_user',
        },
        text: 'Initial draft message text before edit',
      },
    };

    const initialMsg = await telegramService.processUpdate(initialUpdate);
    assert.ok(initialMsg, 'Initial message should be created');

    // 2. Send edited update for the same message_id
    const editedUpdate = {
      update_id: 10006,
      edited_message: {
        message_id: 8005,
        date: 1700000040,
        edit_date: 1700000050,
        chat: {
          id: -1009876543210,
          title: 'Official Discussion Group',
          type: 'supergroup',
        },
        from: {
          id: 77665544,
          username: 'alice_ordinary_user',
        },
        text: 'Corrected text after edit in group',
      },
    };

    const editedMsg = await telegramService.processUpdate(editedUpdate);

    assert.ok(editedMsg, 'Edited message should be processed');
    assert.equal(String(editedMsg._id), String(initialMsg._id), 'Edited message MUST update existing document, not create duplicate');
    assert.equal(editedMsg.text, 'Corrected text after edit in group');
    assert.equal(editedMsg.metadata.isEdited, true);
    assert.equal(editedMsg.metadata.updateType, 'edited_message');
  });
});
