import Vendor from '../models/vendor.model.js';
import Message from '../models/message.model.js';
import * as neo4jService from './neo4j.service.js';

/**
 * Resolve or assign a Vendor entity for an ingested message.
 * Prefers author_signature / sender identity as primary key over channelId alone.
 */
export async function resolveVendorForMessage(msgData) {
  const authorSignature = msgData.rawUpdate?.author_signature || msgData.metadata?.authorSignature;
  const senderChatTitle = msgData.rawUpdate?.sender_chat?.title || msgData.metadata?.senderChat?.title;
  const senderUsername = msgData.rawUpdate?.sender_chat?.username || msgData.rawUpdate?.from?.username;

  let vendor = null;

  // 1. Match by Author Signature
  if (authorSignature) {
    vendor = await Vendor.findOne({
      $or: [
        { name: authorSignature },
        { aliases: authorSignature },
        { telegramUsername: authorSignature.replace(/^@/, '') },
      ],
    });

    if (!vendor) {
      // Create new Vendor for this specific Author Signature
      vendor = await Vendor.create({
        name: authorSignature,
        aliases: [authorSignature],
        telegramUsername: senderUsername || undefined,
        channelId: msgData.channelId,
        riskLevel: 'LOW',
        dataSource: msgData.dataSource || 'LIVE',
      });
      console.log(`[VendorResolution] Created new Vendor for author signature: "${authorSignature}"`);
    }
  }

  // 2. Match by Sender Chat Title or Username
  if (!vendor && (senderChatTitle || senderUsername)) {
    vendor = await Vendor.findOne({
      $or: [
        { name: senderChatTitle },
        { telegramUsername: senderUsername },
        { aliases: senderChatTitle },
      ],
    });
  }

  // 3. Fallback to Channel default Vendor if existing, or create Channel entity vendor
  if (!vendor && msgData.channelId) {
    vendor = await Vendor.findOne({ channelId: msgData.channelId });
    if (!vendor && msgData.channelTitle) {
      vendor = await Vendor.create({
        name: `Vendor_${msgData.channelTitle.replace(/\s+/g, '_')}`,
        channelId: msgData.channelId,
        riskLevel: 'LOW',
        dataSource: msgData.dataSource || 'LIVE',
      });
    }
  }

  return vendor;
}

/**
 * Update and aggregate Vendor Risk Profile across historical messages.
 * Evaluates suspicious counts, proportions, risk score averages, signal diversity, and repeated behaviors.
 */
export async function aggregateVendorRisk(vendorId) {
  if (!vendorId) return null;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return null;

  const messages = await Message.find({ vendorId }).lean();
  if (messages.length === 0) return vendor;

  let totalRiskScore = 0;
  let suspiciousCount = 0;
  let reviewCount = 0;
  const uniqueSignals = new Set();

  for (const m of messages) {
    const classif = m.classification || {};
    const score = classif.riskScore || 0;
    totalRiskScore += score;

    if (classif.label === 'SUSPICIOUS') suspiciousCount++;
    else if (classif.label === 'NEEDS_REVIEW') reviewCount++;

    if (Array.isArray(classif.signals)) {
      for (const sig of classif.signals) uniqueSignals.add(sig);
    }
  }

  const avgRiskScore = totalRiskScore / messages.length;
  const suspiciousRatio = suspiciousCount / messages.length;
  const signalDiversity = uniqueSignals.size;

  // Determine aggregated risk level
  let newRiskLevel = 'LOW';

  if (suspiciousCount >= 3 && suspiciousRatio >= 0.4 && signalDiversity >= 3) {
    newRiskLevel = 'CRITICAL';
  } else if (suspiciousCount >= 2 || (suspiciousRatio >= 0.3 && avgRiskScore >= 50)) {
    newRiskLevel = 'HIGH';
  } else if (suspiciousCount >= 1 || reviewCount >= 2 || avgRiskScore >= 30) {
    newRiskLevel = 'MEDIUM';
  } else {
    newRiskLevel = 'LOW';
  }

  vendor.messageCount = messages.length;
  vendor.lastSeen = new Date();
  vendor.riskLevel = newRiskLevel;
  vendor.notes = `Aggregated Profile: ${messages.length} msgs (${suspiciousCount} suspicious, ${reviewCount} review). Avg Risk Score: ${Math.round(avgRiskScore)}. Signal Diversity: ${signalDiversity}.`;
  await vendor.save();

  // Sync to Neo4j if available
  try {
    await neo4jService.upsertVendor(vendor);
  } catch {
    /* graph driver handled */
  }

  return vendor;
}
