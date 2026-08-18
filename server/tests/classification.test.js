import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyMessage } from '../services/gemini.service.js';
import { extractSignals } from '../utils/signalExtractor.js';

describe('Context-Aware Classification & Signal Extraction', () => {
  it('TEST 1: Coded Hinglish combination should be SUSPICIOUS or NEEDS_REVIEW (NOT BENIGN)', async () => {
    const text = 'oye maal aa gaya fresh wala, rate vahi purana, jinu chahida DM kar de, cash on delivery only 🇨🇦';
    const result = await classifyMessage(text);

    assert.notEqual(result.label, 'BENIGN', 'Message must NOT be BENIGN');
    assert.ok(result.label === 'SUSPICIOUS' || result.label === 'NEEDS_REVIEW', `Expected SUSPICIOUS or NEEDS_REVIEW, got ${result.label}`);
    assert.ok(result.riskScore >= 40, `Expected riskScore >= 40, got ${result.riskScore}`);
    assert.ok(result.signals.length >= 3, `Expected at least 3 detected signals, got ${result.signals.length}`);
    assert.ok(result.reasons.length >= 1, 'Expected at least 1 reasoning explanation');
  });

  it('TEST 2: Isolated word ("maal") in non-illicit context should NOT automatically become high risk', async () => {
    const text = 'kal mandi se maal aaya hai';
    const result = await classifyMessage(text);

    assert.equal(result.label, 'BENIGN', `Isolated word should remain BENIGN, got ${result.label}`);
    assert.ok(result.riskScore <= 30, `Expected low risk score <= 30, got ${result.riskScore}`);
  });

  it('TEST 3: English combination ("fresh stock available, DM for price") should yield NEEDS_REVIEW or SUSPICIOUS', async () => {
    const text = 'fresh stock available, DM for price';
    const result = await classifyMessage(text);

    assert.notEqual(result.label, 'BENIGN', 'Commercial solicitation combo should not be BENIGN');
    assert.ok(result.label === 'NEEDS_REVIEW' || result.label === 'SUSPICIOUS', `Expected NEEDS_REVIEW or SUSPICIOUS, got ${result.label}`);
    assert.ok(result.riskScore >= 35, `Expected risk score >= 35, got ${result.riskScore}`);
  });

  it('TEST 4: Completely normal conversational message should be BENIGN', async () => {
    const text = 'hello bhai kaise ho, kal milte hain chai par';
    const result = await classifyMessage(text);

    assert.equal(result.label, 'BENIGN', `Conversational message must be BENIGN, got ${result.label}`);
    assert.ok(result.riskScore <= 20, `Expected risk score <= 20, got ${result.riskScore}`);
  });

  it('TEST 5: Legitimate commercial ad (apples, prices, DM, COD) should NOT be classified as illicit', async () => {
    const text = 'Fresh organic apples stock arrived! Rate ₹120/kg. DM for bulk orders, cash on delivery available in Delhi';
    const result = await classifyMessage(text);

    assert.equal(result.label, 'BENIGN', `Legitimate commercial ad must be BENIGN, got ${result.label}`);
    assert.ok(result.riskScore <= 35, `Expected risk score <= 35 for legitimate commercial ad, got ${result.riskScore}`);
  });
});
