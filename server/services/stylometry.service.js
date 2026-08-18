import config from '../config/index.js';
import { cosineSimilarity } from '../utils/cosine.js';

/**
 * Stylometry service — pure Node.js statistical feature analysis.
 * NO Gemini usage here.
 */

// Common English function words
const FUNCTION_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'can', 'no', 'just', 'him', 'how', 'its', 'also', 'your', 'very',
  'bro', 'dm', 'msg', 'yo', 'bruh', 'fam', 'nah', 'yeah', 'gonna', 'wanna',
];

/**
 * Extract character n-grams (bigrams and trigrams) frequency map.
 */
function charNgrams(text, n = 3) {
  const freq = {};
  const lower = text.toLowerCase();
  for (let i = 0; i <= lower.length - n; i++) {
    const gram = lower.substring(i, i + n);
    freq[gram] = (freq[gram] || 0) + 1;
  }
  // Normalize
  const total = Object.values(freq).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(freq)) freq[k] /= total;
  return freq;
}

/**
 * Extract a writing-style fingerprint from an array of messages.
 */
export function extractFeatures(messages) {
  if (!messages || messages.length < config.stylometry.minMessages) {
    return { status: 'INSUFFICIENT_TEXT', messageCount: messages?.length || 0 };
  }

  const texts = messages.map(m => (typeof m === 'string' ? m : m.text || '')).filter(Boolean);
  if (texts.length < config.stylometry.minMessages) {
    return { status: 'INSUFFICIENT_TEXT', messageCount: texts.length };
  }

  const allText = texts.join(' ');
  const words = allText.split(/\s+/).filter(Boolean);
  const totalChars = allText.length;

  // ── Basic metrics ──────────────────────────────
  const msgLengths = texts.map(t => t.length);
  const avgMessageLength = msgLengths.reduce((a, b) => a + b, 0) / msgLengths.length;
  const wordCounts = texts.map(t => t.split(/\s+/).filter(Boolean).length);
  const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

  // ── Punctuation frequency ──────────────────────
  const punctCount = (allText.match(/[.,;:!?\-()[\]{}'"]/g) || []).length;
  const punctFreq = punctCount / (totalChars || 1);

  const ellipsisCount = (allText.match(/\.{3}|…/g) || []).length;
  const ellipsisFreq = ellipsisCount / (texts.length || 1);

  const questionCount = (allText.match(/\?/g) || []).length;
  const questionFreq = questionCount / (texts.length || 1);

  const exclamationCount = (allText.match(/!/g) || []).length;
  const exclamationFreq = exclamationCount / (texts.length || 1);

  // ── Emoji frequency ────────────────────────────
  const emojiCount = (allText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  const emojiFreq = emojiCount / (texts.length || 1);

  // ── Character ratios ───────────────────────────
  const upperCount = (allText.match(/[A-Z]/g) || []).length;
  const upperRatio = upperCount / (totalChars || 1);

  const digitCount = (allText.match(/[0-9]/g) || []).length;
  const digitRatio = digitCount / (totalChars || 1);

  // ── Function-word frequencies ──────────────────
  const wordLower = words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
  const totalWords = wordLower.length || 1;
  const functionWordFreqs = {};
  for (const fw of FUNCTION_WORDS) {
    const count = wordLower.filter(w => w === fw).length;
    functionWordFreqs[fw] = count / totalWords;
  }

  // ── Character n-gram style ─────────────────────
  const trigramFreq = charNgrams(allText, 3);

  // ── Repeated formatting habits ─────────────────
  const allCapsWordRatio = words.filter(w => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)).length / totalWords;
  const repeatedCharRatio = (allText.match(/(.)\1{2,}/g) || []).length / (texts.length || 1);

  return {
    status: 'OK',
    messageCount: texts.length,
    features: {
      basic: {
        avgMessageLength,
        avgWordCount,
      },
      punctuation: {
        punctFreq,
        ellipsisFreq,
        questionFreq,
        exclamationFreq,
      },
      emoji: {
        emojiFreq,
      },
      characterRatios: {
        upperRatio,
        digitRatio,
      },
      functionWords: functionWordFreqs,
      ngramStyle: trigramFreq,
      formatting: {
        allCapsWordRatio,
        repeatedCharRatio,
      },
    },
  };
}

/**
 * Convert a fingerprint's features into a flat numeric vector.
 * Both fingerprints must use the same key ordering.
 */
function featuresToVector(features, allKeys) {
  return allKeys.map(k => features[k] || 0);
}

/**
 * Flatten features object into { key: value } pairs.
 */
function flattenFeatures(features) {
  const flat = {};

  // Basic
  flat['basic.avgMessageLength'] = features.basic.avgMessageLength;
  flat['basic.avgWordCount'] = features.basic.avgWordCount;

  // Punctuation
  for (const [k, v] of Object.entries(features.punctuation)) flat[`punct.${k}`] = v;

  // Emoji
  flat['emoji.emojiFreq'] = features.emoji.emojiFreq;

  // Character ratios
  for (const [k, v] of Object.entries(features.characterRatios)) flat[`char.${k}`] = v;

  // Function words
  for (const [k, v] of Object.entries(features.functionWords)) flat[`fw.${k}`] = v;

  // Formatting
  for (const [k, v] of Object.entries(features.formatting)) flat[`fmt.${k}`] = v;

  // N-grams (top 50 only to keep vector reasonable)
  const ngramEntries = Object.entries(features.ngramStyle);
  ngramEntries.sort((a, b) => b[1] - a[1]);
  for (const [k, v] of ngramEntries.slice(0, 50)) flat[`ng.${k}`] = v;

  return flat;
}

/**
 * Compare two feature sets and produce similarity analysis.
 */
export function compareFingerprints(fpA, fpB) {
  if (fpA.status !== 'OK' || fpB.status !== 'OK') {
    return {
      status: 'INSUFFICIENT_TEXT',
      message: `Cannot compare: Vendor A has ${fpA.messageCount} messages, Vendor B has ${fpB.messageCount} messages. Minimum required: ${config.stylometry.minMessages}.`,
    };
  }

  const flatA = flattenFeatures(fpA.features);
  const flatB = flattenFeatures(fpB.features);

  // Union of all keys
  const allKeys = [...new Set([...Object.keys(flatA), ...Object.keys(flatB)])].sort();

  const vecA = featuresToVector(flatA, allKeys);
  const vecB = featuresToVector(flatB, allKeys);

  const overallSimilarity = cosineSimilarity(vecA, vecB);

  // ── Feature-group similarities ─────────────────
  const groups = {
    basic: (k) => k.startsWith('basic.'),
    punctuation: (k) => k.startsWith('punct.'),
    emoji: (k) => k.startsWith('emoji.'),
    characterRatios: (k) => k.startsWith('char.'),
    functionWords: (k) => k.startsWith('fw.'),
    formatting: (k) => k.startsWith('fmt.'),
    ngramStyle: (k) => k.startsWith('ng.'),
  };

  const groupSimilarities = {};
  for (const [groupName, filterFn] of Object.entries(groups)) {
    const groupKeys = allKeys.filter(filterFn);
    if (groupKeys.length === 0) {
      groupSimilarities[groupName] = 0;
      continue;
    }
    const gA = featuresToVector(flatA, groupKeys);
    const gB = featuresToVector(flatB, groupKeys);
    groupSimilarities[groupName] = cosineSimilarity(gA, gB);
  }

  // ── Similarity level ───────────────────────────
  let level;
  if (overallSimilarity >= 0.85) level = 'HIGH_INDICATIVE_SIMILARITY';
  else if (overallSimilarity >= 0.65) level = 'MODERATE_SIMILARITY';
  else if (overallSimilarity >= 0.4) level = 'LOW_SIMILARITY';
  else level = 'MINIMAL_SIMILARITY';

  // ── Human-readable explanations ────────────────
  const explanations = [];

  if (groupSimilarities.punctuation > 0.8)
    explanations.push('Similar punctuation patterns detected');
  if (groupSimilarities.basic > 0.8)
    explanations.push('Similar message-length distribution');
  if (groupSimilarities.functionWords > 0.8)
    explanations.push('Similar function-word usage patterns');
  if (groupSimilarities.ngramStyle > 0.7)
    explanations.push('Similar character n-gram writing style');
  if (groupSimilarities.formatting > 0.7)
    explanations.push('Similar repeated formatting/capitalization habits');
  if (groupSimilarities.emoji > 0.8)
    explanations.push('Similar emoji usage frequency');
  if (groupSimilarities.characterRatios > 0.8)
    explanations.push('Similar uppercase and digit ratio');

  if (explanations.length === 0) {
    explanations.push('No strong feature-group similarities detected');
  }

  return {
    status: 'OK',
    overallSimilarity: Math.round(overallSimilarity * 1000) / 1000,
    level,
    groupSimilarities: Object.fromEntries(
      Object.entries(groupSimilarities).map(([k, v]) => [k, Math.round(v * 1000) / 1000])
    ),
    explanations,
    note: 'Stylometric similarity is ONE investigative signal. It does NOT indicate probability that two accounts belong to the same person.',
    vendorAMessages: fpA.messageCount,
    vendorBMessages: fpB.messageCount,
  };
}
