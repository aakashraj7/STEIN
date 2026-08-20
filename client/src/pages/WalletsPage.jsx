import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  WalletCards,
  Search,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  ShieldAlert,
  Filter,
  ExternalLink,
} from 'lucide-react';

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState('');
  const [txFilter, setTxFilter] = useState('ALL'); // ALL, NORMAL, ERC20
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadWallets = (selectAddr = null) => {
    setLoading(true);
    api.getWallets()
      .then((res) => {
        const list = res.data || [];
        setWallets(list);
        if (selectAddr) {
          const found = list.find((w) => w.address.toLowerCase() === selectAddr.toLowerCase());
          if (found) setSelectedWallet(found);
          else if (list.length > 0) setSelectedWallet(list[0]);
        } else if (list.length > 0 && !selectedWallet) {
          setSelectedWallet(list[0]);
        }
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleAddWallet = (e) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;
    const addr = searchAddress.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setErrorMsg('Invalid Ethereum address format. Must be 0x followed by 40 hex characters.');
      return;
    }
    setErrorMsg('');
    setAnalyzing(true);
    api.createWallet(addr)
      .then((res) => {
        setSearchAddress('');
        loadWallets(addr);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setAnalyzing(false));
  };

  const handleRunAnalysis = () => {
    if (!selectedWallet) return;
    setAnalyzing(true);
    setErrorMsg('');
    api.analyzeWallet(selectedWallet.address)
      .then((res) => {
        if (res.data?.wallet) {
          setSelectedWallet(res.data.wallet);
          loadWallets(res.data.wallet.address);
        }
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setAnalyzing(false));
  };

  const filteredTransactions = (selectedWallet?.transactions || []).filter((tx) => {
    if (txFilter === 'NORMAL') return tx.type === 'NORMAL';
    if (txFilter === 'ERC20') return tx.type === 'ERC20';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header & Investigation Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-blue-600" />
            <span>Ethereum Wallet Intelligence</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Public transaction analysis &amp; deterministic heuristics (Normal ETH &amp; ERC-20 Token Transfers)
          </p>
        </div>

        {/* Investigate Address Form */}
        <form onSubmit={handleAddWallet} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="0x... (Investigate ETH address)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 w-72 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="stein-btn-primary text-xs shrink-0"
          >
            {analyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>{analyzing ? 'Analyzing...' : 'Investigate Address'}</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet List Side Panel */}
        <div className="stein-card border-slate-200 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <Coins className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tracked Wallets ({wallets.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-slate-500 text-xs py-6 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading wallets...</span>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-slate-500 text-xs py-6 text-center">No wallets found. Enter an address above.</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {wallets.map((w) => (
                <div
                  key={w._id}
                  onClick={() => setSelectedWallet(w)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedWallet?._id === w._id
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold">{w.address.substring(0, 10)}...{w.address.substring(34)}</span>
                    <span className={`stein-badge text-[10px] ${w.riskScore >= 0.5 ? 'stein-badge-suspicious' : 'stein-badge-review'}`}>
                      Risk: {w.riskScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-sans">
                    <span>Vendor: <strong className="text-slate-800">{w.vendorId?.name || 'Unassigned'}</strong></span>
                    <span className="text-blue-600 font-mono font-semibold">{w.transactions?.length || 0} txs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Wallet Details & Heuristics */}
        <div className="md:col-span-2 space-y-6">
          {selectedWallet ? (
            <>
              {/* Address Overview Card */}
              <div className="stein-card border-slate-200 space-y-4 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Address Identifier</span>
                    <h2 className="text-sm md:text-base font-mono font-bold text-blue-600 break-all mt-0.5">
                      {selectedWallet.address}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRunAnalysis}
                      disabled={analyzing}
                      className="stein-btn-secondary text-xs"
                    >
                      {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <Zap className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{analyzing ? 'Refreshing...' : 'Sync Etherscan & Analyze'}</span>
                    </button>
                    <span className="stein-badge-suspicious text-xs px-3 py-1 font-mono font-bold">
                      Risk Score: {selectedWallet.riskScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Blockchain</span>
                    <p className="font-bold text-slate-900 mt-0.5 font-mono">{selectedWallet.blockchain}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Vendor Owner</span>
                    <p className="font-bold text-blue-600 mt-0.5">{selectedWallet.vendorId?.name || 'Unassigned'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Cached Txs</span>
                    <p className="font-bold text-slate-900 mt-0.5 font-mono">{selectedWallet.transactions?.length || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Data Source</span>
                    <p className={`font-bold mt-0.5 font-mono ${selectedWallet.dataSource === 'ETHERSCAN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {selectedWallet.dataSource}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heuristics Analysis */}
              <div className="stein-card border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Deterministic Heuristic Risk Flags
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.rapidFanOut ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Rapid Fan-out</span>
                      {selectedWallet.heuristics?.rapidFanOut && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                    </div>
                    <div className="text-[10px] mt-1 font-medium">
                      {selectedWallet.heuristics?.rapidFanOut ? 'FLAGGED: High velocity transfers' : 'Normal transfer velocity'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.dormancySpike ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Dormancy Spike</span>
                      {selectedWallet.heuristics?.dormancySpike && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <div className="text-[10px] mt-1 font-medium">
                      {selectedWallet.heuristics?.dormancySpike ? 'FLAGGED: Sudden reactivation' : 'Consistent account activity'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.labelledInteraction ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Labelled Interaction</span>
                      {selectedWallet.heuristics?.labelledInteraction && <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <div className="text-[10px] mt-1 font-medium">
                      {selectedWallet.heuristics?.labelledInteraction ? 'FLAGGED: Known illicit address' : 'No known labelled interaction'}
                    </div>
                  </div>
                </div>

                {selectedWallet.heuristics?.suspiciousPatterns?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block mb-1.5">Detected Suspicious Patterns:</span>
                    <ul className="space-y-1">
                      {selectedWallet.heuristics.suspiciousPatterns.map((pat, idx) => (
                        <li key={idx} className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Transactions Table */}
              <div className="stein-card p-0 border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span>Transaction History ({filteredTransactions.length})</span>
                  </h3>

                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 text-xs font-mono">
                    <button
                      onClick={() => setTxFilter('ALL')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setTxFilter('NORMAL')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'NORMAL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ETH NORMAL
                    </button>
                    <button
                      onClick={() => setTxFilter('ERC20')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'ERC20' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ERC-20 TOKENS
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">From Address</th>
                        <th className="py-3 px-4">To Address</th>
                        <th className="py-3 px-4">Value</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                            No transactions matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tx.type === 'ERC20' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {tx.type || 'NORMAL'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {tx.from?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                                  <span>OUT (Self)</span>
                                </span>
                              ) : (
                                <span>{tx.from?.substring(0, 12)}...</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {tx.to?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>IN (Self)</span>
                                </span>
                              ) : (
                                <span>{tx.to?.substring(0, 12)}...</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-900 font-bold">
                              {tx.value} {tx.tokenSymbol || 'ETH'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[10px]">
                              {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="stein-card text-center text-slate-500 py-16">
              Select a wallet from the left panel to inspect details or enter an address above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
