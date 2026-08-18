import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractFeatures, compareFingerprints } from '../services/stylometry.service.js';

describe('Stylometry', () => {
  const vendorAMessages = [
    'bro 2g available, message me on wickr for details 🔥',
    'premium quality stuff just landed... DM for price list',
    'express overnight shipping available, stealth guaranteed',
    'new batch just dropped!! fire quality, hmu fast',
    'got that gas dm me for menu... escrow accepted',
    'special deal this week — 20% off, crypto only',
  ];

  const vendorBMessages = [
    'yo got that fire stuff available, dm me 🔥',
    'premium grade just restocked... bulk discounts, hmu',
    'stealth shipping express, 2 day guaranteed',
    'new batch alert!! quality tested, message fam',
    'got the gas hmu for prices... crypto only',
    'special promo — 15% off first order, legit 💯',
  ];

  it('should extract features from sufficient messages', () => {
    const fp = extractFeatures(vendorAMessages);
    assert.equal(fp.status, 'OK');
    assert.equal(fp.messageCount, 6);
    assert.ok(fp.features.basic.avgMessageLength > 0);
    assert.ok(fp.features.punctuation.punctFreq >= 0);
    assert.ok(typeof fp.features.functionWords === 'object');
  });

  it('should return INSUFFICIENT_TEXT for too few messages', () => {
    const fp = extractFeatures(['just one message']);
    assert.equal(fp.status, 'INSUFFICIENT_TEXT');
  });

  it('should return INSUFFICIENT_TEXT for null/empty', () => {
    assert.equal(extractFeatures(null).status, 'INSUFFICIENT_TEXT');
    assert.equal(extractFeatures([]).status, 'INSUFFICIENT_TEXT');
  });

  it('should compare two fingerprints', () => {
    const fpA = extractFeatures(vendorAMessages);
    const fpB = extractFeatures(vendorBMessages);
    const result = compareFingerprints(fpA, fpB);

    assert.equal(result.status, 'OK');
    assert.ok(result.overallSimilarity >= 0 && result.overallSimilarity <= 1);
    assert.ok(result.level);
    assert.ok(result.groupSimilarities);
    assert.ok(result.explanations.length >= 1);
    assert.ok(result.note.includes('investigative signal'));
  });

  it('should handle insufficient text comparison', () => {
    const fpA = extractFeatures(vendorAMessages);
    const fpB = extractFeatures(['one msg']);
    const result = compareFingerprints(fpA, fpB);
    assert.equal(result.status, 'INSUFFICIENT_TEXT');
  });
});
