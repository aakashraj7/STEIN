import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import Vendor from '../models/vendor.model.js';
import Wallet from '../models/wallet.model.js';
import Channel from '../models/channel.model.js';
import Lead from '../models/lead.model.js';
import Case from '../models/case.model.js';
import AuditLog from '../models/auditLog.model.js';
import Report from '../models/report.model.js';
import HistoricalEvidence from '../models/historicalEvidence.model.js';
import * as neo4jService from '../services/neo4j.service.js';
import { appendAuditEntry } from '../services/audit.service.js';
import { classifyMessage } from '../services/gemini.service.js';
import { extractEthAddresses, detectXmrMentions } from '../utils/ethereum.js';
import { extractFeatures, compareFingerprints } from '../services/stylometry.service.js';
import { analyzeWalletTransactions } from '../services/wallet.service.js';
import { calculateCorrelationScore } from '../services/correlation.service.js';
import { generateReport } from '../services/report.service.js';

/**
 * Full seed script that creates the complete demo investigation scenario.
 */
export async function seedAll() {
  // ── Clear existing data ──────────────────────────
  await Promise.all([
    Message.deleteMany({}),
    Vendor.deleteMany({}),
    Wallet.deleteMany({}),
    Channel.deleteMany({}),
    Lead.deleteMany({}),
    Case.deleteMany({}),
    AuditLog.deleteMany({}),
    Report.deleteMany({}),
    HistoricalEvidence.deleteMany({}),
  ]);

  try { await neo4jService.clearGraph(); } catch { /* neo4j may not be connected */ }

  console.log('[Seed] Cleared existing data.');

  // ── Channel ──────────────────────────────────────
  const channel = await Channel.create({
    channelId: '-1001234567890',
    title: 'STEIN TEST CHANNEL',
    type: 'channel',
    messageCount: 0,
    dataSource: 'DEMO',
  });

  // ── Vendors ──────────────────────────────────────
  const vendorAlpha = await Vendor.create({
    name: 'Vendor_Alpha',
    aliases: ['AlphaDeals', 'Alpha_OG'],
    telegramUsername: 'alpha_deals_bot',
    channelId: channel.channelId,
    riskLevel: 'HIGH',
    walletAddresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78'],
    dataSource: 'DEMO',
  });

  const vendorShadow = await Vendor.create({
    name: 'Shadow_Trader',
    aliases: ['ShadowX', 'DarkShadow99'],
    telegramUsername: 'shadow_trader_x',
    channelId: channel.channelId,
    riskLevel: 'MEDIUM',
    walletAddresses: ['0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c'],
    dataSource: 'DEMO',
  });

  const vendorClean = await Vendor.create({
    name: 'CryptoNewsBot',
    aliases: [],
    telegramUsername: 'crypto_news_updates',
    channelId: channel.channelId,
    riskLevel: 'LOW',
    dataSource: 'DEMO',
  });

  // ── Messages — Vendor Alpha (suspicious, 12 msgs for stylometry) ──
  const alphaMessages = [
    'bro 2g available, message me on wickr for details 🔥',
    'premium quality stuff just landed... DM for price list, bulk discount available',
    'express overnight shipping available, 100% stealth packaging guaranteed',
    'new batch just dropped!! fire quality, hmu fast before its gone',
    'got that gas ⛽ dm me for menu... escrow accepted',
    'special deal this week only — 20% off all orders over $200, crypto only',
    'sample packs available for new buyers... legit vendor 3+ years',
    'restock alert! everything back in stock, check menu in DM 📋',
    'accepting ETH and BTC — wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78',
    'fast delivery guaranteed... 2 day max, stealth wrap, no issues fam',
    'yo whos looking?? drop a msg, got the best prices rn 💯',
    'pure uncut grade A, tested at 96%... only serious buyers dm me',
  ];

  // ── Messages — Shadow Trader (suspicious, similar style to Alpha, 10 msgs) ──
  const shadowMessages = [
    'yo got that fire stuff available, dm me for details 🔥',
    'premium grade just restocked... bulk discounts for regulars, hmu',
    'stealth shipping express, 2 day delivery guaranteed no cap',
    'new batch alert!! quality tested, message for the menu fam',
    'got the gas ⛽ hmu for prices... crypto only, escrow ok',
    'special promo — 15% off first order, legit vendor verified 💯',
    'sample available for new customers... been doing this 2+ years',
    'send to my ETH wallet: 0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c',
    'fast delivery, stealth pack, never had a complaint bro',
    'whos copping today?? best prices no cap, dm asap 🔥💯',
  ];

  // ── Messages — Clean user (benign, 6 msgs) ──
  const cleanMessages = [
    'Bitcoin hits new ATH! $105K and counting 📈',
    'Interesting analysis on ETH gas fees — they\'re finally coming down',
    'Anyone else watching the SEC hearing today? Big implications for crypto regulation',
    'Market update: total crypto market cap crosses $4T milestone',
    'Great thread on Layer 2 scaling solutions. Optimism and Arbitrum leading the charge',
    'Reminder: not financial advice. Always DYOR before investing in any project.',
  ];

  const now = Date.now();
  const DAY = 86400000;

  const allMsgDocs = [];

  for (let i = 0; i < alphaMessages.length; i++) {
    const text = alphaMessages[i];
    const classification = await classifyMessage(text);
    const ethAddrs = extractEthAddresses(text);
    const xmrMentions = detectXmrMentions(text);
    const doc = await Message.create({
      source: 'TELEGRAM', dataSource: 'DEMO',
      channelId: channel.channelId, channelTitle: channel.title,
      telegramMessageId: 1000 + i, text,
      timestamp: new Date(now - (12 - i) * DAY),
      classification: { ...classification, classifiedAt: new Date() },
      vendorId: vendorAlpha._id,
      extractedAddresses: [
        ...ethAddrs.map(a => ({ type: 'ETH', address: a })),
        ...xmrMentions.map(m => ({ type: 'XMR_MENTION', address: m })),
      ],
    });
    allMsgDocs.push(doc);
  }

  for (let i = 0; i < shadowMessages.length; i++) {
    const text = shadowMessages[i];
    const classification = await classifyMessage(text);
    const ethAddrs = extractEthAddresses(text);
    const doc = await Message.create({
      source: 'TELEGRAM', dataSource: 'DEMO',
      channelId: channel.channelId, channelTitle: channel.title,
      telegramMessageId: 2000 + i, text,
      timestamp: new Date(now - (10 - i) * DAY),
      classification: { ...classification, classifiedAt: new Date() },
      vendorId: vendorShadow._id,
      extractedAddresses: ethAddrs.map(a => ({ type: 'ETH', address: a })),
    });
    allMsgDocs.push(doc);
  }

  for (let i = 0; i < cleanMessages.length; i++) {
    const text = cleanMessages[i];
    const classification = await classifyMessage(text);
    const doc = await Message.create({
      source: 'TELEGRAM', dataSource: 'DEMO',
      channelId: channel.channelId, channelTitle: channel.title,
      telegramMessageId: 3000 + i, text,
      timestamp: new Date(now - (6 - i) * DAY),
      classification: { ...classification, classifiedAt: new Date() },
      vendorId: vendorClean._id,
    });
    allMsgDocs.push(doc);
  }

  console.log(`[Seed] Created ${allMsgDocs.length} messages.`);

  // Update vendor message counts
  await Vendor.updateOne({ _id: vendorAlpha._id }, { messageCount: alphaMessages.length, lastSeen: new Date() });
  await Vendor.updateOne({ _id: vendorShadow._id }, { messageCount: shadowMessages.length, lastSeen: new Date() });
  await Vendor.updateOne({ _id: vendorClean._id }, { messageCount: cleanMessages.length, lastSeen: new Date() });
  await Channel.updateOne({ _id: channel._id }, { messageCount: allMsgDocs.length, lastActivity: new Date() });

  // ── Wallets with synthetic transactions ──────────
  const alphaWallet = await Wallet.create({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78',
    blockchain: 'ETH',
    vendorId: vendorAlpha._id,
    dataSource: 'DEMO',
    transactions: [
      { hash: '0xabc1', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c', value: '0.5', timestamp: new Date(now - 5 * DAY), type: 'NORMAL' },
      { hash: '0xabc2', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0xAAAABBBBCCCCDDDD1111222233334444AAAABBBB', value: '1.2', timestamp: new Date(now - 5 * DAY + 3600000), type: 'NORMAL' },
      { hash: '0xabc3', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0xDDDDEEEEFFFF0000111122223333444455556666', value: '0.8', timestamp: new Date(now - 5 * DAY + 7200000), type: 'NORMAL' },
      { hash: '0xabc4', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0xEEEEFFFF00001111222233334444555566667777', value: '0.3', timestamp: new Date(now - 5 * DAY + 10800000), type: 'NORMAL' },
      { hash: '0xabc5', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0x00000000000000000000000000000000DeaDBeef', value: '2.0', timestamp: new Date(now - 4 * DAY), type: 'NORMAL' },
      { hash: '0xabc6', from: '0x9999888877776666555544443333222211110000', to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', value: '5.0', timestamp: new Date(now - 60 * DAY), type: 'NORMAL' },
      { hash: '0xerc1', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c', value: '500', timestamp: new Date(now - 3 * DAY), tokenSymbol: 'USDT', type: 'ERC20' },
    ],
  });

  // Analyze wallet
  const alphaAnalysis = analyzeWalletTransactions(alphaWallet.transactions, alphaWallet.address);
  await Wallet.updateOne({ _id: alphaWallet._id }, {
    heuristics: alphaAnalysis.heuristics,
    riskScore: alphaAnalysis.riskScore,
    transactionCount: alphaWallet.transactions.length,
    lastActivity: new Date(now - 3 * DAY),
  });

  const shadowWallet = await Wallet.create({
    address: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c',
    blockchain: 'ETH',
    vendorId: vendorShadow._id,
    dataSource: 'DEMO',
    transactions: [
      { hash: '0xdef1', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c', value: '0.5', timestamp: new Date(now - 5 * DAY), type: 'NORMAL' },
      { hash: '0xdef2', from: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c', to: '0xFFFF0000111122223333444455556666AAAA7777', value: '0.4', timestamp: new Date(now - 2 * DAY), type: 'NORMAL' },
      { hash: '0xerc2', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78', to: '0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c', value: '500', timestamp: new Date(now - 3 * DAY), tokenSymbol: 'USDT', type: 'ERC20' },
    ],
  });

  const shadowAnalysis = analyzeWalletTransactions(shadowWallet.transactions, shadowWallet.address);
  await Wallet.updateOne({ _id: shadowWallet._id }, {
    heuristics: shadowAnalysis.heuristics,
    riskScore: shadowAnalysis.riskScore,
    transactionCount: shadowWallet.transactions.length,
    lastActivity: new Date(now - 2 * DAY),
  });

  console.log('[Seed] Created wallets with transactions.');

  // ── Stylometry comparison ────────────────────────
  const alphaFp = extractFeatures(alphaMessages);
  const shadowFp = extractFeatures(shadowMessages);
  const stylometryResult = compareFingerprints(alphaFp, shadowFp);

  console.log(`[Seed] Stylometry: ${stylometryResult.level} (${stylometryResult.overallSimilarity})`);

  // ── Correlation ──────────────────────────────────
  const correlationResult = calculateCorrelationScore({
    listingSignal: 0.85,
    stylometrySignal: stylometryResult.overallSimilarity || 0.7,
    walletSignal: alphaAnalysis.riskScore,
    behaviourOverlap: 0.6,
  });

  console.log(`[Seed] Correlation score: ${correlationResult.score} (${correlationResult.priority})`);

  // ── Lead ─────────────────────────────────────────
  const lead = await Lead.create({
    title: 'Vendor Alpha ↔ Shadow Trader — Possible alias with linked wallets',
    description: 'High stylometric similarity between Vendor_Alpha and Shadow_Trader combined with direct ETH transfers between their wallets. Writing patterns suggest potential shared authorship.',
    type: 'CORRELATION',
    status: 'ACCEPTED',
    priority: correlationResult.score,
    vendorIds: [vendorAlpha._id, vendorShadow._id],
    messageIds: allMsgDocs.filter(m => m.vendorId?.toString() === vendorAlpha._id.toString() || m.vendorId?.toString() === vendorShadow._id.toString()).map(m => m._id),
    walletAddresses: [alphaWallet.address, shadowWallet.address],
    signals: [
      { type: 'LISTING', score: 0.85, detail: 'Both accounts post marketplace-style listings with pricing, shipping, and crypto payment options' },
      { type: 'STYLOMETRY', score: stylometryResult.overallSimilarity, detail: stylometryResult.explanations.join('; ') },
      { type: 'WALLET', score: alphaAnalysis.riskScore, detail: alphaAnalysis.heuristics.suspiciousPatterns.join('; ') },
      { type: 'BEHAVIOURAL', score: 0.6, detail: 'Similar posting schedule and response patterns' },
    ],
    correlationScore: correlationResult.score,
    reviewedBy: 'investigator',
    reviewedAt: new Date(),
    dataSource: 'DEMO',
  });

  // ── Case ─────────────────────────────────────────
  const caseDoc = await Case.create({
    caseNumber: 'STEIN-2026-001',
    title: 'Vendor Alpha / Shadow Trader Investigation',
    description: 'Investigation into potential alias relationship between Vendor_Alpha and Shadow_Trader based on stylometric analysis, wallet linkage, and behavioural patterns.',
    status: 'OPEN',
    priority: 'HIGH',
    leadIds: [lead._id],
    vendorIds: [vendorAlpha._id, vendorShadow._id],
    messageIds: lead.messageIds,
    walletAddresses: [alphaWallet.address, shadowWallet.address],
    dataSource: 'DEMO',
  });

  // Link lead to case
  await Lead.updateOne({ _id: lead._id }, { acceptedIntoCaseId: caseDoc._id });

  console.log(`[Seed] Created case: ${caseDoc.caseNumber}`);

  // ── Historical Evidence ──────────────────────────
  await HistoricalEvidence.create({
    title: 'Prior tip: Alpha_OG alias used on another platform',
    description: 'Anonymous tip received indicating that the alias "Alpha_OG" has been used on a separate marketplace. Username matches one of Vendor_Alpha\'s known aliases.',
    sourceType: 'TIP',
    relatedVendorIds: [vendorAlpha._id],
    content: 'Tipster indicated Alpha_OG was active on platform X in 2025 with similar listing patterns.',
    dataSource: 'DEMO',
  });

  // ── Neo4j Graph ──────────────────────────────────
  try {
    await neo4jService.upsertVendor(vendorAlpha);
    await neo4jService.upsertVendor(vendorShadow);
    await neo4jService.upsertVendor(vendorClean);
    await neo4jService.upsertChannel(channel);
    await neo4jService.upsertWallet(alphaWallet);
    await neo4jService.upsertWallet(shadowWallet);
    await neo4jService.upsertCase(caseDoc);

    // Messages (just a few representative ones)
    for (const msg of allMsgDocs.slice(0, 5)) {
      await neo4jService.upsertMessage(msg);
      if (msg.vendorId) await neo4jService.vendorPostedMessage(msg.vendorId.toString(), msg._id.toString());
    }

    // Relationships
    await neo4jService.vendorUsesWallet(vendorAlpha._id.toString(), alphaWallet.address);
    await neo4jService.vendorUsesWallet(vendorShadow._id.toString(), shadowWallet.address);
    await neo4jService.similarWritingStyle(vendorAlpha._id.toString(), vendorShadow._id.toString(), stylometryResult.overallSimilarity || 0.7);
    await neo4jService.possibleAlias(vendorAlpha._id.toString(), vendorShadow._id.toString(), stylometryResult.overallSimilarity || 0.7);
    await neo4jService.walletTransferredTo(alphaWallet.address, shadowWallet.address);
    await neo4jService.partOfCase('Vendor', 'mongoId', vendorAlpha._id.toString(), caseDoc._id.toString());
    await neo4jService.partOfCase('Vendor', 'mongoId', vendorShadow._id.toString(), caseDoc._id.toString());
    await neo4jService.partOfCase('Wallet', 'address', alphaWallet.address, caseDoc._id.toString());

    console.log('[Seed] Neo4j graph populated.');
  } catch (err) {
    console.warn('[Seed] Neo4j graph population skipped:', err.message);
  }

  // ── Report ───────────────────────────────────────
  let report;
  try {
    report = await generateReport(caseDoc._id);
    console.log(`[Seed] Report generated: SHA-256 ${report.sha256Hash.substring(0, 16)}...`);
  } catch (err) {
    console.warn('[Seed] Report generation skipped:', err.message);
  }

  // ── Audit chain ──────────────────────────────────
  await appendAuditEntry({ caseId: caseDoc._id, eventType: 'CASE_CREATED', actor: 'system', payload: { caseNumber: caseDoc.caseNumber } });
  await appendAuditEntry({ caseId: caseDoc._id, eventType: 'LEAD_ACCEPTED', actor: 'investigator', payload: { leadId: lead._id.toString(), leadTitle: lead.title } });
  await appendAuditEntry({ caseId: caseDoc._id, eventType: 'EVIDENCE_ADDED', actor: 'system', payload: { type: 'stylometry', similarity: stylometryResult.overallSimilarity } });
  if (report) {
    await appendAuditEntry({ caseId: caseDoc._id, eventType: 'REPORT_GENERATED', actor: 'system', payload: { reportId: report._id.toString(), sha256: report.sha256Hash } });
  }

  console.log('[Seed] Audit chain created (4 entries).');

  return {
    channel: channel._id,
    vendors: { alpha: vendorAlpha._id, shadow: vendorShadow._id, clean: vendorClean._id },
    messages: allMsgDocs.length,
    wallets: { alpha: alphaWallet.address, shadow: shadowWallet.address },
    stylometry: { level: stylometryResult.level, similarity: stylometryResult.overallSimilarity },
    correlation: correlationResult,
    lead: lead._id,
    case: caseDoc._id,
    report: report?._id,
  };
}
