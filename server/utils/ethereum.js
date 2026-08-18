/**
 * Ethereum address utilities.
 */

// Matches 0x followed by 40 hex chars
const ETH_ADDRESS_RE = /\b(0x[0-9a-fA-F]{40})\b/g;

/**
 * Extract all Ethereum addresses from text.
 */
export function extractEthAddresses(text) {
  if (!text) return [];
  const matches = text.match(ETH_ADDRESS_RE);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Validate that a string is a well-formed Ethereum address.
 */
export function isValidEthAddress(address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Detect Monero (XMR) mentions — NOT addresses for tracing.
 * We only flag references for informational purposes.
 */
const XMR_MENTION_RE = /\b(XMR|Monero|monero)\b/gi;

export function detectXmrMentions(text) {
  if (!text) return [];
  const matches = text.match(XMR_MENTION_RE);
  return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
}
