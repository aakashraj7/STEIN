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

          <Link to="/stylometry" className="stein-btn-primary text-xs">
            <Feather className="w-4 h-4" />
            <span>Compare Stylometry</span>
          </Link>
        </div>
      </div>

      {/* Metadata Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stein-card border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Known Aliases</span>
          <div className="flex flex-wrap gap-1 pt-1">
            {vendor.aliases && vendor.aliases.length > 0 ? (
              vendor.aliases.map((alias, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-medium">
                  {alias}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">No aliases recorded</span>
            )}
          </div>
        </div>

        <div className="stein-card border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Telegram Handle</span>
          <p className="text-sm font-bold text-blue-600 font-mono flex items-center gap-1 mt-1">
            <AtSign className="w-4 h-4 text-blue-600" />
            <span>{vendor.telegramUsername || 'Unlinked'}</span>
          </p>
        </div>

        <div className="stein-card border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Linked Wallets</span>
          <div className="flex flex-wrap gap-1 pt-1">
            {vendor.walletAddresses && vendor.walletAddresses.length > 0 ? (
              vendor.walletAddresses.map((addr, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-medium">
                  {addr.substring(0, 8)}...{addr.substring(36)}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">No wallets linked</span>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Ingested Messages List */}
      <div className="stein-card border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Ingested Messages Corpora ({messages ? messages.length : 0})</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Stylometry Input Pool</span>
        </div>

        {!messages || messages.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No ingested messages linked to this vendor profile yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div key={msg._id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-900 font-medium">{msg.text}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`stein-badge ${
                    msg.classification?.label === 'SUSPICIOUS' ? 'stein-badge-suspicious' :
                    msg.classification?.label === 'NEEDS_REVIEW' ? 'stein-badge-review' :
                    'stein-badge-benign'
                  }`}>
                    {msg.classification?.label || 'UNCLASSIFIED'} ({msg.classification?.riskScore || 0})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
