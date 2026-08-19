import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  ShieldCheck,
  Search,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  FileCode,
  Zap,
} from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [tampering, setTampering] = useState(false);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLog();
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const handleVerifyChain = async () => {
    try {
      const res = await api.verifyAuditChain();
      setVerifyStatus(res.data);
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleTamperDemo = async (eventId) => {
    if (!window.confirm('Demonstrate Tamper Detection? This will intentionally mutate an audit payload.')) return;
    setTampering(true);
    try {
      await api.tamperDemo(eventId);
      await fetchAuditLog();
      await handleVerifyChain();
    } catch (err) {
      alert(`Tamper demo failed: ${err.message}`);
    } finally {
      setTampering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>Tamper-Evident Audit Log</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Cryptographic SHA-256 hash-chained immutable audit sequence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            className="stein-btn-cyan text-xs"
          >
            <Search className="w-3.5 h-3.5 text-cyan-300" />
            <span>Verify Hash Chain Integrity</span>
          </button>
        </div>
      </div>

      {/* Chain Verification Result Banner */}
      {verifyStatus && (
        <div className={`stein-card border ${
          verifyStatus.valid
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-cyber-emerald'
            : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-cyber-red'
        } space-y-2`}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold flex items-center gap-2 font-mono">
              {verifyStatus.valid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>AUDIT HASH CHAIN VALID (ZERO TAMPERING DETECTED)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>AUDIT HASH CHAIN TAMPERED (TAMPERING DETECTED)</span>
                </>
              )}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded border border-slate-800">
              Entries Verified: {verifyStatus.entries}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300">{verifyStatus.details}</p>
        </div>
      )}

      {/* Audit Table */}
      <div className="stein-card p-0 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Verifying audit block sequence...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No audit logs recorded. Seed scenario first on Dashboard.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Previous Block Hash</th>
                  <th className="py-3.5 px-4">Current Block Hash</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Tamper Demo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-200">
                {logs.map((entry) => (
                  <tr key={entry.eventId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {entry.eventType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{entry.actor}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[140px]">
                      {entry.previousHash?.substring(0, 14)}...
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold truncate max-w-[160px]">
                      {entry.currentHash?.substring(0, 16)}...
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleTamperDemo(entry.eventId)}
                        disabled={tampering}
                        className="text-[10px] text-red-400 hover:text-red-300 hover:underline font-bold"
                      >
                        [Tamper Entry]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
