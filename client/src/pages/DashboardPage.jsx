import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Zap,
  MessageSquare,
  Users,
  Target,
  Briefcase,
  Radio,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Clock,
  Code2,
  Sparkles,
  Send,
  TrendingUp,
  Database,
  Search,
  Play,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ messages: 0, vendors: 0, leads: 0, cases: 0 });
  const [teleStatus, setTeleStatus] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [msgs, vends, leads, cs, tele] = await Promise.all([
        api.getMessages({ limit: 5 }),
        api.getVendors(),
        api.getLeads(),
        api.getCases(),
        api.telegramStatus(),
      ]);

      setStats({
        messages: msgs.total || msgs.data?.length || 0,
        vendors: vends.data?.length || 0,
        leads: leads.data?.length || 0,
        cases: cs.data?.length || 0,
      });

      setRecentMessages(msgs.data || []);
      setTeleStatus(tele.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.seed();
      setSeedResult(res);
      await loadData();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner Section */}
      <div className="bg-[#111827] p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Investigation Dashboard
            </h1>
            <span className="stein-badge-cyan">
              LIVE INTEL
            </span>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            Telegram Drug-Market Intelligence &amp; Correlation System
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="stein-btn-primary text-xs"
          >
            {seeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{seeding ? 'Seeding...' : 'Seed Demo Scenario'}</span>
          </button>
        </div>
      </div>

      {seedResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-xs flex justify-between items-center shadow-cyber-emerald">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Demo scenario successfully seeded (Vendors, Messages, Wallets, Leads, Case, Report &amp; Audit Log created).</span>
          </div>
          <button onClick={() => setSeedResult(null)} className="text-xs hover:underline text-emerald-300 font-semibold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Telegram Status Banner */}
      <div className="stein-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Send className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Telegram Channel Monitor</span>
              {teleStatus?.mode === 'LIVE' ? (
                <span className="stein-badge-live">LIVE TELEGRAM</span>
              ) : (
                <span className="stein-badge-demo">DEMO MODE</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {teleStatus?.mode === 'LIVE'
                ? `Active bot @${teleStatus.botUsername} monitoring channel ${teleStatus.channelId}`
                : 'No Telegram bot token configured. Operating on synthetic seeded data snapshot.'}
            </p>
          </div>
        </div>

        <Link to="/messages" className="stein-btn-secondary text-xs shrink-0">
          <span>View Triage Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ingested */}
        <div className="stein-card-hover group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-emerald-400 text-[10px] font-mono font-medium">
              ↑ 12% 24h
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Ingested</p>
            <p className="text-2xl font-bold mt-0.5 text-white font-mono">{stats.messages}</p>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Telegram &amp; Manual Feeds</p>
          </div>
        </div>

        {/* Card 2: Tracked Vendors */}
        <div className="stein-card-hover group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-[10px] font-mono font-medium">
              0% 24h
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Tracked Vendors</p>
            <p className="text-2xl font-bold mt-0.5 text-white font-mono">{stats.vendors}</p>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Correlated Profiles</p>
          </div>
        </div>

        {/* Card 3: Investigative Leads */}
        <div className="stein-card-hover group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-amber-400 text-[10px] font-mono font-medium">
              ↑ 100% 24h
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Investigative Leads</p>
            <p className="text-2xl font-bold mt-0.5 text-amber-400 font-mono">{stats.leads}</p>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">High Risk Signals</p>
          </div>
        </div>

        {/* Card 4: Active Cases */}
        <div className="stein-card-hover group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-slate-400 text-[10px] font-mono font-medium">
              Active
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Active Cases</p>
            <p className="text-2xl font-bold mt-0.5 text-white font-mono">{stats.cases}</p>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Dossiers Built</p>
          </div>
        </div>
      </div>

      {/* Recent Messages Triage Snippet */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Recent Ingested Messages</h2>
          </div>
          <Link to="/messages" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            <span>View All Triage Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400 text-xs py-8 text-center flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Loading message intelligence...</span>
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="text-slate-500 text-xs py-8 text-center">
            No messages found. Click <strong className="text-slate-300">"Seed Demo Scenario"</strong> above to populate.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentMessages.map((msg) => {
              const vendorName = msg.vendorId?.name || msg.metadata?.authorSignature || 'Vendor_Alpha';
              const riskScore = msg.classification?.riskScore ?? 0;
              const label = msg.classification?.label || 'NEEDS_REVIEW';

              return (
                <div
                  key={msg._id}
                  className="px-5 py-3.5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {msg.dataSource === 'LIVE' ? (
                        <span className="stein-badge-live">LIVE</span>
                      ) : (
                        <span className="stein-badge-demo">DEMO</span>
                      )}
                      <span className="text-xs font-semibold text-slate-100">
                        {vendorName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      {msg.encodingDetected && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-400 border border-amber-800/50 flex items-center gap-1 shrink-0">
                          <Code2 className="w-3 h-3" />
                          {msg.encodingDetected}
                        </span>
                      )}
                      <p className="line-clamp-1 font-normal">
                        {msg.decodedText ?? msg.originalText ?? msg.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {label === 'SUSPICIOUS' ? (
                      <span className="stein-badge-suspicious">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        SUSPICIOUS ({riskScore})
                      </span>
                    ) : label === 'NEEDS_REVIEW' ? (
                      <span className="stein-badge-review">
                        NEEDS REVIEW ({riskScore})
                      </span>
                    ) : (
                      <span className="stein-badge-benign">BENIGN</span>
                    )}

                    {msg.extractedAddresses?.length > 0 && (
                      <span className="stein-badge-cyan">
                        {msg.extractedAddresses.length} Crypto Address(es)
                      </span>
                    )}
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
