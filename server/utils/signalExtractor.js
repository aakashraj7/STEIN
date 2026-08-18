/**
 * Deterministic Signal Extractor for Telegram Intelligence.
 *
 * IMPORTANT:
 * This module extracts EVIDENCE.
 * It does not independently determine whether a message is illicit.
 *
 * Gemini receives this evidence and performs contextual interpretation.
 */

const SIGNAL_WEIGHTS = {
  explicit_illicit_substance_reference: 40,
  coded_product_reference: 18,
  quantity_reference: 8,
  pricing_discussion: 12,
  availability_language: 10,
  purchase_solicitation: 15,
  private_contact_solicitation: 10,
  delivery_payment_language: 10,
  urgency_language: 5,
  slang_terminology: 5,
  multilingual_expression: 2,
  ambiguous_product_reference: 12,
};

const PATTERNS = {
  /*
   * Explicit substance references.
   *
   * "drug" is intentionally included, but context is still required
   * before final classification.
   */
  explicit_illicit_substance_reference: [
    /\b(drug|drugs)\b/i,
    /\b(weed|hash|cocaine|coke|heroin|opium|afeem|ganja|charas|chitta)\b/i,
    /\b(mdma|ecstasy|mephedrone|meth|ice|lsd|acid|ketamine|shrooms)\b/i,
    /brown\s*sugar/i,
  ],

  /*
   * Coded / ambiguous marketplace terminology.
   */
  coded_product_reference: [
    /\b(maal|stuff|score|plug|supply|consignment|batch)\b/i,
    /\b(fresh\s+maal|maal\s+available|maal\s+aa\s*gaya)\b/i,

    // Hindi
    /माल/,
    /स्टॉक/,
    /सामान/,
  ],

  /*
   * Quantity.
   */
  quantity_reference: [
    /\b\d+(?:\.\d+)?\s*(kg|kgs|g|gm|gram|grams|mg|ml|l|litre|liter)\b/i,
    /\b\d+\s*(packet|packets|pack|packs|piece|pieces|pcs)\b/i,
    /\b(one|two|three|four|five)\s+(packet|packets|pack|packs|pieces?)\b/i,
  ],

  /*
   * Pricing.
   */
  pricing_discussion: [
    /\b(rate|price|cost|dam|paisa|paise|rupees?|rs)\b/i,
    /\b(purana\s+rate|rate\s+vahi|rate\s+wahi)\b/i,

    // Hindi
    /रेट/,
    /कीमत/,
    /दाम/,
    /पैसे/,
    /रुपये/,
  ],

  /*
   * Availability / stock.
   */
  availability_language: [
    /\b(available|in\s+stock|fresh\s+stock|fresh|restock(?:ed)?|arrived|landed|ready|just\s+in)\b/i,
    /\b(aa\s+gaya|aa\s+gayi|a\s+gaya|aagaya|vandhuruku|vandhuduchu)\b/i,

    // Hindi
    /आ गया/,
    /आ गई/,
    /उपलब्ध/,
    /नया स्टॉक/,
    /स्टॉक/,
  ],

  /*
   * Purchase intent.
   */
  purchase_solicitation: [
    /\b(buy|purchase|order|grab|get\s+it|take\s+it|available\s+for\s+sale)\b/i,
    /\b(jisko\s+chahiye|jinu\s+chahida|jis\s*ko\s+chahiye)\b/i,
    /\b(venum\s+na|venum|chahiye|chahida)\b/i,

    // Hindi
    /जिसको चाहिए/,
    /जिसे चाहिए/,
    /खरीद/,
    /ले लो/,
    /चाहिए/,
  ],

  /*
   * Private-contact solicitation.
   *
   * IMPORTANT:
   * Generic "message" is NOT included.
   */
  private_contact_solicitation: [
    /\b(dm|dm\s+me|dm\s+kar(?:o|na)?|dm\s+me\s+kar)\b/i,
    /\b(inbox|inbox\s+me|inbox\s+kar(?:o|na)?)\b/i,
    /\b(pm|pm\s+me|hmu|ping\s+me)\b/i,
    /\b(contact\s+me|message\s+me|msg\s+me)\b/i,
    /\b(direct\s+message)\b/i,

    // Hindi
    /डायरेक्ट मैसेज/,
    /डीएम/,
    /मैसेज कर/,
  ],

  /*
   * Payment / delivery.
   */
  delivery_payment_language: [
    /\b(cash\s+on\s+delivery|cod)\b/i,
    /\b(cash\s+only|only\s+cash)\b/i,
    /\b(hand\s+to\s+hand|h2h)\b/i,
    /\b(payment|delivery|wallet|escrow)\b/i,

    // Hindi
    /कैश/,
    /डिलीवरी/,
    /भुगतान/,
  ],

  /*
   * Urgency.
   */
  urgency_language: [
    /\b(as\s+soon\s+as\s+possible|hurry|quickly|urgent|urgently|fast)\b/i,
    /\b(seekarama|sekaram|jaldi|jaldi\s+se)\b/i,

    // Hindi
    /जल्दी/,
    /तुरंत/,
    /फौरन/,
  ],

  /*
   * Slang / coded quality language.
   */
  slang_terminology: [
    /\b(vahi\s+purana|wahi\s+purana|purana\s+wala)\b/i,
    /\b(top\s+shelf|uncut|tested|pure|fire|gas|clean)\b/i,
  ],

  /*
   * Ambiguous products.
   *
   * Important: this is NOT an illicit-substance signal.
   * It means the term needs contextual interpretation.
   */
  ambiguous_product_reference: [
    /brown\s*sugar/i,
    /\b(sugar|powder|stuff|goods)\b/i,
  ],
};


/**
 * Legitimate commercial indicators.
 *
 * These are context signals, NOT automatic exemptions.
 */
const LEGITIMATE_COMMERCIAL_PATTERNS = [
  /\b(mango|mangoes|apple|apples|banana|bananas|vegetables|veggies)\b/i,
  /\b(clothing|clothes|shoes|mobile|laptop|electronics|furniture)\b/i,
  /\b(grocery|restaurant|retail|wholesale|shop|store)\b/i,
  /\b(recipe|cooking|ingredients?|cups?|tablespoons?)\b/i,

  // Hindi
  /सब्जी/,
  /फल/,
  /कपड़े/,
  /किराना/,
  /रेसिपी/,
];


/**
 * Normalize input.
 */
export function normalizeText(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .replace(
      /[\u{1F600}-\u{1FAFF}\u{2600}-\u{26FF}]/gu,
      ' '
    )
    .replace(/[^\p{L}\p{N}\s₹$.-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


/**
 * Check whether a pattern matches.
 */
function findMatches(text, patterns) {
  const matches = [];

  for (const pattern of patterns) {
    const found = text.match(pattern);

    if (found) {
      for (const value of found) {
        if (!matches.includes(value.toLowerCase())) {
          matches.push(value.toLowerCase());
        }
      }
    }
  }

  return matches;
}


/**
 * Detect legitimate commercial context.
 */
function detectLegitimateCommercial(text) {
  const matches = [];

  for (const pattern of LEGITIMATE_COMMERCIAL_PATTERNS) {
    const found = text.match(pattern);

    if (found) {
      matches.push(found[0].toLowerCase());
    }
  }

  return matches;
}


/**
 * Extract evidence from a message.
 */
export function extractSignals(text) {

  if (!text || typeof text !== 'string') {
    return {
      signals: [],
      preliminaryScore: 0,
      isLegitimateCommercial: false,
      legitimateCommercialTerms: [],
      extractedTerms: {},
      evidence: {},
      summary: 'Empty or invalid message text.',
    };
  }

  const normalized = normalizeText(text);

  const detectedSignals = [];
  const extractedTerms = {};

  /*
   * Run all signal groups.
   */
  for (const [signalType, patterns] of Object.entries(PATTERNS)) {

    const matches = findMatches(normalized, patterns);

    if (matches.length > 0) {
      detectedSignals.push(signalType);
      extractedTerms[signalType] = matches;
    }
  }


  /*
   * Detect legitimate commerce separately.
   */
  const legitimateCommercialTerms =
    detectLegitimateCommercial(normalized);

  const isLegitimateCommercial =
    legitimateCommercialTerms.length > 0;


  /*
   * Determine whether message contains transactional context.
   */
  const transactionalSignals = [
    'availability_language',
    'pricing_discussion',
    'purchase_solicitation',
    'private_contact_solicitation',
    'delivery_payment_language',
  ];

  const transactionalSignalCount =
    transactionalSignals.filter(
      signal => detectedSignals.includes(signal)
    ).length;


  /*
   * Weighted score.
   */
  let preliminaryScore = 0;

  for (const signal of detectedSignals) {
    preliminaryScore += SIGNAL_WEIGHTS[signal] || 0;
  }


  /*
   * Contextual combinations.
   */

  const hasExplicitSubstance =
    detectedSignals.includes(
      'explicit_illicit_substance_reference'
    );

  const hasCodedProduct =
    detectedSignals.includes(
      'coded_product_reference'
    );

  const hasQuantity =
    detectedSignals.includes(
      'quantity_reference'
    );

  const hasPurchase =
    detectedSignals.includes(
      'purchase_solicitation'
    );

  const hasPrivateContact =
    detectedSignals.includes(
      'private_contact_solicitation'
    );

  const hasAvailability =
    detectedSignals.includes(
      'availability_language'
    );

  const hasPricing =
    detectedSignals.includes(
      'pricing_discussion'
    );

  const hasPayment =
    detectedSignals.includes(
      'delivery_payment_language'
    );


  /*
   * Strong explicit substance + transaction context.
   */
  if (
    hasExplicitSubstance &&
    transactionalSignalCount >= 1
  ) {
    preliminaryScore += 25;
  }


  /*
   * Coded product + transaction context.
   */
  if (
    hasCodedProduct &&
    transactionalSignalCount >= 2
  ) {
    preliminaryScore += 20;
  }


  /*
   * Quantity + product + transaction context.
   */
  if (
    (hasCodedProduct || hasExplicitSubstance) &&
    hasQuantity &&
    transactionalSignalCount >= 1
  ) {
    preliminaryScore += 15;
  }


  /*
   * Pricing + private contact + availability is a
   * strong marketplace pattern.
   */
  if (
    hasPricing &&
    hasPrivateContact &&
    hasAvailability
  ) {
    preliminaryScore += 15;
  }


  /*
   * Legitimate commerce dampening.
   *
   * Do NOT erase explicit illicit substance evidence.
   */
  if (
    isLegitimateCommercial &&
    !hasExplicitSubstance &&
    !hasCodedProduct
  ) {
    preliminaryScore *= 0.35;
  }


  preliminaryScore = Math.min(
    100,
    Math.round(preliminaryScore)
  );


  /*
   * Multilingual signal.
   *
   * If non-ASCII letters are present alongside English/Roman text,
   * record multilingual_expression.
   */
  const containsNonLatinScript =
    /[^\x00-\x7F]/.test(text);

  const containsLatin =
    /[A-Za-z]/.test(text);

  if (
    containsNonLatinScript &&
    containsLatin &&
    !detectedSignals.includes('multilingual_expression')
  ) {
    detectedSignals.push(
      'multilingual_expression'
    );

    extractedTerms.multilingual_expression = [
      'mixed-script message'
    ];
  }


  const evidence = {
    hasExplicitSubstance,
    hasCodedProduct,
    hasQuantity,
    hasAvailability,
    hasPricing,
    hasPurchase,
    hasPrivateContact,
    hasPayment,
    transactionalSignalCount,
  };


  return {
    signals: detectedSignals,

    preliminaryScore,

    isLegitimateCommercial,

    legitimateCommercialTerms,

    extractedTerms,

    evidence,

    summary:
      detectedSignals.length > 0
        ? `Detected ${detectedSignals.length} contextual signal group(s): ${detectedSignals.join(', ')}`
        : 'No significant suspicious contextual signals detected.',
  };
}