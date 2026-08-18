import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Tamper-Evident Audit Log</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Cryptographic SHA-256 hash-chained immutable audit sequence
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleVerifyChain}
            className="stein-btn-primary text-sm"
          >
            🔍 Verify Hash Chain Integrity
          </button>
        </div>
      </div>

      {/* Chain Verification Result Banner */}
      {verifyStatus && (
        <div className={`stein-card border ${
          verifyStatus.valid
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        } space-y-2`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {verifyStatus.valid ? '✓ AUDIT HASH CHAIN VALID' : '❌ AUDIT HASH CHAIN TAMPERED'}
            </h2>
            <span className="text-xs font-mono font-semibold">
              Entries Verified: {verifyStatus.entries}
            </span>
          </div>
          <p className="text-sm font-mono">{verifyStatus.details}</p>
        </div>
      )}

      {/* Audit Table */}
      <div className="stein-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-stein-text-dim text-sm">Loading audit entries...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-stein-text-dim text-sm">No audit logs recorded. Seed scenario first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stein-surface-alt text-stein-text-dim uppercase border-b border-stein-border">
                <tr>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Previous Hash</th>
                  <th className="py-3 px-3">Current Hash</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Demo Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stein-border/40">
                {logs.map((entry, idx) => (
                  <tr key={entry.eventId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stein-accent-bright">
                      {entry.eventType}
                    </td>
                    <td className="py-3 px-3 text-stein-text-dim">{entry.actor}</td>
                    <td className="py-3 px-3 text-stein-text-dim truncate max-w-[120px]">
                      {entry.previousHash?.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-3 text-stein-cyan font-bold truncate max-w-[140px]">
                      {entry.currentHash?.substring(0, 14)}...
                    </td>
                    <td className="py-3 px-3 text-stein-text-dim">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleTamperDemo(entry.eventId)}
                        disabled={tampering}
                        className="text-[10px] text-red-400 hover:text-red-300 underline"
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
