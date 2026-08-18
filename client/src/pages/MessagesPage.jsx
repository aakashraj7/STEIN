import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Message Triage Queue</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Normalized messages ingested from Telegram test channel &amp; manual inputs with context-aware risk scoring
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-stein-surface border border-stein-border text-stein-text text-sm rounded-lg px-3 py-2"
          >
            <option value="">All Classifications</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="BENIGN">Benign</option>
          </select>
        </div>
      </div>

      {/* Manual Ingest Form */}
      <div className="stein-card space-y-3">
        <h2 className="text-sm font-semibold text-stein-text">Ingest Synthetic Test Message</h2>
        <form onSubmit={handleManualIngest} className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Author Signature / Sender (optional, e.g. 'Vendor_Alpha')"
            value={authorSignature}
            onChange={(e) => setAuthorSignature(e.target.value)}
            className="w-full md:w-64 bg-stein-surface-alt border border-stein-border rounded px-3 py-2 text-sm text-stein-text placeholder:text-stein-text-dim focus:outline-none focus:border-stein-accent"
          />
          <input
            type="text"
            placeholder="Enter message text (e.g. 'oye maal aa gaya fresh wala, rate vahi purana, DM kar de...')"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="flex-1 bg-stein-surface-alt border border-stein-border rounded px-3 py-2 text-sm text-stein-text placeholder:text-stein-text-dim focus:outline-none focus:border-stein-accent"
          />
          <button type="submit" disabled={submitting} className="stein-btn-primary text-sm whitespace-nowrap">
            {submitting ? 'Analyzing Context...' : 'Ingest & Classify'}
          </button>
        </form>
      </div>

      {/* Message List Table */}
      <div className="stein-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-stein-text-dim text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-center text-stein-text-dim text-sm">No messages match criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stein-text">
              <thead className="bg-stein-surface-alt text-stein-text-dim text-xs uppercase border-b border-stein-border">
                <tr>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4">Vendor Identity</th>
                  <th className="py-3 px-4">Message Content</th>
                  <th className="py-3 px-4">Classification &amp; Risk</th>
                  <th className="py-3 px-4">Extracted Signals</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stein-border/50">
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-white/5 transition-colors align-top">
                    <td className="py-3 px-4">
                      {msg.dataSource === 'LIVE' ? (
                        <span className="stein-badge-live">LIVE TELEGRAM</span>
                      ) : (
                        <span className="stein-badge-demo">DEMO / SNAPSHOT</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-stein-accent-bright">
                      {msg.vendorId?.name || (msg.metadata?.authorSignature ? `Author: ${msg.metadata.authorSignature}` : 'Unassigned Author')}
                    </td>
                    <td className="py-3 px-4 max-w-md space-y-2">
                      {msg.encodingDetected ? (
                        <div className="space-y-1.5 bg-stein-surface-alt/60 p-2.5 rounded border border-amber-500/30">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                              ENCODED: {msg.encodingDetected}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-stein-text-dim block uppercase tracking-wider">Original:</span>
                            <p className="text-stein-text-dim text-xs font-mono bg-black/40 p-1.5 rounded border border-stein-border/40 break-all">
                              {msg.originalText ?? msg.text}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-stein-cyan block uppercase tracking-wider">Decoded:</span>
                            <p className="text-stein-text text-xs font-medium bg-black/40 p-1.5 rounded border border-stein-border/40">
                              {msg.decodedText ?? msg.text}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-stein-text text-sm">{msg.decodedText ?? msg.originalText ?? msg.text}</p>
                      )}
                      {msg.classification?.reasons?.length > 0 && (
                        <p className="text-xs text-stein-text-dim italic">
                          💡 {msg.classification.reasons.join(' ')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 space-y-1 whitespace-nowrap">
                      <div>
                        {msg.classification?.label === 'SUSPICIOUS' ? (
                          <span className="stein-badge-suspicious">SUSPICIOUS</span>
                        ) : msg.classification?.label === 'NEEDS_REVIEW' ? (
                          <span className="stein-badge-review">NEEDS REVIEW</span>
                        ) : (
                          <span className="stein-badge-benign">BENIGN</span>
                        )}
                      </div>
                      <div className="text-xs font-mono">
                        Risk Score: <strong className={
                          (msg.classification?.riskScore || 0) >= 60 ? 'text-red-400' :
                          (msg.classification?.riskScore || 0) >= 30 ? 'text-amber-400' : 'text-slate-400'
                        }>{msg.classification?.riskScore ?? 0} / 100</strong>
                      </div>
                      <div className="text-[10px] text-stein-text-dim">
                        Confidence: {Math.round((msg.classification?.confidence || 0) * 100)}%
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {msg.classification?.signals?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {msg.classification.signals.map((sig, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-stein-surface-alt border border-stein-border text-stein-cyan font-mono">
                              {sig}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-stein-text-dim">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-stein-text-dim whitespace-nowrap">
                      {new Date(msg.timestamp).toLocaleString()}
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
