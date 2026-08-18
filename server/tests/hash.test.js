import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sha256, canonicalJson, hashCanonical } from '../utils/hash.js';

describe('Hash Utils', () => {
  it('should produce SHA-256 hex', () => {
    const hash = sha256('hello');
    assert.equal(hash.length, 64);
    assert.equal(hash, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('should produce canonical JSON with sorted keys', () => {
    const json = canonicalJson({ b: 2, a: 1 });
    assert.equal(json, '{"a":1,"b":2}');
  });

  it('should hash canonical objects', () => {
    const result = hashCanonical({ z: 1, a: 2 });
    assert.ok(result.canonical);
    assert.ok(result.hash);
    assert.equal(result.hash.length, 64);
  });

  it('same object should produce same hash', () => {
    const r1 = hashCanonical({ x: 1, y: 2 });
    const r2 = hashCanonical({ y: 2, x: 1 });
    assert.equal(r1.hash, r2.hash);
  });
});
