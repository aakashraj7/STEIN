import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Canonical Investigation Reports</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Structured JSON investigation reports with SHA-256 cryptographic integrity hashes
          </p>
        </div>

        {cases.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-stein-surface border border-stein-border text-stein-text text-sm rounded-lg px-3 py-2"
            >
              {cases.map((c) => (
                <option key={c._id} value={c._id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="stein-btn-primary text-sm whitespace-nowrap"
            >
              {generating ? 'Hashing Canonical JSON...' : '📄 Generate SHA-256 Report'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="stein-card space-y-3">
          <h2 className="text-sm font-semibold text-stein-text border-b border-stein-border pb-2">
            Generated Reports ({reports.length})
          </h2>

          {loading ? (
            <div className="text-stein-text-dim text-sm py-4">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-stein-text-dim text-sm py-4">No reports generated. Click Generate Report above.</div>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r._id}
                  onClick={() => handleInspectReport(r._id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReport?._id === r._id
                      ? 'bg-stein-accent/10 border-stein-accent text-stein-text'
                      : 'bg-stein-surface-alt border-stein-border text-stein-text-dim hover:text-stein-text'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stein-accent-bright">{r.caseNumber}</span>
                    <span className="text-[10px] text-stein-text-dim">{new Date(r.generatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-medium text-stein-text mt-1 line-clamp-1">{r.title}</div>
                  <div className="text-[10px] font-mono text-stein-cyan mt-1 truncate">
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
              <div className="stein-card space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-xs font-mono text-stein-cyan">{selectedReport.caseNumber}</span>
                    <h2 className="text-lg font-bold text-stein-text">{selectedReport.title}</h2>
                  </div>
                  <button
                    onClick={() => handleVerifyIntegrity(selectedReport._id)}
                    className="stein-btn-success text-xs"
                  >
                    🔒 Verify SHA-256 Hash
                  </button>
                </div>

                {/* Verification result alert */}
                {verifyResult && (
                  <div className={`p-3 rounded border text-xs space-y-1 ${
                    verifyResult.valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <div className="font-bold">
                      {verifyResult.valid ? '✓ SHA-256 HASH VERIFICATION SUCCESSFUL' : '❌ HASH MISMATCH DETECTED'}
                    </div>
                    <div>Stored Hash: <span className="font-mono">{verifyResult.storedHash}</span></div>
                    <div>Computed Hash: <span className="font-mono">{verifyResult.recalculatedHash}</span></div>
                  </div>
                )}

                <div className="bg-stein-bg p-3 rounded border border-stein-border font-mono text-xs text-stein-warning break-all">
                  <strong className="text-stein-text-dim uppercase text-[10px] block mb-1">Canonical JSON SHA-256 Hash:</strong>
                  {selectedReport.sha256Hash}
                </div>
              </div>

              {/* Report Sections */}
              <div className="stein-card space-y-4">
                <h3 className="text-base font-semibold text-stein-text border-b border-stein-border pb-2">
                  Report Executive Summary
                </h3>
                <p className="text-sm text-stein-text-dim leading-relaxed">
                  {selectedReport.summary}
                </p>

                <div className="space-y-4 pt-2">
                  {(selectedReport.sections || []).map((sec, idx) => (
                    <div key={idx} className="p-3 bg-stein-surface-alt rounded border border-stein-border space-y-1">
                      <h4 className="font-semibold text-xs text-stein-accent-bright uppercase">{sec.heading}</h4>
                      <pre className="text-xs text-stein-text whitespace-pre-wrap font-sans">{sec.content}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="stein-card text-center text-stein-text-dim py-12">
              Select a report from the left panel to inspect canonical JSON details and SHA-256 hash.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
