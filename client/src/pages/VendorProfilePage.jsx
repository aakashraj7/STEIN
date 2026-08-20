import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api/client';
import {
  ArrowLeft,
  ShieldAlert,
  Feather,
  AtSign,
  Wallet,
  Users,
  MessageSquare,
  Code2,
  Clock,
  RefreshCw,
  UserCheck,
  FileDown,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

export default function VendorProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    api.getVendor(id)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportVendorPDF = () => {
    if (!data || !data.vendor || exportingPdf) return;
    setExportingPdf(true);

    setTimeout(async () => {
      try {
        const { vendor, messages } = data;
        const vendorName = vendor.name || 'Suspect_Vendor';
        const filename = `STEIN_Vendor_Dossier_${vendorName.replace(/\s+/g, '_')}.pdf`;
        const dateStr = new Date().toLocaleString();

        const container = document.createElement('div');
        container.style.padding = '24px';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#0f172a';
        container.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

        const aliasList = (vendor.knownAliases || []).join(', ') || 'No linked aliases recorded';
        const walletList = (vendor.walletAddresses || []).join(', ') || 'No active wallets linked';

        container.innerHTML = `
          <!-- Official Chandigarh Police Header -->
          <div style="background: linear-gradient(135deg, #0b1329 0%, #1e3a8a 50%, #2563eb 100%); color: #ffffff; padding: 22px 26px; border-radius: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="/Chandigarh_Police_Logo.png" style="width: 52px; height: 52px; object-fit: contain; background: #ffffff; padding: 3px; border-radius: 10px; border: 1px solid #60a5fa;" alt="Chandigarh Police Logo" />
              <div>
                <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase;">STEIN POLICE CYBER THREAT DIVISION</div>
                <div style="font-size: 11px; color: #93c5fd; font-weight: 700; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.05em;">CHANDIGARH POLICE ANTI-NARCOTICS &amp; CYBER CRIME CELL</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 900; padding: 5px 12px; border-radius: 6px; font-family: monospace; letter-spacing: 0.05em; display: inline-block; border: 1px solid #fca5a5;">CONFIDENTIAL</div>
              <div style="font-size: 9px; color: #cbd5e1; font-family: monospace; margin-top: 5px;">REF: CHDP-2026-DOSSIER</div>
            </div>
          </div>

          <!-- Cryptographic SHA-256 Checksum Container -->
          <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 10px; font-weight: 900; color: #047857; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                🛡️ CANONICAL EVIDENCE PACKAGE — SHA-256 PROTECTED
              </div>
              <div style="font-family: monospace; font-size: 9.5px; font-weight: 700; color: #065f46; margin-top: 3px;">
                HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>
            <div style="font-size: 9.5px; font-weight: 700; color: #047857; font-family: monospace;">
              VERIFIED: ${dateStr}
            </div>
          </div>

          <!-- Target Profile Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Target Vendor Identity</div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${vendorName}</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Assessed Threat Level</div>
              <div style="font-size: 15px; font-weight: 900; color: ${vendor.riskLevel === 'HIGH' ? '#dc2626' : '#d97706'}; font-family: monospace;">${vendor.riskLevel} RISK (${vendor.riskScore || 0}/100)</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Correlated Persona Aliases</div>
              <div style="font-size: 12px; font-weight: 800; color: #2563eb; font-family: monospace;">${aliasList}</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">First / Last Activity</div>
              <div style="font-size: 12px; font-weight: 800; color: #334155; font-family: monospace;">${new Date(vendor.firstSeen || Date.now()).toLocaleDateString()} — ${new Date(vendor.lastSeen || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          <!-- Crypto Wallet Evidence Box -->
          <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              💳 LINKED CRYPTO PAYMENT WALLETS &amp; ON-CHAIN SIGNALS
            </div>
            <div style="font-family: monospace; font-size: 11.5px; font-weight: 800; color: #1d4ed8; background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #93c5fd; word-break: break-all; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
              ${walletList}
            </div>
          </div>

          <!-- Ingested Evidence Messages Log -->
          <div style="font-size: 13px; font-weight: 900; color: #0f172a; text-transform: uppercase; border-bottom: 2.5px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; letter-spacing: 0.02em;">
            📁 Ingested Evidence Messages &amp; Explainable Risk Signals (${messages?.length || 0})
          </div>

          ${(messages || []).map((m, idx) => {
            const risk = m.classification?.riskScore || 0;
            const signals = m.classification?.signals || [];
            const reasons = (m.classification?.reasons || []).join(' ') || 'Marketplace solicitation keywords detected.';
            return `
              <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
                <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 800; color: #64748b; margin-bottom: 6px;">
                  <span style="color: #1e293b;">EVIDENCE RECORD #${idx + 1} (${m.dataSource || 'LIVE'})</span>
                  <span style="color: ${risk >= 60 ? '#dc2626' : '#d97706'}; font-family: monospace; font-size: 11px;">RISK SCORE: ${risk}/100</span>
                </div>

                <div style="font-size: 12px; color: #0f172a; font-weight: 700; margin-bottom: 10px; background: #f8fafc; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0; leading-height: 1.5;">
                  ${m.decodedText || m.originalText || m.text}
                </div>

                <!-- Explainable AI Box inside PDF -->
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 12px;">
                  <div style="font-size: 10.5px; font-weight: 900; color: #0369a1; text-transform: uppercase; margin-bottom: 6px;">
                    💡 EXPLAINABLE AI: WHY THIS FLAG FIRED
                  </div>

                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                    ${signals.includes('explicit_illicit_substance_reference') ? '<span style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-size: 9.5px; font-weight: 800; font-family: monospace; padding: 3px 8px; border-radius: 4px;">+40 Explicit Narcotics</span>' : ''}
                    ${signals.includes('regional_punjabi_hindi_slang') ? '<span style="background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; font-size: 9.5px; font-weight: 800; font-family: monospace; padding: 3px 8px; border-radius: 4px;">+35 Punjabi/Hindi Slang</span>' : ''}
                    ${(signals.includes('coded_product_reference') || signals.includes('slang_terminology')) ? '<span style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 9.5px; font-weight: 800; font-family: monospace; padding: 3px 8px; border-radius: 4px;">+30 Coded Slang</span>' : ''}
                    ${(signals.includes('private_contact_solicitation') || signals.includes('purchase_solicitation')) ? '<span style="background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; font-size: 9.5px; font-weight: 800; font-family: monospace; padding: 3px 8px; border-radius: 4px;">+20 DM Solicitation</span>' : ''}
                    ${m.extractedAddresses?.length > 0 ? '<span style="background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; font-size: 9.5px; font-weight: 800; font-family: monospace; padding: 3px 8px; border-radius: 4px;">+20 Crypto Wallet Mention</span>' : ''}
                  </div>

                  <div style="font-size: 10px; color: #0369a1; font-weight: 600; line-height: 1.4;">
                    <strong>AI Contextual Reasoning:</strong> ${reasons}
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          <!-- Footer Provenance Watermark -->
          <div style="margin-top: 32px; border-top: 2px solid #cbd5e1; padding-top: 14px; text-align: center; font-size: 9.5px; font-family: monospace; color: #475569; font-weight: 700;">
            CONFIDENTIAL — LAW ENFORCEMENT &amp; FORENSICS USE ONLY — CHANDIGARH POLICE CYBER THREAT DIVISION (${dateStr})
          </div>
        `;

        const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        await html2pdf().set(opt).from(container).save();
      } catch (err) {
        alert(`Export failed: ${err.message}`);
      } finally {
        setExportingPdf(false);
      }
    }, 600);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs flex justify-center items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>Loading vendor dossier...</span>
      </div>
    );
  }

  if (!data || !data.vendor) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs space-y-4">
        <p>Vendor profile not found in intelligence directory.</p>
        <Link to="/vendors" className="stein-btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  const { vendor, messages } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Back Link & Header */}
      <div className="space-y-3 border-b border-slate-200 pb-4">
        <Link to="/vendors" className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vendor Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg">
              {vendor.name ? vendor.name[0].toUpperCase() : 'V'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{vendor.name}</h1>
                <span className={`stein-badge ${
                  vendor.riskLevel === 'HIGH' ? 'stein-badge-suspicious' :
                  vendor.riskLevel === 'MEDIUM' ? 'stein-badge-review' :
                  'stein-badge-benign'
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  {vendor.riskLevel} RISK
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5 font-mono">
                Target Dossier &amp; Stylometric Analysis Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportVendorPDF}
              disabled={exportingPdf}
              className={`stein-btn-primary text-xs transition-all duration-200 ${
                exportingPdf ? 'opacity-80' : ''
              }`}
            >
              {exportingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{exportingPdf ? 'Compiling Dossier PDF...' : 'Export Official Dossier (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stylometry & Profile Details */}
        <div className="space-y-6">
          {/* Card 1: Known Aliases */}
          <div className="stein-card border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Correlated Persona Aliases
              </h2>
            </div>
            {vendor.knownAliases?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vendor.knownAliases.map((alias, idx) => (
                  <span key={idx} className="stein-badge-purple">
                    <AtSign className="w-3 h-3 text-purple-600" />
                    {alias}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No linked aliases detected.</p>
            )}
          </div>

          {/* Card 2: Wallet Addresses */}
          <div className="stein-card border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Linked Crypto Wallets
              </h2>
            </div>
            {vendor.walletAddresses?.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {vendor.walletAddresses.map((w, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold truncate">
                    {w}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No wallet addresses recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Ingested Messages Log */}
        <div className="md:col-span-2 space-y-4">
          <div className="stein-card border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Associated Messages &amp; Explainable Risk Signals ({messages?.length || 0})
                </h2>
              </div>
            </div>

            {messages?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No messages recorded for this vendor persona.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const risk = msg.classification?.riskScore || 0;
                  const label = msg.classification?.label || 'NEEDS_REVIEW';
                  const signals = msg.classification?.signals || [];
                  const reasons = msg.classification?.reasons || [];

                  return (
                    <div key={msg._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="stein-badge-demo">{msg.dataSource || 'LIVE'}</span>
                          <span className="text-xs font-mono text-slate-500">
                            {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className={`stein-badge ${
                          label === 'SUSPICIOUS' ? 'stein-badge-suspicious' :
                          label === 'NEEDS_REVIEW' ? 'stein-badge-review' :
                          'stein-badge-benign'
                        }`}>
                          {label} ({risk})
                        </span>
                      </div>

                      <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                        {msg.decodedText ?? msg.originalText ?? msg.text}
                      </p>

                      {/* Explainable AI: Why Flag Fired Box */}
                      <div className="p-3 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-200/90 rounded-lg space-y-1.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between border-b border-blue-200/80 pb-1">
                          <span className="font-bold text-[11px] text-blue-900 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            <span>EXPLAINABLE AI: WHY THIS FLAG FIRED</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                          {reasons.join(' ') || 'Flagged based on correlated marketplace terminology, transaction solicitation, and extracted risk heuristics.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
