import config from '../config/index.js';
import { extractSignals, normalizeText } from '../utils/signalExtractor.js';

/**
 * Gemini Service — AI Intelligence & Multilingual Contextual Classifier.
 *
 * IMPORTANT:
 * - This service receives PRE-DECODED text.
 * - Encoding detection/decoding must happen upstream in messagePipeline.service.js.
 * - Vendor historical risk is contextual information only and MUST NOT modify
 *   the individual message risk score.
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


async function callGemini(prompt, systemInstruction = '') {
  if (!config.gemini.apiKey) {
    return {
      fallback: true,
      text: null,
      error: 'Gemini API key not configured'
    };
  }

  try {
    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const res = await fetch(
      `${GEMINI_URL}?key=${config.gemini.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      const errText = await res.text();

      return {
        fallback: true,
        text: null,
        error: `Gemini API error ${res.status}: ${errText}`
      };
    }

    const data = await res.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      fallback: false,
      text
    };

  } catch (err) {
    return {
      fallback: true,
      text: null,
      error: err.message
    };
  }
}


/**
 * Classify a PRE-DECODED message using Gemini + deterministic evidence.
 *
 * Vendor history is contextual information only.
 * It MUST NOT directly increase or decrease message risk.
 */
export async function classifyMessage(decodedText, vendorHistory = null) {

  if (!decodedText || !decodedText.trim()) {
    return {
      label: 'BENIGN',
      riskScore: 0,
      confidence: 1.0,
      signals: [],
      reasons: ['Message contains no meaningful text.'],
      modelUsed: 'deterministic-empty-message'
    };
  }

  const normalized = normalizeText(decodedText);

  const signalEvidence = extractSignals(decodedText);

  const systemInstruction = `
You are a digital intelligence and risk-analysis assistant.

You analyze synthetic Telegram messages for potential illicit marketplace
activity, including drug sales, contraband trading, and other illicit
transactions.

You understand:

- English
- Hindi
- Hinglish
- Punjabi
- Tamil
- transliterated Indian languages
- mixed-language messages
- marketplace slang
- coded terminology
- abbreviated transaction language

IMPORTANT PRINCIPLES:

1. CLASSIFY THE CURRENT MESSAGE, NOT THE VENDOR.

The vendor's historical risk profile is contextual information only.

Never increase the message risk score merely because the sender has
previously sent suspicious messages.

For example:

"hello"

must remain BENIGN with very low message risk even if the vendor itself
has a HIGH historical risk score.

Vendor risk and message risk are separate concepts.

2. DO NOT RELY ON SINGLE GENERIC KEYWORDS.

Words such as:

"maal"
"fresh"
"stock"
"rate"
"DM"
"cash"
"COD"

are contextual signals and are not automatically evidence of illicit activity.

3. STRONG SIGNALS REQUIRE MORE ATTENTION.

Explicit references to illicit substances, especially when combined with
availability, quantity, pricing, purchase solicitation, delivery or
private-contact language, substantially increase suspicion.

For example:

"Drug fresh stock available, DM to buy"

is substantially more suspicious than:

"Drug awareness seminar tomorrow."

4. UNDERSTAND SEMANTIC MEANING ACROSS LANGUAGES.

Do not require exact English keywords.

For example, these concepts should be understood as related:

"maal aa gaya"
"माल आ गया है"
"fresh maal available"
"माल उपलब्ध है"

Likewise:

"rate wahi purana"
"रेट वही पुराना है"

represents pricing discussion.

"jisko chahiye DM kar"
"जिसको चाहिए DM कर दे"

represents purchase/private-contact solicitation.

"cash on delivery available"
"केवल कैश ऑन डिलीवरी उपलब्ध है"

represents payment/delivery language.

5. SIGNALS ARE EVIDENCE, NOT CONCLUSIONS.

Use the complete message context.

Do not classify legitimate commercial activity as illicit merely because
it contains words such as "fresh", "stock", "price", "DM", or "COD".

However, legitimate-commerce interpretation must not automatically override
explicit illicit-substance references combined with transactional behavior.

6. DISTINGUISH THE THREE LABELS.

BENIGN:
Normal conversation, ordinary communication, legitimate commerce, or
messages with no meaningful suspicious evidence.

NEEDS_REVIEW:
Ambiguous messages containing several contextual indicators where illicit
intent is possible but not sufficiently established.

SUSPICIOUS:
Strong contextual evidence of illicit marketplace activity, especially
when explicit/coded product references combine with transactional behavior.

7. RISK SCORE.

Risk score must represent the CURRENT MESSAGE ONLY.

Do not add vendor historical risk to it.

Approximate interpretation:

0-20   = very low risk
21-40  = low/moderate ambiguity
41-60  = meaningful concern
61-80  = high concern
81-100 = very high concern

8. LEGITIMATE COMMERCIAL CONTEXT.

Examples such as:

"Fresh mangoes available. DM for price. COD available."

should normally be BENIGN if there is clear evidence that the product is
ordinary/legal.

However:

"Drug fresh stock available. DM to buy. COD."

should be treated as suspicious because the explicit substance reference
changes the context.

RETURN ONLY VALID JSON:

{
  "label": "BENIGN" | "NEEDS_REVIEW" | "SUSPICIOUS",
  "riskScore": number,
  "confidence": number,
  "signals": [],
  "reasons": []
}

Do not include markdown.
Do not include commentary outside the JSON.
`;

  const promptInput = {
    message: decodedText,
    normalizedMessage: normalized,

    deterministicEvidence: {
      signals: signalEvidence.signals,
      preliminaryScore: signalEvidence.preliminaryScore,
      isLegitimateCommercial: signalEvidence.isLegitimateCommercial,
      extractedTerms: signalEvidence.extractedTerms
    },

    vendorContext: vendorHistory
      ? {
          historicalRisk: vendorHistory.historicalRisk,
          suspiciousMessageCount:
            vendorHistory.suspiciousMessageCount,
          totalMessageCount:
            vendorHistory.totalMessageCount
        }
      : null
  };

  const result = await callGemini(
    `Analyze the following message:\n\n${JSON.stringify(
      promptInput,
      null,
      2
    )}`,
    systemInstruction
  );

  if (result.fallback) {
    return deterministicFallbackClassify(
      decodedText,
      signalEvidence
    );
  }

  try {

    const cleaned = result.text
      .replace(/```json\n?/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const label = [
      'SUSPICIOUS',
      'NEEDS_REVIEW',
      'BENIGN'
    ].includes(parsed.label)
      ? parsed.label
      : 'BENIGN';

    const riskScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          Number.isFinite(parsed.riskScore)
            ? parsed.riskScore
            : signalEvidence.preliminaryScore
        )
      )
    );

    const confidence = Math.min(
      1,
      Math.max(
        0,
        Number.isFinite(parsed.confidence)
          ? parsed.confidence
          : 0.8
      )
    );

    return {
      label,
      riskScore,
      confidence,
      signals: Array.isArray(parsed.signals)
        ? parsed.signals
        : signalEvidence.signals,

      reasons:
        Array.isArray(parsed.reasons) &&
        parsed.reasons.length > 0
          ? parsed.reasons
          : [signalEvidence.summary],

      modelUsed: 'gemini-2.0-flash'
    };

  } catch (err) {

    console.error(
      '[Gemini] Invalid JSON response:',
      err.message
    );

    return deterministicFallbackClassify(
      decodedText,
      signalEvidence
    );
  }
}


/**
 * Deterministic fallback classifier.
 *
 * IMPORTANT:
 * Vendor history is intentionally NOT passed here.
 * Message risk and vendor risk are separate.
 */
function deterministicFallbackClassify(
  text,
  signalEvidence
) {

  const {
    signals = [],
    preliminaryScore = 0,
    isLegitimateCommercial = false
  } = signalEvidence;

  const signalSet = new Set(signals);

  let riskScore = preliminaryScore;
  let label = 'BENIGN';
  let confidence = 0.75;

  const reasons = [];

  /*
   * Strong evidence
   */

  const hasExplicitSubstance =
    signalSet.has('explicit_illicit_substance_reference');

  const hasCodedProduct =
    signalSet.has('coded_product_reference');

  const hasAvailability =
    signalSet.has('availability_language');

  const hasPricing =
    signalSet.has('pricing_discussion');

  const hasPurchase =
    signalSet.has('purchase_solicitation');

  const hasPrivateContact =
    signalSet.has('private_contact_solicitation');

  const hasPayment =
    signalSet.has('delivery_payment_language');

  const hasQuantity =
    signalSet.has('quantity_reference');

  const transactionalSignals = [
    hasAvailability,
    hasPricing,
    hasPurchase,
    hasPrivateContact,
    hasPayment
  ].filter(Boolean).length;


  /*
   * Legitimate commerce gets protection,
   * but explicit illicit substance + transaction context overrides it.
   */

  if (
    isLegitimateCommercial &&
    !hasExplicitSubstance &&
    !hasCodedProduct
  ) {

    label = 'BENIGN';

    riskScore = Math.min(
      20,
      Math.max(0, preliminaryScore)
    );

    confidence = 0.90;

    reasons.push(
      'Message is consistent with legitimate commercial activity.'
    );

  }

  /*
   * Explicit illicit substance + transaction context
   */

  else if (
    hasExplicitSubstance &&
    transactionalSignals >= 1
  ) {

    label = 'SUSPICIOUS';

    riskScore = Math.max(
      75,
      preliminaryScore
    );

    confidence = 0.90;

    reasons.push(
      'Explicit illicit-substance reference combined with transactional or marketplace language.'
    );

  }

  /*
   * Strong coded marketplace combination
   */

  else if (
    hasCodedProduct &&
    transactionalSignals >= 2
  ) {

    label = 'SUSPICIOUS';

    riskScore = Math.max(
      70,
      preliminaryScore
    );

    confidence = 0.85;

    reasons.push(
      'Coded product terminology is combined with multiple marketplace transaction signals.'
    );

  }

  /*
   * Explicit substance without transaction context
   */

  else if (hasExplicitSubstance) {

    label = 'NEEDS_REVIEW';

    riskScore = Math.max(
      45,
      preliminaryScore
    );

    confidence = 0.80;

    reasons.push(
      'Message explicitly references a potentially illicit substance but lacks sufficient transactional context.'
    );

  }

  /*
   * Multiple contextual signals
   */

  else if (
    signals.length >= 3 &&
    transactionalSignals >= 2
  ) {

    label = 'NEEDS_REVIEW';

    riskScore = Math.max(
      50,
      preliminaryScore
    );

    confidence = 0.75;

    reasons.push(
      `Multiple contextual marketplace signals detected: ${signals.join(', ')}.`
    );

  }

  /*
   * Two contextual signals
   */

  else if (signals.length >= 2) {

    label = 'NEEDS_REVIEW';

    riskScore = Math.max(
      30,
      preliminaryScore
    );

    confidence = 0.70;

    reasons.push(
      `Multiple contextual signals detected: ${signals.join(', ')}.`
    );

  }

  /*
   * One weak signal
   */

  else if (signals.length === 1) {

    label = 'BENIGN';

    riskScore = Math.min(
      20,
      preliminaryScore
    );

    confidence = 0.85;

    reasons.push(
      `Only one weak contextual signal detected (${signals[0]}).`
    );

  }

  /*
   * No signals
   */

  else {

    label = 'BENIGN';

    riskScore = 2;

    confidence = 0.95;

    reasons.push(
      'No significant suspicious contextual signals detected.'
    );
  }


  return {
    label,
    riskScore: Math.min(100, Math.max(0, riskScore)),
    confidence,
    signals,
    reasons,
    modelUsed: 'deterministic-signal-fallback'
  };
}


/**
 * Generate an explanation for an investigative finding.
 */
export async function generateExplanation(context) {

  const result = await callGemini(
    `Provide a brief, professional investigative summary for the following context. Keep it under 3 sentences:\n\n${JSON.stringify(context)}`,
    'You are an intelligence analyst assistant. Provide factual, measured summaries. Never present findings as proof of criminality.'
  );

  if (result.fallback) {
    return 'AI-generated explanation unavailable. Review the raw evidence data.';
  }

  return result.text;
}


export default {
  classifyMessage,
  generateExplanation
};