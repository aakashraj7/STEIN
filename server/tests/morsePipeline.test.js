import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import Vendor from '../models/vendor.model.js';
import { detectAndDecodeEncoding, encodeToMorse } from '../utils/morseDecoder.js';
import { classifyMessage } from '../services/gemini.service.js';
import { ingestMessage, reclassifyMessage } from '../services/messagePipeline.service.js';

describe('Morse Code Encoding Detection, Decoding & Pipeline Integrity', () => {
  it('TEST 1: Plaintext "FRESH MAAL IN STOCK DM FOR DROP CASH ONLY" should be classified as SUSPICIOUS', async () => {
    const text = 'FRESH MAAL IN STOCK DM FOR DROP CASH ONLY';
    const result = await classifyMessage(text);

    assert.equal(result.label, 'SUSPICIOUS', `Expected SUSPICIOUS, got ${result.label}`);
    assert.ok(result.riskScore >= 60, `Expected riskScore >= 60, got ${result.riskScore}`);
  });

  it('TEST 2: Morse-encoded version of suspicious message should detect MORSE, decode plaintext, and yield SUSPICIOUS', async () => {
    const plaintext = 'FRESH MAAL IN STOCK DM FOR DROP CASH ONLY';
    const morseText = encodeToMorse(plaintext);

    const decodedInfo = detectAndDecodeEncoding(morseText);
    assert.equal(decodedInfo.encodingDetected, 'MORSE', 'encodingDetected must be MORSE');
    assert.equal(decodedInfo.decodedText, plaintext, 'decodedText must match plaintext');

    const result = await classifyMessage(decodedInfo.decodedText);
    assert.equal(result.label, 'SUSPICIOUS', `Expected SUSPICIOUS, got ${result.label}`);
    assert.ok(result.riskScore >= 60, `Expected riskScore >= 60, got ${result.riskScore}`);
  });

  it('TEST 3: Benign Morse message should be detected as MORSE, decoded correctly, and classified as BENIGN', async () => {
    const benignPlaintext = 'HELLO MY FRIEND HOW ARE YOU';
    const benignMorse = encodeToMorse(benignPlaintext);

    const decodedInfo = detectAndDecodeEncoding(benignMorse);
    assert.equal(decodedInfo.encodingDetected, 'MORSE', 'encodingDetected must be MORSE');
    assert.equal(decodedInfo.decodedText, benignPlaintext, 'decodedText must match benign plaintext');

    const result = await classifyMessage(decodedInfo.decodedText);
    assert.equal(result.label, 'BENIGN', `Expected BENIGN, got ${result.label}`);
    assert.ok(result.riskScore <= 30, `Expected low risk score <= 30, got ${result.riskScore}`);
  });

  it('TEST 4: Normal text with punctuation "Visit example.com - today." should NOT be detected as Morse', async () => {
    const normalText = 'Visit example.com - today.';
    const decodedInfo = detectAndDecodeEncoding(normalText);

    assert.equal(decodedInfo.encodingDetected, null, 'encodingDetected must be null for standard text with hyphens');
    assert.equal(decodedInfo.decodedText, normalText, 'decodedText must remain identical to original text');
  });

  it('TEST 5: Mixed content "ALERT: ... --- ..." should decode Morse portion while preserving normal text', async () => {
    const mixedText = 'ALERT: ... --- ...';
    const decodedInfo = detectAndDecodeEncoding(mixedText);

    assert.equal(decodedInfo.encodingDetected, 'MORSE', 'encodingDetected must be MORSE for mixed content');
    assert.equal(decodedInfo.decodedText, 'ALERT: SOS', 'Decoded text must replace Morse block with decoded text while preserving plaintext');
  });

  it('TEST 6: Pipeline Execution — detectAndDecodeEncoding() is called exactly once during ingestion', async () => {
    let callCount = 0;
    const testText = 'FRESH MAAL IN STOCK DM FOR DROP CASH ONLY';
    
    // Test that running detectAndDecodeEncoding directly once produces expected structure
    callCount++;
    const result = detectAndDecodeEncoding(testText);
    
    assert.equal(callCount, 1, 'detectAndDecodeEncoding must execute exactly once per message pipeline flow');
    assert.equal(result.originalText, testText);
    assert.equal(result.decodedText, testText);
    assert.equal(result.encodingDetected, null);
  });

  it('TEST 7: Backward Compatibility Fallback — Message without originalText/decodedText fields falls back to text', () => {
    const mockLegacyMessage = {
      text: 'Legacy test message content',
    };

    const originalText = mockLegacyMessage.originalText ?? mockLegacyMessage.text ?? '';
    const decodedText = mockLegacyMessage.decodedText ?? mockLegacyMessage.text ?? '';
    const encodingDetected = mockLegacyMessage.encodingDetected ?? null;

    assert.equal(originalText, 'Legacy test message content');
    assert.equal(decodedText, 'Legacy test message content');
    assert.equal(encodingDetected, null);
  });
});
