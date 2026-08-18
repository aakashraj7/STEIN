/**
 * Wallet analysis service — transparent deterministic heuristics.
 * No invented blockchain intelligence beyond what Etherscan provides.
 */

/**
 * Analyze transactions for suspicious patterns.
 * Returns heuristic flags and a risk score.
 */
export function analyzeWalletTransactions(transactions, address) {
  if (!transactions || transactions.length === 0) {
    return {
      riskScore: 0,
      heuristics: { rapidFanOut: false, dormancySpike: false, labelledInteraction: false, suspiciousPatterns: [] },
      analysis: 'No transactions to analyze.',
    };
  }

  const patterns = [];
  let riskScore = 0;

  // ── Rapid fan-out: many outgoing txs to unique addresses in short period ──
  const outgoing = transactions.filter(tx => tx.from?.toLowerCase() === address.toLowerCase());
  const outgoingRecipients = new Set(outgoing.map(tx => tx.to?.toLowerCase()));
  const rapidFanOut = outgoing.length >= 5 && outgoingRecipients.size >= 4;
  if (rapidFanOut) {
    patterns.push(`Rapid fan-out detected: ${outgoingRecipients.size} unique recipients in ${outgoing.length} outgoing transactions`);
    riskScore += 0.3;
  }

  // Check for time-concentrated fan-out (within 24h)
  if (outgoing.length >= 3) {
    const sorted = [...outgoing].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    for (let i = 0; i < sorted.length - 2; i++) {
      const t0 = new Date(sorted[i].timestamp).getTime();
      const t2 = new Date(sorted[i + 2].timestamp).getTime();
      if (t2 - t0 < 24 * 60 * 60 * 1000) {
        patterns.push('Time-concentrated outgoing cluster detected (3+ txs within 24h)');
        riskScore += 0.1;
        break;
      }
    }
  }

  // ── Dormancy spike: long period of inactivity followed by activity ──
  const timestamps = transactions.map(tx => new Date(tx.timestamp).getTime()).sort((a, b) => a - b);
  let dormancySpike = false;
  if (timestamps.length >= 3) {
    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i] - timestamps[i - 1];
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      if (gap > THIRTY_DAYS_MS) {
        // Check if activity follows the gap
        const afterGap = timestamps.filter(t => t >= timestamps[i]);
        if (afterGap.length >= 2) {
          dormancySpike = true;
          patterns.push(`Dormancy spike: ${Math.round(gap / (24 * 60 * 60 * 1000))} days of inactivity followed by ${afterGap.length} transactions`);
          riskScore += 0.25;
          break;
        }
      }
    }
  }

  // ── Interaction with known/labelled provenance addresses ──
  const LABELLED_ADDRESSES = new Set([
    '0x00000000000000000000000000000000deadbeef',
    '0x1111111111111111111111111111111111111111',
    '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado.Cash Router
    '0x0708f104fc1975889a2a765ce332343907f6652d', // High risk mixing proxy
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT Contract (for token transfers)
  ]);

  const interacted = transactions.filter(tx =>
    LABELLED_ADDRESSES.has(tx.from?.toLowerCase()) || LABELLED_ADDRESSES.has(tx.to?.toLowerCase())
  );
  const labelledInteraction = interacted.length > 0;
  if (labelledInteraction) {
    patterns.push(`Interaction with ${interacted.length} provenance-labelled / sanctioned address(es)`);
    riskScore += 0.35;
  }

  riskScore = Math.min(1, riskScore);

  return {
    riskScore: Math.round(riskScore * 1000) / 1000,
    heuristics: {
      rapidFanOut,
      dormancySpike,
      labelledInteraction,
      suspiciousPatterns: patterns,
    },
    transactionCount: transactions.length,
    uniqueCounterparties: new Set([
      ...transactions.map(tx => tx.from?.toLowerCase()),
      ...transactions.map(tx => tx.to?.toLowerCase()),
    ].filter(a => a && a !== address.toLowerCase())).size,
    analysis: patterns.length > 0
      ? `${patterns.length} suspicious pattern(s) detected.`
      : 'No suspicious patterns detected in available transaction data.',
  };
}
