import { createHash } from 'node:crypto';

/**
 * SHA-256 hash of a string.
 */
export function sha256(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Canonical JSON: deterministic serialization (sorted keys).
 */
export function canonicalJson(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Hash a canonical JSON object: canonicalize then SHA-256.
 */
export function hashCanonical(obj) {
  const canon = canonicalJson(obj);
  return { canonical: canon, hash: sha256(canon) };
}
