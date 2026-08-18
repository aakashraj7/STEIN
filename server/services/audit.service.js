import { sha256 } from '../utils/hash.js';
import { randomUUID } from 'node:crypto';
import AuditLog from '../models/auditLog.model.js';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Build the hash input string for an audit entry.
 */
function buildHashInput(entry) {
  return JSON.stringify({
    eventId: entry.eventId,
    caseId: entry.caseId?.toString() || null,
    eventType: entry.eventType,
    actor: entry.actor,
    timestamp: entry.timestamp.toISOString(),
    payload: entry.payload,
    previousHash: entry.previousHash,
  });
}

/**
 * Append a new entry to the audit chain.
 */
export async function appendAuditEntry({ caseId, eventType, actor, payload }) {
  // Get last entry to find previous hash
  const lastEntry = await AuditLog.findOne().sort({ timestamp: -1, _id: -1 }).lean();
  const previousHash = lastEntry ? lastEntry.currentHash : GENESIS_HASH;

  const entry = {
    eventId: randomUUID(),
    caseId: caseId || null,
    eventType,
    actor,
    timestamp: new Date(),
    payload,
    previousHash,
  };

  // Calculate current hash
  entry.currentHash = sha256(buildHashInput(entry));

  const doc = await AuditLog.create(entry);
  return doc;
}

/**
 * Verify the integrity of the entire audit chain.
 * Returns { valid: boolean, entries: number, firstInvalid: number|null, details: string }
 */
export async function verifyAuditChain() {
  const entries = await AuditLog.find().sort({ timestamp: 1, _id: 1 }).lean();

  if (entries.length === 0) {
    return { valid: true, entries: 0, firstInvalid: null, details: 'Audit chain is empty.' };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // 1. Verify previous hash linkage
    const expectedPrevHash = i === 0 ? GENESIS_HASH : entries[i - 1].currentHash;
    if (entry.previousHash !== expectedPrevHash) {
      return {
        valid: false,
        entries: entries.length,
        firstInvalid: i,
        details: `Entry ${i} (eventId: ${entry.eventId}): previousHash mismatch. Expected ${expectedPrevHash.substring(0, 16)}... got ${entry.previousHash.substring(0, 16)}...`,
      };
    }

    // 2. Recalculate and verify current hash
    const recalculated = sha256(buildHashInput(entry));
    if (entry.currentHash !== recalculated) {
      return {
        valid: false,
        entries: entries.length,
        firstInvalid: i,
        details: `Entry ${i} (eventId: ${entry.eventId}): hash mismatch. Data may have been tampered.`,
      };
    }
  }

  return {
    valid: true,
    entries: entries.length,
    firstInvalid: null,
    details: `Audit chain verified: ${entries.length} entries, all hashes valid.`,
  };
}

export { GENESIS_HASH };
