import Message from '../models/message.model.js';
import Vendor from '../models/vendor.model.js';
import { detectAndDecodeEncoding } from '../utils/morseDecoder.js';
import { classifyMessage } from './gemini.service.js';
import { extractEthAddresses, detectXmrMentions } from '../utils/ethereum.js';
import { resolveVendorForMessage, aggregateVendorRisk } from './vendorRisk.service.js';

/**
 * Single Canonical Ingestion & Processing Pipeline for Telegram/Manual Messages.
 * 
 * Pipeline sequence:
 * 1. Idempotency Check (channelId + telegramMessageId)
 * 2. Encoding Detection & Decoding (detectAndDecodeEncoding - ONCE)
 * 3. Vendor Entity Resolution
 * 4. Prior Vendor History Retrieval (excluding current message)
 * 5. Contextual Gemini Classification & Signal Extraction (on decodedText)
 * 6. ETH / XMR Address Extraction (on decodedText)
 * 7. Message Persistence to MongoDB
 * 8. Vendor Historical Risk Aggregation (AFTER persistence)
 */

export async function ingestMessage(payload) {
  if (!payload || !payload.text) {
    throw new Error('Message text is required for pipeline ingestion.');
  }

  // 1. Idempotency Check for Telegram posts
  if (payload.channelId && payload.telegramMessageId) {
    const existing = await Message.findOne({
      channelId: payload.channelId,
      telegramMessageId: payload.telegramMessageId,
    });
    if (existing) {
      console.log(`[Pipeline] Message ${payload.telegramMessageId} already exists in channel ${payload.channelId}. Skipping.`);
      return existing;
    }
  }

  // 2. Encoding Detection & Decoding (Executed ONCE)
  const encodingInfo = detectAndDecodeEncoding(payload.text);

  // 3. Resolve Vendor Entity
  let resolvedVendorId = payload.vendorId || null;
  if (!resolvedVendorId) {
    const tempMsg = {
      text: encodingInfo.originalText,
      channelId: payload.channelId,
      rawUpdate: payload.rawUpdate,
      metadata: payload.metadata,
    };
    const vendor = await resolveVendorForMessage(tempMsg);
    if (vendor) resolvedVendorId = vendor._id;
  }

  // 4. Retrieve Prior Vendor History (Excluding current message)
  let vendorHistory = null;
  if (resolvedVendorId) {
    const vendor = await Vendor.findById(resolvedVendorId);
    if (vendor) {
      const priorMessages = await Message.find({ vendorId: resolvedVendorId });
      const totalCount = priorMessages.length;
      const suspiciousCount = priorMessages.filter(m => m.classification?.label === 'SUSPICIOUS').length;

      vendorHistory = {
        name: vendor.name,
        historicalRisk: vendor.riskLevel,
        messageCount: totalCount,
        suspiciousCount,
      };
    }
  }

  // 5. Contextual Classification & Signal Extraction (Consumes pre-decoded text)
  const classification = await classifyMessage(encodingInfo.decodedText, vendorHistory);

  // 6. ETH / XMR Address Extraction (Consumes pre-decoded text)
  const ethAddrs = extractEthAddresses(encodingInfo.decodedText);
  const xmrMentions = detectXmrMentions(encodingInfo.decodedText);

  // 7. Message Persistence to MongoDB
  const msgDoc = await Message.create({
    source: payload.source || 'TELEGRAM',
    dataSource: payload.dataSource || 'LIVE',
    channelId: payload.channelId,
    channelTitle: payload.channelTitle,
    telegramMessageId: payload.telegramMessageId,
    text: encodingInfo.originalText,
    originalText: encodingInfo.originalText,
    decodedText: encodingInfo.decodedText,
    encodingDetected: encodingInfo.encodingDetected,
    timestamp: payload.timestamp || new Date(),
    rawUpdate: payload.rawUpdate,
    metadata: payload.metadata || {},
    vendorId: resolvedVendorId,
    classification: { ...classification, classifiedAt: new Date() },
    extractedAddresses: [
      ...ethAddrs.map(a => ({ type: 'ETH', address: a })),
      ...xmrMentions.map(m => ({ type: 'XMR_MENTION', address: m })),
    ],
  });

  // 8. Vendor Historical Risk Aggregation (Executes AFTER persistence)
  if (resolvedVendorId) {
    await aggregateVendorRisk(resolvedVendorId);
  }

  console.log(`[Pipeline] Successfully processed message ${msgDoc._id} (Encoding: ${encodingInfo.encodingDetected || 'NONE'}): ${classification.label} (Score: ${classification.riskScore})`);
  return msgDoc;
}

/**
 * Canonical Reclassification of an Existing Message.
 * Updates the existing document in-place and recalculates vendor aggregate risk.
 * 
 * @param {string} messageId 
 * @returns {Promise<Document>}
 */
export async function reclassifyMessage(messageId) {
  const msg = await Message.findById(messageId);
  if (!msg) {
    throw new Error(`Message not found: ${messageId}`);
  }

  // 1. Explicit Application-Level Fallback for raw text
  const rawInputText = msg.originalText ?? msg.text ?? '';

  // 2. Encoding Detection & Decoding (Executed ONCE)
  const encodingInfo = detectAndDecodeEncoding(rawInputText);

  // 3. Retrieve Prior Vendor History (Excluding current message ID)
  let vendorHistory = null;
  if (msg.vendorId) {
    const vendor = await Vendor.findById(msg.vendorId);
    if (vendor) {
      const priorMessages = await Message.find({ vendorId: msg.vendorId, _id: { $ne: msg._id } });
      const suspiciousCount = priorMessages.filter(m => m.classification?.label === 'SUSPICIOUS').length;

      vendorHistory = {
        name: vendor.name,
        historicalRisk: vendor.riskLevel,
        messageCount: priorMessages.length,
        suspiciousCount,
      };
    }
  }

  // 4. Contextual Classification & Signal Extraction (Consumes pre-decoded text)
  const classification = await classifyMessage(encodingInfo.decodedText, vendorHistory);

  // 5. Address Extraction (Consumes pre-decoded text)
  const ethAddrs = extractEthAddresses(encodingInfo.decodedText);
  const xmrMentions = detectXmrMentions(encodingInfo.decodedText);

  // 6. Mutate & Persist existing document in-place
  msg.text = encodingInfo.originalText;
  msg.originalText = encodingInfo.originalText;
  msg.decodedText = encodingInfo.decodedText;
  msg.encodingDetected = encodingInfo.encodingDetected;
  msg.classification = { ...classification, classifiedAt: new Date() };
  msg.extractedAddresses = [
    ...ethAddrs.map(a => ({ type: 'ETH', address: a })),
    ...xmrMentions.map(m => ({ type: 'XMR_MENTION', address: m })),
  ];
  await msg.save();

  // 7. Vendor Historical Risk Aggregation (Executes AFTER persistence)
  if (msg.vendorId) {
    await aggregateVendorRisk(msg.vendorId);
  }

  console.log(`[Pipeline] Reclassified message ${msg._id}: ${classification.label} (Score: ${classification.riskScore})`);
  return msg;
}

export default { ingestMessage, reclassifyMessage };
