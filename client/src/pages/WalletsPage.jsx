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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Investigation Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-cyan-400" />
            <span>Ethereum Wallet Intelligence</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Public transaction analysis &amp; deterministic heuristics (Normal ETH &amp; ERC-20 Token Transfers)
          </p>
        </div>

        {/* Investigate Address Form */}
        <form onSubmit={handleAddWallet} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="0x... (Investigate ETH address)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 w-72 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="stein-btn-cyan text-xs shrink-0"
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
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet List Side Panel */}
        <div className="stein-card border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Coins className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tracked Wallets ({wallets.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-slate-400 text-xs py-6 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
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
                      ? 'bg-slate-900 border-cyan-500/60 shadow-cyber-cyan text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold">{w.address.substring(0, 10)}...{w.address.substring(34)}</span>
                    <span className={`stein-badge text-[10px] ${w.riskScore >= 0.5 ? 'stein-badge-suspicious' : 'stein-badge-review'}`}>
                      Risk: {w.riskScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-sans">
                    <span>Vendor: <strong className="text-slate-200">{w.vendorId?.name || 'Unassigned'}</strong></span>
                    <span className="text-cyan-400 font-mono">{w.transactions?.length || 0} txs</span>
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
              <div className="stein-card border-slate-800 space-y-4 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Address Identifier</span>
                    <h2 className="text-sm md:text-base font-mono font-bold text-cyan-300 break-all mt-0.5">
                      {selectedWallet.address}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRunAnalysis}
                      disabled={analyzing}
                      className="stein-btn-secondary text-xs"
                    >
                      {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{analyzing ? 'Refreshing...' : 'Sync Etherscan & Analyze'}</span>
                    </button>
                    <span className="stein-badge-suspicious text-xs px-3 py-1 font-mono font-bold">
                      Risk Score: {selectedWallet.riskScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Blockchain</span>
                    <p className="font-bold text-slate-100 mt-0.5 font-mono">{selectedWallet.blockchain}</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Vendor Owner</span>
                    <p className="font-bold text-cyan-300 mt-0.5">{selectedWallet.vendorId?.name || 'Unassigned'}</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Cached Txs</span>
                    <p className="font-bold text-slate-100 mt-0.5 font-mono">{selectedWallet.transactions?.length || 0}</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Data Source</span>
                    <p className={`font-bold mt-0.5 font-mono ${selectedWallet.dataSource === 'ETHERSCAN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedWallet.dataSource}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heuristics Analysis */}
              <div className="stein-card border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Deterministic Heuristic Risk Flags
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.rapidFanOut ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-cyber-red' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Rapid Fan-out</span>
                      {selectedWallet.heuristics?.rapidFanOut && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.rapidFanOut ? 'FLAGGED: High velocity transfers' : 'Normal transfer velocity'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.dormancySpike ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Dormancy Spike</span>
                      {selectedWallet.heuristics?.dormancySpike && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.dormancySpike ? 'FLAGGED: Sudden reactivation' : 'Consistent account activity'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${selectedWallet.heuristics?.labelledInteraction ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' : 'bg-slate-950/60 border-slate-800 text-slate-400'}`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>Labelled Interaction</span>
                      {selectedWallet.heuristics?.labelledInteraction && <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.labelledInteraction ? 'FLAGGED: Known illicit address' : 'No known labelled interaction'}
                    </div>
                  </div>
                </div>

                {selectedWallet.heuristics?.suspiciousPatterns?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-slate-200 block mb-1">Detected Suspicious Patterns:</span>
                    <ul className="space-y-1">
                      {selectedWallet.heuristics.suspiciousPatterns.map((pat, idx) => (
                        <li key={idx} className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Transactions Table */}
              <div className="stein-card p-0 border border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4 text-cyan-400" />
                    <span>Transaction History ({filteredTransactions.length})</span>
                  </h3>

                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setTxFilter('ALL')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'ALL' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setTxFilter('NORMAL')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'NORMAL' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      ETH NORMAL
                    </button>
                    <button
                      onClick={() => setTxFilter('ERC20')}
                      className={`px-3 py-1 rounded-md transition-all text-[10px] font-bold ${txFilter === 'ERC20' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      ERC-20 TOKENS
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">From Address</th>
                        <th className="py-3 px-4">To Address</th>
                        <th className="py-3 px-4">Value</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-200">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                            No transactions matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tx.type === 'ERC20' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                                {tx.type || 'NORMAL'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {tx.from?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>OUT (Self)</span>
                                </span>
                              ) : (
                                <span>{tx.from?.substring(0, 12)}...</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {tx.to?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>IN (Self)</span>
                                </span>
                              ) : (
                                <span>{tx.to?.substring(0, 12)}...</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-amber-300 font-bold">
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
