import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Filter,
  Send,
  MessageSquare,
  ShieldAlert,
  Code2,
  Lightbulb,
  Radio,
  RefreshCw,
  Search,
  Terminal,
  User,
  Activity,
  Eye,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [manualText, setManualText] = useState('');
  const [authorSignature, setAuthorSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages(filter ? { classification: filter } : {});
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manualText, authorSignature: authorSignature.trim() || undefined }),
      });
      if (res.ok) {
        setManualText('');
        setAuthorSignature('');
        fetchMessages();
      }
    } catch (err) {
      alert(`Error ingesting message: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span>Message Triage Queue</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Normalized messages ingested from Telegram test channel &amp; manual inputs with context-aware risk scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-8 py-2 font-semibold focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
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
      <div className="stein-card bg-slate-950/80 border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Ingest Synthetic Test Message
          </h2>
        </div>
        <form onSubmit={handleManualIngest} className="flex flex-col md:flex-row gap-2">
          <div className="relative w-full md:w-64">
            <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sender (e.g. 'Vendor_Alpha')"
              value={authorSignature}
              onChange={(e) => setAuthorSignature(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter raw message (e.g. 'oye maal aa gaya fresh wala, rate vahi purana, DM kar de...')"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button type="submit" disabled={submitting} className="stein-btn-cyan text-xs shrink-0">
            {submitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? 'Classifying...' : 'Ingest & Classify'}</span>
          </button>
        </form>
      </div>

      {/* Message List Card Grid Table */}
      <div className="space-y-2.5">
        {/* Table Header Bar */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-[#111827] border border-slate-800 rounded-lg text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>PROVENANCE</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>VENDOR IDENTITY</span>
          </div>
          <div className="col-span-4 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>MESSAGE CONTENT &amp; DECODING</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>CLASSIFICATION &amp; RISK</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>EXTRACTED SIGNALS</span>
          </div>
          <div className="col-span-1 flex items-center gap-1.5 justify-end">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>TIMESTAMP</span>
          </div>
        </div>

        {/* Message Rows */}
        {loading ? (
          <div className="stein-card p-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Fetching triage messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="stein-card p-12 text-center text-slate-500 text-xs">
            No messages match the selected criteria. Try changing the filter above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((msg) => {
              const vendorName = msg.vendorId?.name || msg.metadata?.authorSignature || 'Vendor_Alpha';
              const initials = vendorName.substring(0, 2).toUpperCase();
              const riskScore = msg.classification?.riskScore ?? 0;
              const confidence = Math.round((msg.classification?.confidence || 0.7) * 100);
              const label = msg.classification?.label || 'NEEDS_REVIEW';
              const signals = msg.classification?.signals || [];

              return (
                <div
                  key={msg._id}
                  className="grid grid-cols-12 gap-4 p-4 items-center bg-[#111827] border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-[#161f33] transition-colors group"
                >
                  {/* Col 1: Provenance */}
                  <div className="col-span-1">
                    {msg.dataSource === 'LIVE' ? (
                      <span className="stein-badge-live">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        LIVE
                      </span>
                    ) : (
                      <span className="stein-badge-demo">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        DEMO
                      </span>
                    )}
                  </div>

                  {/* Col 2: Vendor Identity */}
                  <div className="col-span-2 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold font-mono text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <span className="text-slate-200 font-semibold text-xs mt-1 truncate max-w-[130px]">
                      {vendorName}
                    </span>
                  </div>

                  {/* Col 3: Message Content & Decoding */}
                  <div className="col-span-4 space-y-2">
                    <div className="flex items-start gap-2 text-slate-200 text-xs leading-relaxed">
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{msg.decodedText ?? msg.originalText ?? msg.text}</span>
                    </div>

                    {(msg.classification?.reasons?.length > 0 || msg.encodingDetected) && (
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs font-mono flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-300">
                            {msg.classification?.reasons?.length > 1
                              ? 'Multiple contextual signals detected:'
                              : 'Contextual signal detected:'}
                          </span>{' '}
                          <span className="text-amber-200/90">
                            {msg.classification?.reasons?.join(' ') || (msg.classification?.signals ? msg.classification.signals.join(', ') : 'multilingual_expression.')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Col 4: Classification & Risk */}
                  <div className="col-span-2 space-y-2">
                    <div>
                      {label === 'SUSPICIOUS' ? (
                        <span className="stein-badge-suspicious">
                          <Eye className="w-3.5 h-3.5 text-red-400" />
                          SUSPICIOUS
                        </span>
                      ) : label === 'NEEDS_REVIEW' ? (
                        <span className="stein-badge-review">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          NEEDS REVIEW
                        </span>
                      ) : (
                        <span className="stein-badge-benign">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          BENIGN
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400">Risk Score</div>
                      <div
                        className={`text-xs font-bold font-mono ${
                          riskScore >= 60 ? 'text-red-400' : riskScore >= 30 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {riskScore} / 100
                      </div>
                      <div className="w-32 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            riskScore >= 60
                              ? 'bg-red-500'
                              : riskScore >= 30
                              ? 'bg-amber-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, riskScore))}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                        Confidence: {confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Col 5: Extracted Signals */}
                  <div className="col-span-2">
                    {signals.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {signals.map((sig, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[10px] font-mono w-fit"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {sig}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">—</span>
                    )}
                  </div>

                  {/* Col 6: Timestamp */}
                  <div className="col-span-1 text-right text-slate-400 font-mono text-xs space-y-0.5">
                    <div className="flex items-center justify-end gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
