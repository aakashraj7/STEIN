import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCorrelationScore } from '../services/correlation.service.js';

describe('Correlation Score', () => {
  it('should calculate weighted score', () => {
    const result = calculateCorrelationScore({
      listingSignal: 0.8,
      stylometrySignal: 0.7,
      walletSignal: 0.6,
      behaviourOverlap: 0.5,
    });
    assert.ok(result.score > 0 && result.score <= 1);
    assert.ok(result.priority);
    assert.ok(result.breakdown);
    assert.ok(result.note.includes('NOT'));
  });

  it('should return LOW for zero signals', () => {
    const result = calculateCorrelationScore({});
    assert.equal(result.score, 0);
    assert.equal(result.priority, 'LOW');
  });

  it('should clamp to 1', () => {
    const result = calculateCorrelationScore({
      listingSignal: 1, stylometrySignal: 1, walletSignal: 1, behaviourOverlap: 1,
    });
    assert.equal(result.score, 1);
    assert.equal(result.priority, 'CRITICAL');
  });
});
