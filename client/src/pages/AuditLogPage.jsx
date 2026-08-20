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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Tamper-Evident Audit Log</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Cryptographic SHA-256 hash-chained immutable audit sequence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            className="stein-btn-primary text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify Hash Chain Integrity</span>
          </button>
        </div>
      </div>

      {/* Chain Verification Result Banner */}
      {verifyStatus && (
        <div className={`stein-card border ${
          verifyStatus.valid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        } space-y-2 font-medium`}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold flex items-center gap-2 font-mono">
              {verifyStatus.valid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>AUDIT HASH CHAIN VALID (ZERO TAMPERING DETECTED)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>AUDIT HASH CHAIN TAMPERED (TAMPERING DETECTED)</span>
                </>
              )}
            </h2>
            <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded border border-slate-200">
              Verified {verifyStatus.verifiedCount} events
            </span>
          </div>
          <p className="text-xs">{verifyStatus.message}</p>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="stein-card p-0 border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cryptographic Audit Trail ({logs.length})
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Immutable Hash Chain</span>
        </div>

        {loading ? (
          <div className="text-slate-500 text-xs py-12 text-center flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Verifying audit log entries...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-slate-500 text-xs py-12 text-center font-medium">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Seq #</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">SHA-256 Checksum Hash</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Demo Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{log.sequence}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.operator}</td>
                    <td className="py-3 px-4 text-[10px] text-slate-500 font-mono max-w-xs truncate">
                      {log.hash}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleTamperDemo(log.eventId)}
                        disabled={tampering}
                        className="stein-btn-danger text-[10px] py-1 px-2.5"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Simulate Tamper</span>
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
