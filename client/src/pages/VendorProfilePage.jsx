import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function VendorProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVendor(id)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-stein-text-dim">Loading vendor profile...</div>;
  if (!data || !data.vendor) return <div className="p-6 text-stein-text-dim">Vendor not found.</div>;

  const { vendor, messages } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stein-accent-bright">{vendor.name}</h1>
            <span className="stein-badge bg-red-500/20 text-red-400 border border-red-500/30">
              {vendor.riskLevel} RISK
            </span>
          </div>
          <p className="text-stein-text-dim text-sm mt-1">
            Vendor Profile &amp; Intelligence Analysis
          </p>
        </div>
        <Link to="/stylometry" className="stein-btn-primary text-sm">
          ✍ Compare Stylometry
        </Link>
      </div>

      {/* Metadata Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stein-card">
          <span className="text-xs uppercase text-stein-text-dim font-medium">Known Aliases</span>
          <p className="text-base font-semibold text-stein-text mt-1">
            {(vendor.aliases || []).join(', ') || 'None recorded'}
          </p>
        </div>
        <div className="stein-card">
          <span className="text-xs uppercase text-stein-text-dim font-medium">Telegram Identifier</span>
          <p className="text-base font-semibold text-stein-cyan mt-1">
            @{vendor.telegramUsername || 'N/A'}
          </p>
        </div>
        <div className="stein-card">
          <span className="text-xs uppercase text-stein-text-dim font-medium">Linked Wallets</span>
          <p className="text-base font-mono font-semibold text-stein-warning mt-1">
            {(vendor.walletAddresses || []).length > 0
              ? vendor.walletAddresses.map(w => w.substring(0, 10) + '...').join(', ')
              : 'None'}
          </p>
        </div>
      </div>

      {/* Associated Messages */}
      <div className="stein-card space-y-4">
        <h2 className="text-lg font-semibold text-stein-text border-b border-stein-border pb-2">
          Ingested Messages ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <div className="text-stein-text-dim text-sm py-4">No messages associated with this vendor yet.</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m._id} className="p-3 bg-stein-surface-alt rounded border border-stein-border/50 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stein-text-dim">{new Date(m.timestamp).toLocaleString()}</span>
                  <span className="stein-badge-suspicious">
                    {m.classification?.label} ({Math.round((m.classification?.confidence || 0) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {m.encodingDetected && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ENCODED: {m.encodingDetected}
                    </span>
                  )}
                  <p className="text-sm text-stein-text">{m.decodedText ?? m.originalText ?? m.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
