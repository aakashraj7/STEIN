import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEthAddresses, isValidEthAddress, detectXmrMentions } from '../utils/ethereum.js';
import { fetchNormalizedTransactions, generateSyntheticTransactions } from '../services/etherscan.service.js';
import { analyzeWalletTransactions } from '../services/wallet.service.js';

describe('Cryptocurrency Intelligence & Wallet Pipeline', () => {
  const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78';

  it('TEST 1: Ethereum address validation and extraction', () => {
    assert.equal(isValidEthAddress(address), true);
    assert.equal(isValidEthAddress('0xinvalid'), false);
    assert.equal(isValidEthAddress('742d35Cc6634C0532925a3b844Bc9e7595f2bD78'), false);

    const text = 'Send funds to 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78 or 0x8B3a08b22dC7F4C9Ed6B2987C2F6E96FbBEb090c';
    const extracted = extractEthAddresses(text);
    assert.equal(extracted.length, 2);
    assert.ok(extracted.includes(address));
  });

  it('TEST 2: Informational Monero (XMR) mention detection without Monero tracing', () => {
    const text = 'Payment accepted in XMR or ETH. Contact for Monero wallet address.';
    const mentions = detectXmrMentions(text);
    assert.ok(mentions.includes('XMR'));
    assert.ok(mentions.includes('MONERO'));
  });

  it('TEST 3: Etherscan service abstraction fallback to synthetic demo data when unconfigured', async () => {
    const result = await fetchNormalizedTransactions(address);
    assert.ok(result.transactions.length > 0, 'Should return synthetic transactions in fallback mode');
    assert.equal(result.source, 'DEMO');
    assert.equal(result.fallback, true);
  });

  it('TEST 4: Deterministic Heuristic — Rapid fan-out detection', () => {
    const txs = Array.from({ length: 6 }, (_, i) => ({
      from: address,
      to: `0x${String(i + 1).padStart(40, '0')}`,
      value: '1.0',
      timestamp: new Date(Date.now() - i * 3600000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    }));
    const result = analyzeWalletTransactions(txs, address);
    assert.equal(result.heuristics.rapidFanOut, true);
    assert.ok(result.riskScore >= 0.3);
  });

  it('TEST 5: Deterministic Heuristic — Dormancy spike detection', () => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const txs = [
      { from: '0x1111111111111111111111111111111111111111', to: address, value: '1.0', timestamp: new Date(now - 60 * DAY_MS), type: 'NORMAL' },
      { from: address, to: '0x2222222222222222222222222222222222222222', value: '0.5', timestamp: new Date(now - 2 * DAY_MS), type: 'NORMAL' },
      { from: address, to: '0x3333333333333333333333333333333333333333', value: '0.5', timestamp: new Date(now - 1 * DAY_MS), type: 'NORMAL' },
    ];
    const result = analyzeWalletTransactions(txs, address);
    assert.equal(result.heuristics.dormancySpike, true);
  });

  it('TEST 6: Deterministic Heuristic — Provenance-labelled address interaction detection', () => {
    const txs = [
      { from: address, to: '0x00000000000000000000000000000000deadbeef', value: '1.0', timestamp: new Date(), type: 'NORMAL' },
    ];
    const result = analyzeWalletTransactions(txs, address);
    assert.equal(result.heuristics.labelledInteraction, true);
  });

  it('TEST 7: Full wallet analysis pipeline execution', async () => {
    const synthetic = generateSyntheticTransactions(address);
    const result = analyzeWalletTransactions(synthetic, address);

    assert.ok(typeof result.riskScore === 'number');
    assert.ok(result.transactionCount > 0);
    assert.ok(result.heuristics.suspiciousPatterns.length > 0);
  });
});
