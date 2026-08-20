import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  MessageSquareText,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Send,
  Eye,
  ShieldCheck,
  Clock,
  Terminal,
  User,
  ShieldAlert,
  MessageSquare,
  Activity,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Code2,
} from 'lucide-react';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVendorFilter = searchParams.get('vendor') || '';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [manualText, setManualText] = useState('');
  const [authorSignature, setAuthorSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const expandMsgId = searchParams.get('expand') || searchParams.get('msgId') || null;

  const fetchMessages = () => {
    setLoading(true);
    const params = {};
    if (filter) params.classification = filter;

    api.getMessages(params)
      .then((res) => {
        setMessages(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  useEffect(() => {
    if (expandMsgId) {
      setExpandedId(expandMsgId);
    }
  }, [expandMsgId, messages]);

  const handleManualIngest = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    setSubmitting(true);
    api.ingestMessage({
      text: manualText,
      metadata: { authorSignature: authorSignature || 'Manual_Operator' },
    })
      .then(() => {
        setManualText('');
        fetchMessages();
      })
      .catch(console.error)
      .finally(() => setSubmitting(false));
  };

  const setVendorFilter = (vendorName) => {
    if (vendorName) {
      setSearchParams({ vendor: vendorName });
    } else {
      searchParams.delete('vendor');
      setSearchParams(searchParams);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter by vendor name if selected in URL
  const displayedMessages = messages.filter((msg) => {
    if (!selectedVendorFilter) return true;
    const vName = msg.vendorId?.name || msg.metadata?.authorSignature || '';
    return vName.toLowerCase() === selectedVendorFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-blue-600" />
            <span>Ingested Messages Triage</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Real-time rule engine &amp; zero-shot classifier triage queue
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selectedVendorFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold font-mono">
              <span>Filtered: {selectedVendorFilter}</span>
              <button
                onClick={() => setVendorFilter('')}
                className="hover:text-blue-950 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
                title="Clear vendor filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="">All Classifications</option>
              <option value="SUSPICIOUS">Suspicious Only</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="BENIGN">Benign</option>
            </select>
          </div>
        </div>
      </div>

      {/* Terminal Manual Ingest Form */}
      <div className="stein-card border-slate-200 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <Terminal className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Ingest Synthetic Test Message
          </h2>
        </div>
        <form onSubmit={handleManualIngest} className="flex flex-col md:flex-row gap-2">
          <div className="relative w-full md:w-64">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sender (e.g. 'Vendor_Alpha')"
              value={authorSignature}
              onChange={(e) => setAuthorSignature(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono font-medium"
            />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter raw message text..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
          <button type="submit" disabled={submitting} className="stein-btn-primary text-xs shrink-0">
            {submitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? 'Classifying...' : 'Ingest & Classify'}</span>
          </button>
        </form>
      </div>

      {/* Minimal & Professional Table with Expandable Details */}
      <div className="space-y-2.5">
        {/* Table Header Bar */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600">
          <div className="col-span-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SOURCE</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>VENDOR IDENTITY</span>
          </div>
          <div className="col-span-4 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>MESSAGE CONTENT</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>CLASSIFICATION &amp; RISK</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>TIMESTAMP</span>
          </div>
          <div className="col-span-1 text-right">
            <span>ACTION</span>
          </div>
        </div>

        {/* Message Rows */}
        {loading ? (
          <div className="stein-card p-12 text-center text-slate-500 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Fetching triage messages...</span>
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="stein-card p-12 text-center text-slate-500 text-xs font-medium space-y-2">
            <p>No messages match the selected criteria.</p>
            {selectedVendorFilter && (
              <button
                onClick={() => setVendorFilter('')}
                className="stein-btn-secondary text-xs inline-flex items-center gap-1 mt-1"
              >
                Clear Vendor Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedMessages.map((msg) => {
              const vendorName = msg.vendorId?.name || msg.metadata?.authorSignature || 'Vendor_Alpha';
              const initials = vendorName.substring(0, 2).toUpperCase();
              const riskScore = msg.classification?.riskScore ?? 0;
              const confidence = Math.round((msg.classification?.confidence || 0.7) * 100);
              const label = msg.classification?.label || 'NEEDS_REVIEW';
              const signals = msg.classification?.signals || [];
              const isExpanded = expandedId === msg._id;

              return (
                <div
                  key={msg._id}
                  className="border border-slate-200 rounded-xl bg-white shadow-sm transition-all overflow-hidden"
                >
                  {/* Minimal Primary Row */}
                  <div
                    onClick={() => toggleExpand(msg._id)}
                    className="grid grid-cols-12 gap-3 p-3.5 items-center hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Col 1: Source */}
                    <div className="col-span-1">
                      {msg.dataSource === 'LIVE' ? (
                        <span className="stein-badge-live">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          LIVE
                        </span>
                      ) : (
                        <span className="stein-badge-demo">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          DEMO
                        </span>
                      )}
                    </div>

                    {/* Col 2: Vendor Identity Link to Vendor Dossier Profile */}
                    <div className="col-span-2 flex items-center gap-2">
                      <Link
                        to={msg.vendorId?._id ? `/vendors/${msg.vendorId._id}` : `/vendors`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-left hover:text-blue-600 group text-xs font-semibold text-slate-900 truncate"
                        title={`View Dossier Profile for ${vendorName}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-bold font-mono text-[10px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          {initials}
                        </div>
                        <span className="truncate group-hover:underline">{vendorName}</span>
                      </Link>
                    </div>

                    {/* Col 3: Message Content Snippet */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-xs text-slate-800 truncate font-normal">
                        {msg.decodedText ?? msg.originalText ?? msg.text}
                      </p>
                    </div>

                    {/* Col 4: Classification & Risk Badge */}
                    <div className="col-span-2 flex items-center gap-2">
                      {label === 'SUSPICIOUS' ? (
                        <span className="stein-badge-suspicious">
                          <Eye className="w-3 h-3 text-red-600" />
                          SUSPICIOUS ({riskScore})
                        </span>
                      ) : label === 'NEEDS_REVIEW' ? (
                        <span className="stein-badge-review">
                          <Eye className="w-3 h-3 text-amber-600" />
                          REVIEW ({riskScore})
                        </span>
                      ) : (
                        <span className="stein-badge-benign">
                          BENIGN ({riskScore})
                        </span>
                      )}
                    </div>

                    {/* Col 5: Timestamp */}
                    <div className="col-span-2 text-slate-600 font-mono text-xs">
                      {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Col 6: Expand Action Button */}
                    <div className="col-span-1 text-right flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(msg._id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3 animate-fade-in-up text-xs">
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-200 pb-3">
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Full Original Message Text</span>
                          <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 leading-relaxed font-sans">
                            {msg.decodedText ?? msg.originalText ?? msg.text}
                          </p>
                        </div>

                        <div className="space-y-1.5 md:w-64 shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Risk Score &amp; Confidence</span>
                          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                            <div className="flex justify-between items-center font-mono">
                              <span className="text-slate-600 font-semibold">Risk Score:</span>
                              <span className={`font-bold ${riskScore >= 60 ? 'text-red-600' : riskScore >= 30 ? 'text-amber-600' : 'text-slate-700'}`}>
                                {riskScore} / 100
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${riskScore >= 60 ? 'bg-red-500' : riskScore >= 30 ? 'bg-amber-500' : 'bg-slate-400'}`}
                                style={{ width: `${Math.min(100, Math.max(8, riskScore))}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                              <span>Confidence:</span>
                              <span className="font-bold text-slate-800">{confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explainable AI: Why Flag Fired Panel (Light Enterprise Styling) */}
                      <div className="p-4 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-200/90 rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                          <span className="font-extrabold text-xs text-blue-900 flex items-center gap-2 uppercase tracking-wider">
                            <Lightbulb className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span>EXPLAINABLE AI: WHY THIS FLAG FIRED</span>
                          </span>
                          <span className="font-mono text-[10px] text-blue-800 font-extrabold bg-white px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                            RISK SCORE: {riskScore}/100
                          </span>
                        </div>

                        {/* Point Breakdown Badges */}
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {signals.includes('explicit_illicit_substance_reference') && (
                            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 border border-red-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-red-600" />
                              +40 Explicit Substance / Narcotics
                            </span>
                          )}
                          {(signals.includes('coded_product_reference') || signals.includes('slang_terminology')) && (
                            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-amber-600" />
                              +30 Coded Terminology / Regional Slang
                            </span>
                          )}
                          {(signals.includes('private_contact_solicitation') || signals.includes('purchase_solicitation')) && (
                            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              +20 Private Contact / DM Solicitation
                            </span>
                          )}
                          {msg.extractedAddresses?.length > 0 && (
                            <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 border border-purple-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-purple-600" />
                              +20 Crypto Payment Address Mention
                            </span>
                          )}
                          {msg.encodingDetected && (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              +10 Obfuscated Payload Decoded ({msg.encodingDetected})
                            </span>
                          )}
                        </div>

                        {/* AI Contextual Summary */}
                        <div className="p-3 bg-white border border-blue-200/80 rounded-lg text-slate-800 text-xs leading-relaxed font-sans shadow-2xs">
                          <strong className="text-blue-950 font-bold">AI Reasoning Summary:</strong>{' '}
                          {msg.classification?.reasons?.join(' ') || 'Flagged based on correlated marketplace terminology, transaction solicitation, and extracted risk heuristics.'}
                        </div>

                        {/* Extracted Signals Tags */}
                        {signals.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 border-t border-blue-200/60">
                            <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">Signals:</span>
                            <div className="flex flex-wrap gap-1">
                              {signals.map((sig, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-mono text-[10px] font-bold">
                                  {sig}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-200">
                        <span>Message ID: {msg._id}</span>
                        <Link
                          to={msg.vendorId?._id ? `/vendors/${msg.vendorId._id}` : `/vendors`}
                          className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                        >
                          <span>View Vendor Dossier Profile ({vendorName})</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
