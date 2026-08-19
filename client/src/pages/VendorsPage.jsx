import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Feather,
  Wallet,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  AtSign,
} from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVendors()
      .then((res) => setVendors(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Tracked Vendor Identities</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Aggregated seller profiles, alias clusters, and stylometric fingerprints
          </p>
        </div>
        <Link to="/stylometry" className="stein-btn-cyan text-xs">
          <Feather className="w-4 h-4" />
          <span>Stylometry Comparison</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-slate-400 text-xs py-12 flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Fetching vendor intelligence directory...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 text-xs py-12">
            No vendor profiles found. Please seed data first on the Dashboard.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor._id} className="stein-card-hover flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {vendor.name ? vendor.name[0].toUpperCase() : 'V'}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {vendor.name}
                      </h2>
                      <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                        <AtSign className="w-3 h-3" />
                        <span>{vendor.telegramUsername || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`stein-badge ${
                    vendor.riskLevel === 'HIGH' ? 'stein-badge-suspicious' :
                    vendor.riskLevel === 'MEDIUM' ? 'stein-badge-review' :
                    'stein-badge-benign'
                  }`}>
                    {vendor.riskLevel} RISK
                  </span>
                </div>

                {/* Aliases & Stats */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Known Aliases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.aliases && vendor.aliases.length > 0 ? (
                        vendor.aliases.map((alias, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]">
                            {alias}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">None recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase font-bold">Messages</div>
                        <div className="font-bold text-white font-mono">{vendor.messageCount || 0}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60 flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase font-bold">Wallets</div>
                        <div className="font-bold text-emerald-400 font-mono">{(vendor.walletAddresses || []).length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  First Seen: {new Date(vendor.firstSeen).toLocaleDateString()}
                </span>
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Full Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
