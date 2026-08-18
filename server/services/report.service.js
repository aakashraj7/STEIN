import Case from '../models/case.model.js';
import Lead from '../models/lead.model.js';
import Vendor from '../models/vendor.model.js';
import Message from '../models/message.model.js';
import Wallet from '../models/wallet.model.js';
import Report from '../models/report.model.js';
import { hashCanonical } from '../utils/hash.js';

/**
 * Build a canonical JSON representation of a case for integrity hashing.
 */
export function buildCanonicalReport(caseData) {
  const canonical = {
    caseNumber: caseData.caseNumber,
    title: caseData.title,
    description: caseData.description,
    status: caseData.status,
    priority: caseData.priority,
    createdAt: caseData.createdAt?.toISOString?.() || caseData.createdAt,
    vendors: (caseData.vendors || []).map(v => ({
      name: v.name,
      aliases: v.aliases || [],
      riskLevel: v.riskLevel,
    })),
    messages: (caseData.messages || []).map(m => ({
      text: m.text,
      classification: m.classification?.label,
      timestamp: m.timestamp?.toISOString?.() || m.timestamp,
    })),
    wallets: (caseData.wallets || []).map(w => ({
      address: w.address,
      riskScore: w.riskScore,
      heuristics: w.heuristics?.suspiciousPatterns || [],
    })),
    leads: (caseData.leads || []).map(l => ({
      title: l.title,
      type: l.type,
      status: l.status,
      correlationScore: l.correlationScore,
    })),
  };

  return canonical;
}

/**
 * Generate a report from a case.
 */
export async function generateReport(caseId) {
  const caseDoc = await Case.findById(caseId).lean();
  if (!caseDoc) throw Object.assign(new Error('Case not found'), { status: 404 });

  // Fetch related data
  const [leads, vendors, messages, wallets] = await Promise.all([
    Lead.find({ _id: { $in: caseDoc.leadIds || [] } }).lean(),
    Vendor.find({ _id: { $in: caseDoc.vendorIds || [] } }).lean(),
    Message.find({ _id: { $in: caseDoc.messageIds || [] } }).lean(),
    Wallet.find({ address: { $in: caseDoc.walletAddresses || [] } }).lean(),
  ]);

  const caseData = { ...caseDoc, leads, vendors, messages, wallets };
  const canonical = buildCanonicalReport(caseData);
  const { canonical: canonicalStr, hash } = hashCanonical(canonical);

  // Build human-readable sections
  const sections = [
    { heading: 'Case Overview', content: `${caseDoc.title}\n${caseDoc.description || ''}\nStatus: ${caseDoc.status} | Priority: ${caseDoc.priority}` },
    { heading: 'Vendors', content: vendors.map(v => `• ${v.name} (Risk: ${v.riskLevel}) Aliases: ${(v.aliases || []).join(', ') || 'None'}`).join('\n') || 'None' },
    { heading: 'Messages', content: `${messages.length} message(s) linked to this case.` },
    { heading: 'Wallet Intelligence', content: wallets.map(w => `• ${w.address} (Risk: ${w.riskScore})`).join('\n') || 'None' },
    { heading: 'Leads', content: leads.map(l => `• ${l.title} [${l.status}] Score: ${l.correlationScore}`).join('\n') || 'None' },
  ];

  const report = await Report.create({
    caseId: caseDoc._id,
    caseNumber: caseDoc.caseNumber,
    title: `Investigation Report — ${caseDoc.title}`,
    canonicalJson: canonicalStr,
    sha256Hash: hash,
    summary: `Report for case ${caseDoc.caseNumber} generated at ${new Date().toISOString()}. Contains ${vendors.length} vendor(s), ${messages.length} message(s), ${wallets.length} wallet(s), ${leads.length} lead(s).`,
    sections,
  });

  return report;
}

/**
 * Verify a report's integrity by re-hashing its canonical JSON.
 */
export function verifyReport(report) {
  const { hash } = hashCanonical(JSON.parse(report.canonicalJson));
  return {
    valid: hash === report.sha256Hash,
    storedHash: report.sha256Hash,
    recalculatedHash: hash,
    match: hash === report.sha256Hash,
  };
}
