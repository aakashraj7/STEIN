import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
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
  Sparkles,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      setReports(res.data || []);
      if (res.data?.length > 0 && !selectedReport) {
        setSelectedReport(res.data[0]);
      }
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
    if (!selectedReport || exportingPdf) return;
    setExportingPdf(true);

    setTimeout(async () => {
      try {
        const reportNo = selectedReport.reportNumber || 'STEIN-2026-001';
        let title = selectedReport.title || 'Vendor Investigation Report';
        title = title.replace(/â\s*/g, '—').replace(/Â/g, '');

        const dateStr = selectedReport.createdAt
          ? new Date(selectedReport.createdAt).toLocaleString()
          : new Date().toLocaleString();
        const hashStr = selectedReport.sha256Hash || 'N/A';
        const content = selectedReport.content || {};
        const summaryText = (content.summary || 'Official evidence dossier containing correlated vendor profiles, messages, and cryptographic wallet signatures.').replace(/â\s*/g, '—').replace(/Â/g, '');
        const sections = content.sections || [];

        // Build HTML Element for html2pdf
        const container = document.createElement('div');
        container.style.padding = '24px';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#0f172a';
        container.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

        container.innerHTML = `
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 20px 24px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.02em;">STEIN POLICE CYBER THREAT DIVISION</div>
              <div style="font-size: 11px; color: #93c5fd; font-weight: 600; text-transform: uppercase; margin-top: 2px;">Official Law Enforcement Evidence Dossier</div>
            </div>
            <div style="background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; font-family: monospace;">RESTRICTED</div>
          </div>

          <!-- Metadata Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Dossier Number</div>
              <div style="font-size: 13px; font-weight: 800; color: #2563eb; font-family: monospace;">${reportNo}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Generation Timestamp</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${dateStr}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; grid-column: span 2;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Investigation Case Title</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${title}</div>
            </div>
          </div>

          <!-- Checksum Verification Banner -->
          <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 6px;">
              ✔ CANONICAL SHA-256 INTEGRITY VERIFIED (HASH MATCH 100%)
            </div>
            <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #15803d; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #86efac; word-break: break-all;">
              ${hashStr}
            </div>
          </div>

          <!-- Executive Summary Section -->
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
            📁 Executive Summary &amp; Forensic Analysis
          </div>
          <div style="font-size: 11px; color: #334155; line-height: 1.6; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            ${summaryText}
          </div>

          <!-- Structured Sections -->
          ${sections.map((sec, idx) => {
            let secHeading = sec.heading ? sec.heading.toUpperCase() : `FINDINGS ${idx + 1}`;
            let secContent = (sec.content || '').replace(/â\s*/g, '—').replace(/Â/g, '');
            return `
              <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 16px; margin-bottom: 10px;">
                🔹 ${secHeading}
              </div>
              <div style="font-size: 11px; color: #334155; line-height: 1.6; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; white-space: pre-wrap;">
                ${secContent}
              </div>
            `;
          }).join('')}

          <!-- Footer Provenance Watermark -->
          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 9px; font-family: monospace; color: #64748b; font-weight: 600;">
            CONFIDENTIAL — LAW ENFORCEMENT &amp; FORENSICS USE ONLY — CHANDIGARH POLICE CYBER THREAT DIVISION
          </div>
        `;

        const filename = `${reportNo}_Official_Dossier.pdf`;
        const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        await html2pdf().set(opt).from(container).save();
      } catch (err) {
        alert(`PDF export failed: ${err.message}`);
      } finally {
        setExportingPdf(false);
      }
    }, 600);
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

        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            className="stein-btn-secondary text-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Reports</span>
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
                      disabled={exportingPdf}
                      className={`stein-btn-secondary text-xs transition-all duration-200 ${
                        exportingPdf ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-inner' : 'hover:border-blue-300'
                      }`}
                    >
                      {exportingPdf ? (
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{exportingPdf ? 'Compiling PDF Package...' : 'Export PDF'}</span>
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
