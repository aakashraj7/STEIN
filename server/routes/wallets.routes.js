import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import Wallet from '../models/wallet.model.js';
import { analyzeWalletTransactions } from '../services/wallet.service.js';
import * as etherscanService from '../services/etherscan.service.js';
import { isValidEthAddress } from '../utils/ethereum.js';
import * as neo4jService from '../services/neo4j.service.js';

const router = Router();

// List all wallets
router.get('/', asyncHandler(async (req, res) => {
  const wallets = await Wallet.find().populate('vendorId', 'name aliases').sort({ riskScore: -1 });
  res.json({ success: true, data: wallets });
}));

// Create / register a new wallet address for investigation
router.post('/', asyncHandler(async (req, res) => {
  const { address, vendorId } = req.body;
  if (!address || !isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: { message: 'Valid Ethereum address (0x...) is required' } });
  }

  let wallet = await Wallet.findOne({ address });
  if (!wallet) {
    const fetched = await etherscanService.fetchNormalizedTransactions(address);
    const analysis = analyzeWalletTransactions(fetched.transactions, address);

    wallet = await Wallet.create({
      address,
      vendorId: vendorId || undefined,
      blockchain: 'ETH',
      transactionCount: fetched.transactions.length,
      heuristics: analysis.heuristics,
      riskScore: analysis.riskScore,
      transactions: fetched.transactions,
      dataSource: fetched.source,
    });

    try {
      await neo4jService.upsertWallet(wallet);
    } catch {
      /* graph fallback */
    }
  }

  const populated = await Wallet.findById(wallet._id).populate('vendorId', 'name aliases');
  res.json({ success: true, data: populated });
}));

// Get wallet by address
router.get('/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  if (!isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid Ethereum address' } });
  }

  let wallet = await Wallet.findOne({ address }).populate('vendorId', 'name aliases');
  if (!wallet) {
    return res.status(404).json({ success: false, error: { message: 'Wallet not found in database' } });
  }

  res.json({ success: true, data: wallet });
}));

// Get wallet transactions (from DB or live Etherscan / synthetic fallback)
router.get('/:address/transactions', asyncHandler(async (req, res) => {
  const { address } = req.params;
  if (!isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid Ethereum address' } });
  }

  let wallet = await Wallet.findOne({ address });
  if (wallet && wallet.transactions && wallet.transactions.length > 0) {
    return res.json({ success: true, data: wallet.transactions, source: wallet.dataSource });
  }

  // Fetch live from Etherscan (or fallback to synthetic demo)
  const fetched = await etherscanService.fetchNormalizedTransactions(address);
  res.json({ success: true, data: fetched.transactions, source: fetched.source, message: fetched.message });
}));

// Analyze wallet (refreshes transactions, runs heuristics, updates DB & Neo4j)
router.post('/:address/analyze', asyncHandler(async (req, res) => {
  const { address } = req.params;
  if (!isValidEthAddress(address)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid Ethereum address' } });
  }

  let wallet = await Wallet.findOne({ address });
  const fetched = await etherscanService.fetchNormalizedTransactions(address);
  const analysis = analyzeWalletTransactions(fetched.transactions, address);

  if (wallet) {
    wallet.transactions = fetched.transactions;
    wallet.transactionCount = fetched.transactions.length;
    wallet.heuristics = analysis.heuristics;
    wallet.riskScore = analysis.riskScore;
    wallet.dataSource = fetched.source;
    wallet.lastActivity = new Date();
    await wallet.save();
  } else {
    wallet = await Wallet.create({
      address,
      blockchain: 'ETH',
      transactionCount: fetched.transactions.length,
      heuristics: analysis.heuristics,
      riskScore: analysis.riskScore,
      transactions: fetched.transactions,
      dataSource: fetched.source,
    });
  }

  try {
    await neo4jService.upsertWallet(wallet);
  } catch {
    /* graph driver fallback */
  }

  const populated = await Wallet.findById(wallet._id).populate('vendorId', 'name aliases');
  res.json({ success: true, data: { wallet: populated, analysis, source: fetched.source } });
}));

export default router;

