import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

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
    <div className="p-6 space-y-6">
      {/* Header & Investigation Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Ethereum Wallet Intelligence</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Public transaction analysis &amp; deterministic heuristics (Normal ETH &amp; ERC-20 Token Transfers)
          </p>
        </div>

        {/* Investigate Address Form */}
        <form onSubmit={handleAddWallet} className="flex gap-2">
          <input
            type="text"
            placeholder="0x... (Investigate ETH address)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-stein-surface-alt border border-stein-border rounded text-stein-text placeholder-stein-text-dim w-72 focus:outline-none focus:border-stein-cyan"
          />
          <button
            type="submit"
            disabled={analyzing}
            className="px-4 py-1.5 text-xs font-semibold bg-stein-cyan hover:bg-stein-cyan/80 text-black rounded transition-all disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Investigate'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet List */}
        <div className="stein-card space-y-3">
          <h2 className="text-sm font-semibold text-stein-text border-b border-stein-border pb-2">
            Tracked Wallets ({wallets.length})
          </h2>
          {loading ? (
            <div className="text-stein-text-dim text-sm py-4">Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <div className="text-stein-text-dim text-sm py-4">No wallets found. Add an address above.</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {wallets.map((w) => (
                <div
                  key={w._id}
                  onClick={() => setSelectedWallet(w)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedWallet?._id === w._id
                      ? 'bg-stein-accent/10 border-stein-accent text-stein-text'
                      : 'bg-stein-surface-alt border-stein-border text-stein-text-dim hover:text-stein-text'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold">{w.address.substring(0, 10)}...{w.address.substring(34)}</span>
                    <span className={`stein-badge ${w.riskScore >= 0.5 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      Risk: {w.riskScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stein-text-dim mt-1.5">
                    <span>Vendor: {w.vendorId?.name || 'Unassigned'}</span>
                    <span className="text-stein-cyan">{w.transactions?.length || 0} txs</span>
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
              {/* Overview Card */}
              <div className="stein-card space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-xs uppercase text-stein-text-dim font-semibold">Address Identifier</span>
                    <h2 className="text-base md:text-lg font-mono font-bold text-stein-warning break-all mt-0.5">
                      {selectedWallet.address}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunAnalysis}
                      disabled={analyzing}
                      className="px-3 py-1 text-xs font-semibold bg-stein-surface-alt border border-stein-border hover:border-stein-cyan text-stein-cyan rounded transition-all disabled:opacity-50"
                    >
                      {analyzing ? 'Refreshing...' : '⚡ Sync Etherscan & Analyze'}
                    </button>
                    <span className="stein-badge bg-amber-500/20 text-amber-400 font-bold text-sm px-3 py-1">
                      Risk Score: {selectedWallet.riskScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t border-stein-border">
                  <div>
                    <span className="text-stein-text-dim">Blockchain:</span>
                    <p className="font-semibold text-stein-text mt-0.5">{selectedWallet.blockchain}</p>
                  </div>
                  <div>
                    <span className="text-stein-text-dim">Vendor Owner:</span>
                    <p className="font-semibold text-stein-accent-bright mt-0.5">{selectedWallet.vendorId?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-stein-text-dim">Cached Txs:</span>
                    <p className="font-semibold text-stein-text mt-0.5">{selectedWallet.transactions?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-stein-text-dim">Data Source:</span>
                    <p className={`font-semibold mt-0.5 ${selectedWallet.dataSource === 'ETHERSCAN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedWallet.dataSource}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heuristics Analysis */}
              <div className="stein-card space-y-4">
                <h3 className="text-base font-semibold text-stein-text border-b border-stein-border pb-2">
                  Deterministic Heuristic Flags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded border ${selectedWallet.heuristics?.rapidFanOut ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-stein-surface-alt border-stein-border text-stein-text-dim'}`}>
                    <div className="font-semibold flex items-center justify-between">
                      <span>Rapid Fan-out</span>
                      {selectedWallet.heuristics?.rapidFanOut && <span>⚠️</span>}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.rapidFanOut ? 'FLAGGED: High velocity transfers' : 'Normal transfer velocity'}
                    </div>
                  </div>
                  <div className={`p-3 rounded border ${selectedWallet.heuristics?.dormancySpike ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-stein-surface-alt border-stein-border text-stein-text-dim'}`}>
                    <div className="font-semibold flex items-center justify-between">
                      <span>Dormancy Spike</span>
                      {selectedWallet.heuristics?.dormancySpike && <span>⚠️</span>}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.dormancySpike ? 'FLAGGED: Sudden reactivation after dormancy' : 'Consistent account activity'}
                    </div>
                  </div>
                  <div className={`p-3 rounded border ${selectedWallet.heuristics?.labelledInteraction ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-stein-surface-alt border-stein-border text-stein-text-dim'}`}>
                    <div className="font-semibold flex items-center justify-between">
                      <span>Labelled Interaction</span>
                      {selectedWallet.heuristics?.labelledInteraction && <span>⚠️</span>}
                    </div>
                    <div className="text-[10px] mt-1">
                      {selectedWallet.heuristics?.labelledInteraction ? 'FLAGGED: Interaction with labelled address' : 'No known labelled addresses'}
                    </div>
                  </div>
                </div>

                {selectedWallet.heuristics?.suspiciousPatterns?.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-stein-text">Detected Suspicious Patterns:</span>
                    <ul className="list-disc list-inside text-xs text-stein-text-dim space-y-1 mt-1">
                      {selectedWallet.heuristics.suspiciousPatterns.map((pat, idx) => (
                        <li key={idx}>{pat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Transactions Table with Filter Tabs */}
              <div className="stein-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stein-border pb-2 gap-2">
                  <h3 className="text-base font-semibold text-stein-text">
                    Transaction History ({filteredTransactions.length})
                  </h3>
                  <div className="flex bg-stein-surface-alt p-0.5 rounded border border-stein-border text-xs font-mono">
                    <button
                      onClick={() => setTxFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition-all ${txFilter === 'ALL' ? 'bg-stein-cyan text-black font-bold' : 'text-stein-text-dim hover:text-stein-text'}`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setTxFilter('NORMAL')}
                      className={`px-2.5 py-1 rounded transition-all ${txFilter === 'NORMAL' ? 'bg-stein-cyan text-black font-bold' : 'text-stein-text-dim hover:text-stein-text'}`}
                    >
                      ETH NORMAL
                    </button>
                    <button
                      onClick={() => setTxFilter('ERC20')}
                      className={`px-2.5 py-1 rounded transition-all ${txFilter === 'ERC20' ? 'bg-stein-cyan text-black font-bold' : 'text-stein-text-dim hover:text-stein-text'}`}
                    >
                      ERC-20 TOKENS
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-stein-text-dim border-b border-stein-border sticky top-0 bg-stein-surface">
                      <tr>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">From</th>
                        <th className="py-2 px-2">To</th>
                        <th className="py-2 px-2">Value</th>
                        <th className="py-2 px-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stein-border/40">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stein-text-dim">
                            No transactions matching filter.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-2 px-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.type === 'ERC20' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                {tx.type || 'NORMAL'}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-stein-text-dim">
                              {tx.from?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-amber-400 font-semibold">OUT (Self)</span>
                              ) : (
                                <span>{tx.from?.substring(0, 10)}...</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-stein-text-dim">
                              {tx.to?.toLowerCase() === selectedWallet.address.toLowerCase() ? (
                                <span className="text-emerald-400 font-semibold">IN (Self)</span>
                              ) : (
                                <span>{tx.to?.substring(0, 10)}...</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-stein-warning font-semibold">
                              {tx.value} {tx.tokenSymbol || 'ETH'}
                            </td>
                            <td className="py-2 px-2 text-stein-text-dim text-[10px]">
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
            <div className="stein-card text-center text-stein-text-dim py-12">
              Select a wallet from the left panel to inspect details or enter an address above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
