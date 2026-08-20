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
  FileDown,
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

  const handleExportPDF = () => {
    if (!selectedReport) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to export the PDF report.');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedReport.reportNumber} - PDF Evidence Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .logo-title { font-size: 20px; font-weight: 800; color: #0f172a; }
          .badge { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: bold; }
          .hash-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 11px; word-break: break-all; margin-top: 16px; }
          .section { margin-top: 24px; }
          .section-title { font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; }
          pre { background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 11px; overflow-x: auto; border: 1px solid #e2e8f0; white-space: pre-wrap; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">STEIN POLICE CYBER THREAT EVIDENCE REPORT</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Law Enforcement Official Case Dossier Export</div>
          </div>
          <div class="badge">${selectedReport.reportNumber}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 8px;">${selectedReport.title}</h2>
          <p style="font-size: 12px; color: #475569;">Generated On: <strong>${new Date(selectedReport.createdAt).toLocaleString()}</strong></p>
        </div>

        <div class="hash-box">
          <strong>Cryptographic SHA-256 Checksum Hash:</strong><br/>
          <span style="color: #2563eb; font-weight: bold;">${selectedReport.sha256Hash}</span>
        </div>

        <div class="section">
          <div class="section-title">Evidence Payload Data (JSON)</div>
          <pre>${JSON.stringify(selectedReport.content, null, 2)}</pre>
        </div>

        <div class="footer">
          CONFIDENTIAL - LAW ENFORCEMENT &amp; FORENSICS USE ONLY — STEIN INTELLIGENCE PLATFORM V1.0
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Canonical Investigation Reports</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Immutable SHA-256 evidence packages for law enforcement submission
          </p>
        </div>

        {/* Generate Report Form */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            {cases.map((c) => (
              <option key={c._id} value={c._id}>{c.caseNumber} - {c.title}</option>
            ))}
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={generating || !selectedCaseId}
            className="stein-btn-primary text-xs shrink-0"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{generating ? 'Generating...' : 'Compile Cryptographic Package'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List Side Panel */}
        <div className="stein-card border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Compiled Reports ({reports.length})</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">SHA-256 Signed</span>
          </div>

          {loading ? (
            <div className="text-slate-500 text-xs py-8 text-center flex justify-center items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading compiled reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center font-medium">
              No reports compiled yet. Select a case file above.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {reports.map((rep) => (
                <div
                  key={rep._id}
                  onClick={() => handleInspectReport(rep._id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-sm ${
                    selectedReport?._id === rep._id
                      ? 'bg-blue-50 border-blue-300 text-slate-900 font-bold ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-blue-600">{rep.reportNumber}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{rep.title}</p>

                  <div className="mt-2 text-[10px] font-mono text-slate-600 truncate flex items-center gap-1 bg-slate-50 p-1.5 rounded border border-slate-200 font-medium">
                    <Key className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{rep.sha256Hash}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Report Inspection & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            <>
              {/* Report Header Card */}
              <div className="stein-card border-slate-200 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {selectedReport.reportNumber}
                      </span>
                      <span className="stein-badge-live">CANONICAL REPORT</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedReport.title}</h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleExportPDF}
                      className="stein-btn-secondary text-xs"
                    >
                      <FileDown className="w-4 h-4 text-blue-600" />
                      <span>Export PDF</span>
                    </button>
                    <button
                      onClick={() => handleVerifyIntegrity(selectedReport._id)}
                      className="stein-btn-primary text-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Cryptographic Integrity</span>
                    </button>
                  </div>
                </div>

                {/* Verification Result Banner */}
                {verifyResult && (
                  <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
                    verifyResult.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {verifyResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{verifyResult.message}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-white px-2.5 py-1 rounded border border-slate-200 font-bold">
                      {verifyResult.hashMatch ? 'HASH_MATCH' : 'TAMPERED'}
                    </span>
                  </div>
                )}

                {/* SHA256 Signature Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                    Canonical SHA-256 Checksum:
                  </span>
                  <p className="font-mono text-xs text-blue-600 font-bold break-all">
                    {selectedReport.sha256Hash}
                  </p>
                </div>
              </div>

              {/* JSON Payload Inspector */}
              <div className="stein-card border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Evidence Package Payload (JSON)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">Immutable Evidence Data</span>
                </div>

                <pre className="bg-slate-50 text-slate-800 p-4 rounded-xl border border-slate-200 text-xs font-mono overflow-x-auto max-h-[400px] leading-relaxed shadow-inner">
                  {JSON.stringify(selectedReport.content, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="stein-card text-center text-slate-500 py-16 font-medium">
              Select a report package from the left panel to inspect details and verify SHA-256 signature.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
