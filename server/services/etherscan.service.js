import config from '../config/index.js';

/**
 * Etherscan service — public API client.
 * Supports normal transactions and ERC-20 transfers.
 * Includes graceful synthetic fallback when API key is unconfigured or call fails.
 */

const BASE_URL = config.etherscan.baseUrl || 'https://api.etherscan.io/api';

/**
 * Perform a raw Etherscan API call.
 */
async function etherscanFetch(params) {
  if (!config.etherscan.apiKey) {
    return { fallback: true, data: null, error: 'Etherscan API key not configured' };
  }

  try {
    const url = new URL(BASE_URL);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set('apikey', config.etherscan.apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.status === '0' && data.message === 'NOTOK') {
      return { fallback: false, data: [], error: data.result };
    }
    return { fallback: false, data: data.result || [] };
  } catch (err) {
    return { fallback: true, data: null, error: err.message };
  }
}

/**
 * Get normal transactions for an address.
 */
export async function getNormalTransactions(address) {
  return etherscanFetch({
    module: 'account',
    action: 'txlist',
    address,
    startblock: 0,
    endblock: 99999999,
    sort: 'desc',
    page: 1,
    offset: 50,
  });
}

/**
 * Get ERC-20 token transfers for an address.
 */
export async function getERC20Transfers(address) {
  return etherscanFetch({
    module: 'account',
    action: 'tokentx',
    address,
    startblock: 0,
    endblock: 99999999,
    sort: 'desc',
    page: 1,
    offset: 50,
  });
}

/**
 * Generate synthetic transaction history for fallback / demo mode.
 */
export function generateSyntheticTransactions(address) {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  return [
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: '0x00000000000000000000000000000000deadbeef',
      to: address,
      value: '2.5000',
      timestamp: new Date(now - 45 * DAY_MS),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x1111111111111111111111111111111111111111',
      value: '10000.00',
      timestamp: new Date(now - 1 * DAY_MS),
      tokenSymbol: 'USDT',
      type: 'ERC20',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x2222222222222222222222222222222222222222',
      value: '0.4500',
      timestamp: new Date(now - 18 * 3600 * 1000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x3333333333333333333333333333333333333333',
      value: '0.5000',
      timestamp: new Date(now - 12 * 3600 * 1000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x4444444444444444444444444444444444444444',
      value: '0.6000',
      timestamp: new Date(now - 6 * 3600 * 1000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x5555555555555555555555555555555555555555',
      value: '0.7500',
      timestamp: new Date(now - 2 * 3600 * 1000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
    {
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      from: address,
      to: '0x6666666666666666666666666666666666666666',
      value: '0.9000',
      timestamp: new Date(now - 1 * 3600 * 1000),
      tokenSymbol: 'ETH',
      type: 'NORMAL',
    },
  ];
}

/**
 * Fetch and normalize transactions (Normal + ERC20) with graceful synthetic fallback.
 */
export async function fetchNormalizedTransactions(address) {
  const [normalRes, erc20Res] = await Promise.all([
    getNormalTransactions(address),
    getERC20Transfers(address),
  ]);

  if (normalRes.fallback || erc20Res.fallback) {
    return {
      source: 'DEMO',
      fallback: true,
      transactions: generateSyntheticTransactions(address),
      message: normalRes.error || erc20Res.error || 'Fallback to synthetic demo data',
    };
  }

  const normalized = [];

  if (Array.isArray(normalRes.data)) {
    for (const tx of normalRes.data) {
      const valWei = BigInt(tx.value || '0');
      const valEth = (Number(valWei) / 1e18).toFixed(4);
      normalized.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valEth,
        timestamp: new Date((parseInt(tx.timeStamp, 10) || 0) * 1000),
        tokenSymbol: 'ETH',
        type: 'NORMAL',
      });
    }
  }

  if (Array.isArray(erc20Res.data)) {
    for (const tx of erc20Res.data) {
      const decimals = parseInt(tx.tokenDecimal || '18', 10);
      const valRaw = BigInt(tx.value || '0');
      const valFormatted = (Number(valRaw) / Math.pow(10, decimals)).toFixed(2);
      normalized.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valFormatted,
        timestamp: new Date((parseInt(tx.timeStamp, 10) || 0) * 1000),
        tokenSymbol: tx.tokenSymbol || 'ERC20',
        type: 'ERC20',
      });
    }
  }

  // Sort descending by timestamp
  normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (normalized.length === 0) {
    return {
      source: 'DEMO',
      fallback: true,
      transactions: generateSyntheticTransactions(address),
      message: 'No live transactions found on Etherscan. Loaded demo transactions.',
    };
  }

  return {
    source: 'ETHERSCAN',
    fallback: false,
    transactions: normalized,
  };
}

export default { getNormalTransactions, getERC20Transfers, generateSyntheticTransactions, fetchNormalizedTransactions };

