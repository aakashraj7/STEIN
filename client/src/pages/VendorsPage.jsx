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

import { useLanguage } from '../i18n/LanguageContext';

export default function VendorsPage() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVendors()
      .then((res) => setVendors(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>{t('vendorTitle')}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {t('vendorSubtitle')}
          </p>
        </div>
        <Link to="/stylometry" className="stein-btn-primary text-xs">
          <Feather className="w-4 h-4" />
          <span>{t('styloCompBtn')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-slate-500 text-xs py-12 flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 text-xs py-12 font-medium">
            No vendor profiles found.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor._id} className="stein-card-hover flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {vendor.name ? vendor.name[0].toUpperCase() : 'V'}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </h2>
                      <div className="flex items-center gap-1 text-[11px] text-blue-600 font-mono">
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
                    {vendor.riskLevel === 'HIGH' ? t('highRisk') : vendor.riskLevel === 'MEDIUM' ? t('mediumRisk') : t('lowRisk')}
                  </span>
                </div>

                {/* Aliases & Stats */}
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">{t('knownAliasesHeader')}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vendor.aliases && vendor.aliases.length > 0 ? (
                        vendor.aliases.map((alias, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-medium">
                            {alias}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">{t('noneRecorded')}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <Link
                      to={`/messages?vendor=${encodeURIComponent(vendor.name)}`}
                      className="bg-slate-50 hover:bg-blue-50/70 p-2 rounded border border-slate-200 hover:border-blue-300 flex items-center gap-2 transition-colors group/msg"
                      title={`View all messages from ${vendor.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 group-hover/msg:scale-110 transition-transform" />
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase font-bold group-hover/msg:text-blue-700">{t('messagesCount')}</div>
                        <div className="font-bold text-slate-900 font-mono group-hover/msg:text-blue-700">{vendor.messageCount || 0}</div>
                      </div>
                    </Link>

                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <div className="text-slate-500 text-[9px] uppercase font-bold">{t('walletsCount')}</div>
                        <div className="font-bold text-emerald-600 font-mono">{(vendor.walletAddresses || []).length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {t('firstSeen')}: {new Date(vendor.firstSeen).toLocaleDateString()}
                </span>
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{t('fullDossier')}</span>
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
