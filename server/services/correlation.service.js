import config from '../config/index.js';

/**
 * Correlation service — combines independent signals into an investigative priority score.
 * The score is an investigative prioritization score, NOT a probability of guilt.
 */

/**
 * Calculate correlation score from individual signals.
 * Each signal should be 0–1.
 */
export function calculateCorrelationScore(signals) {
  const {
    listingSignal = 0,
    stylometrySignal = 0,
    walletSignal = 0,
    behaviourOverlap = 0,
  } = signals;

  const weights = config.correlation;

  const score =
    listingSignal * weights.listingSignal +
    stylometrySignal * weights.stylometry +
    walletSignal * weights.walletSignal +
    behaviourOverlap * weights.behaviourOverlap;

  // Clamp 0–1
  const clamped = Math.max(0, Math.min(1, score));

  let priority;
  if (clamped >= 0.75) priority = 'CRITICAL';
  else if (clamped >= 0.5) priority = 'HIGH';
  else if (clamped >= 0.25) priority = 'MEDIUM';
  else priority = 'LOW';

  return {
    score: Math.round(clamped * 1000) / 1000,
    priority,
    breakdown: {
      listingSignal: { value: listingSignal, weight: weights.listingSignal },
      stylometrySignal: { value: stylometrySignal, weight: weights.stylometry },
      walletSignal: { value: walletSignal, weight: weights.walletSignal },
      behaviourOverlap: { value: behaviourOverlap, weight: weights.behaviourOverlap },
    },
    note: 'This score is an investigative prioritization metric. It is NOT a probability of guilt, criminality, or identity.',
  };
}
