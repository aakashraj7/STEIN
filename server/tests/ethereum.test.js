import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEthAddresses, isValidEthAddress, detectXmrMentions } from '../utils/ethereum.js';

describe('Ethereum Utils', () => {
  it('should extract ETH addresses from text', () => {
    const text = 'Send to 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78 please';
    const addrs = extractEthAddresses(text);
    assert.equal(addrs.length, 1);
    assert.equal(addrs[0], '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78');
  });

  it('should extract multiple addresses', () => {
    const text = 'From 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78 to 0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c';
    const addrs = extractEthAddresses(text);
    assert.equal(addrs.length, 2);
  });

  it('should return empty for no addresses', () => {
    assert.equal(extractEthAddresses('no addresses here').length, 0);
    assert.equal(extractEthAddresses(null).length, 0);
  });

  it('should validate ETH addresses', () => {
    assert.equal(isValidEthAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78'), true);
    assert.equal(isValidEthAddress('0xinvalid'), false);
    assert.equal(isValidEthAddress('not an address'), false);
  });

  it('should detect XMR mentions', () => {
    const mentions = detectXmrMentions('Also accepting XMR/Monero for privacy');
    assert.ok(mentions.includes('XMR'));
    assert.ok(mentions.includes('MONERO'));
  });
});
