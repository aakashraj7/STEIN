import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  FileSpreadsheet,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Key,
  ChevronRight,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([api.getReports(), api.getCases()]);
      setReports(rRes.data || []);
      setCases(cRes.data || []);
      if (cRes.data?.length > 0) setSelectedCaseId(cRes.data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedCaseId) return;
    setGenerating(true);
    try {
      await api.generateReport(selectedCaseId);
      loadReports();
    } catch (err) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleInspectReport = async (id) => {
    try {
      const res = await api.getReport(id);
      setSelectedReport(res.data);
      setVerifyResult(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyIntegrity = async (id) => {
    try {
      const res = await api.verifyReport(id);
      setVerifyResult(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>Canonical Investigation Reports</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Structured JSON investigation reports with SHA-256 cryptographic integrity hashes
          </p>
        </div>

        {cases.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c._id} value={c._id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="stein-btn-cyan text-xs shrink-0"
            >
              {generating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{generating ? 'Hashing JSON...' : 'Generate SHA-256 Report'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports List Side Panel */}
        <div className="stein-card border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Generated Reports ({reports.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-slate-400 text-xs py-6 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-slate-500 text-xs py-6 text-center">No reports generated. Click Generate Report above.</div>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r._id}
                  onClick={() => handleInspectReport(r._id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReport?._id === r._id
                      ? 'bg-slate-900 border-cyan-500/60 shadow-cyber-cyan text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300 font-mono">{r.caseNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(r.generatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">{r.title}</div>
                  <div className="text-[10px] font-mono text-cyan-400/80 mt-1 truncate">
                    SHA-256: {r.sha256Hash?.substring(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Report Detail & Cryptographic Check */}
        <div className="md:col-span-2 space-y-6">
          {selectedReport ? (
            <>
              {/* Header */}
              <div className="stein-card border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      {selectedReport.caseNumber}
                    </span>
                    <h2 className="text-lg font-black text-white mt-1.5">{selectedReport.title}</h2>
                  </div>
                  <button
                    onClick={() => handleVerifyIntegrity(selectedReport._id)}
                    className="stein-btn-success text-xs shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify SHA-256 Hash</span>
                  </button>
                </div>

                {/* Verification Result Alert */}
                {verifyResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-1.5 font-mono ${
                    verifyResult.valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-cyber-emerald' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-cyber-red'
                  }`}>
                    <div className="font-bold flex items-center gap-2">
                      {verifyResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span>{verifyResult.valid ? 'SHA-256 HASH VERIFICATION SUCCESSFUL (INTEGRITY INTRACT)' : 'HASH MISMATCH DETECTED'}</span>
                    </div>
                    <div>Stored Hash: <span className="font-bold text-slate-200">{verifyResult.storedHash}</span></div>
                    <div>Computed Hash: <span className="font-bold text-slate-200">{verifyResult.recalculatedHash}</span></div>
                  </div>
                )}

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 break-all space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[9px] block">Canonical JSON Cryptographic Hash:</span>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{selectedReport.sha256Hash}</span>
                  </div>
                </div>
              </div>

              {/* Report Sections */}
              <div className="stein-card border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2.5">
                  Report Executive Summary
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {selectedReport.summary}
                </p>

                <div className="space-y-4 pt-2">
                  {(selectedReport.sections || []).map((sec, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                      <h4 className="font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sec.heading}</span>
                      </h4>
                      <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed pl-5 border-l-2 border-cyan-500/30">
                        {sec.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="stein-card text-center text-slate-500 py-16">
              Select a report from the left panel to inspect canonical JSON details and SHA-256 hash.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
