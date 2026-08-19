import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Loading vendor dossier...</span>
      </div>
    );
  }

  if (!data || !data.vendor) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs space-y-4">
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link to="/vendors" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Vendor Directory</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-[1px] shadow-cyber-blue">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-cyan-300 font-bold text-lg">
                {vendor.name ? vendor.name[0].toUpperCase() : 'V'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white">{vendor.name}</h1>
                <span className={`stein-badge ${
                  vendor.riskLevel === 'HIGH' ? 'stein-badge-suspicious' :
                  vendor.riskLevel === 'MEDIUM' ? 'stein-badge-review' :
                  'stein-badge-benign'
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  {vendor.riskLevel} RISK
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                Target Dossier &amp; Stylometric Analysis Profile
              </p>
            </div>
          </div>

          <Link to="/stylometry" className="stein-btn-cyan text-xs">
            <Feather className="w-4 h-4" />
            <span>Compare Stylometry</span>
          </Link>
        </div>
      </div>

      {/* Metadata Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stein-card border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Known Aliases</span>
          <div className="flex flex-wrap gap-1 pt-1">
            {vendor.aliases && vendor.aliases.length > 0 ? (
              vendor.aliases.map((alias, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs font-semibold">
                  {alias}
                </span>
              ))
            ) : (
              <p className="text-xs font-semibold text-slate-400">None recorded</p>
            )}
          </div>
        </div>

        <div className="stein-card border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Telegram Identifier</span>
          <p className="text-base font-bold text-cyan-400 font-mono flex items-center gap-1">
            <AtSign className="w-4 h-4" />
            <span>{vendor.telegramUsername || 'N/A'}</span>
          </p>
        </div>

        <div className="stein-card border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Linked Crypto Wallets</span>
          <div className="flex items-center gap-1.5 pt-1">
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs font-mono font-semibold text-emerald-400 truncate">
              {(vendor.walletAddresses || []).length > 0
                ? vendor.walletAddresses.map(w => w.substring(0, 12) + '...').join(', ')
                : 'None Linked'}
            </p>
          </div>
        </div>
      </div>

      {/* Associated Messages */}
      <div className="stein-card border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-slate-100">
            Correlated Messages ({messages.length})
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="text-slate-500 text-xs py-6 text-center">No messages associated with this vendor yet.</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m._id} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{new Date(m.timestamp).toLocaleString()}</span>
                  </div>
                  <span className="stein-badge-suspicious text-[10px]">
                    {m.classification?.label} ({Math.round((m.classification?.confidence || 0) * 100)}%)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  {m.encodingDetected && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-amber-400" />
                      ENCODED: {m.encodingDetected}
                    </span>
                  )}
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{m.decodedText ?? m.originalText ?? m.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
