import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity } from '../utils/cosine.js';

describe('Cosine Similarity', () => {
  it('should return 1 for identical vectors', () => {
    assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
  });

  it('should return 0 for orthogonal vectors', () => {
    const sim = cosineSimilarity([1, 0], [0, 1]);
    assert.ok(Math.abs(sim) < 0.001);
  });

  it('should return 0 for empty vectors', () => {
    assert.equal(cosineSimilarity([], []), 0);
  });

  it('should return 0 for zero vectors', () => {
    assert.equal(cosineSimilarity([0, 0], [0, 0]), 0);
  });

  it('should handle similar vectors', () => {
    const sim = cosineSimilarity([1, 2, 3], [1, 2, 4]);
    assert.ok(sim > 0.9 && sim < 1);
  });
});
