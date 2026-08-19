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
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-6 md:p-7 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Animated Radar & Target Network Graphic */}
        <div className="absolute right-32 md:right-48 top-1/2 -translate-y-1/2 opacity-35 pointer-events-none hidden sm:block">
          <svg width="220" height="220" viewBox="0 0 200 200" fill="none" className="overflow-visible">
            {/* Outer dashed ring rotating clockwise */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              className="animate-[spin_25s_linear_infinite] origin-[100px_100px]"
            />
            {/* Middle solid ring */}
            <circle cx="100" cy="100" r="60" stroke="#3b82f6" strokeWidth="1.5" className="opacity-80" />
            {/* Inner dashed ring rotating counter-clockwise */}
            <circle
              cx="100"
              cy="100"
              r="35"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-[spin_12s_linear_infinite_reverse] origin-[100px_100px]"
            />

            {/* Target Radial Lines */}
            <line x1="20" y1="50" x2="100" y2="100" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
            <line x1="180" y1="40" x2="100" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
            <line x1="165" y1="165" x2="100" y2="100" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />

            {/* Rotating Radar Sweep Cone */}
            <g className="animate-[spin_4s_linear_infinite] origin-[100px_100px]">
              <line x1="100" y1="100" x2="185" y2="100" stroke="url(#radarSweep)" strokeWidth="2.5" />
              <polygon points="100,100 185,100 170,60" fill="url(#radarCone)" opacity="0.3" />
            </g>

            {/* Pulsing Node Target Dots */}
            <circle cx="20" cy="50" r="5" fill="#06b6d4" className="animate-pulse" />
            <circle cx="180" cy="40" r="6" fill="#3b82f6" className="animate-ping opacity-75" />
            <circle cx="180" cy="40" r="6" fill="#3b82f6" />
            <circle cx="165" cy="165" r="5" fill="#6366f1" className="animate-pulse" />
            <circle cx="100" cy="100" r="6" fill="#06b6d4" className="drop-shadow-[0_0_8px_#06b6d4]" />

            <defs>
              <linearGradient id="radarSweep" x1="100" y1="100" x2="185" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="radarCone" x1="100" y1="100" x2="185" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="space-y-2.5 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Investigation Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wider">
              LIVE INTEL
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm font-medium">
            Synthetic Telegram Drug-Market Intelligence &amp; Correlation System
          </p>

          <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Systems Operational</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Updated: Just now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="stein-btn-cyan text-xs shrink-0"
          >
            {seeding ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
            ) : (
              <Play className="w-4 h-4 text-cyan-300" />
            )}
            <span>{seeding ? 'SEEDING SCENARIO...' : 'SEED DEMO SCENARIO'}</span>
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
      <div className="stein-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Send className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Telegram Channel Monitor</span>
              {teleStatus?.mode === 'LIVE' ? (
                <span className="stein-badge-live">LIVE TELEGRAM</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  DEMO MODE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {teleStatus?.mode === 'LIVE'
                ? `Active bot @${teleStatus.botUsername} monitoring channel ${teleStatus.channelId}`
                : 'No Telegram bot token configured. Operating on synthetic seeded data snapshot.'}
            </p>
          </div>
        </div>

        {/* Dual Oscillating Wave Visualiser on Right */}
        <div className="opacity-70 pointer-events-none hidden sm:block shrink-0">
          <svg width="220" height="40" viewBox="0 0 220 40" fill="none">
            {/* Background Oscillating Secondary Wave */}
            <path
              d="M0 20 C35 32, 70 8, 105 20 C140 32, 175 8, 210 20"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              opacity="0.5"
              fill="none"
              className="animate-wave-dynamic"
              style={{ animationDuration: '4.5s', animationDirection: 'reverse' }}
            />
            {/* Primary Glowing Dynamic Wave */}
            <path
              d="M0 20 C35 8, 70 32, 105 20 C140 8, 175 32, 210 20 C245 8, 280 32, 315 20"
              stroke="url(#waveGradient)"
              strokeWidth="2.5"
              fill="none"
              className="animate-wave-dynamic drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" />
                <stop offset="0.5" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ingested */}
        <div className="stein-card-hover group relative overflow-hidden bg-slate-900/90 border-cyan-500/30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 group-hover:h-[3.5px] group-hover:shadow-[0_0_12px_#06b6d4] transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 transition-all duration-300">
              <Database className="w-4.5 h-4.5 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
            </div>
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-normal">vs last 24h</span>
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">TOTAL INGESTED</p>
            <p className="text-3xl md:text-4xl font-black mt-1 text-white font-mono group-hover:text-cyan-300 transition-colors">{stats.messages}</p>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">Telegram &amp; Manual Feeds</p>
          </div>
        </div>

        {/* Card 2: Tracked Vendors */}
        <div className="stein-card-hover group relative overflow-hidden bg-slate-900/90 border-purple-500/30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500 group-hover:h-[3.5px] group-hover:shadow-[0_0_12px_#a855f7] transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:border-purple-400/40 transition-all duration-300">
              <Users className="w-4.5 h-4.5 transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>- 0%</span>
              <span className="text-slate-400 font-normal">vs last 24h</span>
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">TRACKED VENDORS</p>
            <p className="text-3xl md:text-4xl font-black mt-1 text-white font-mono group-hover:text-purple-300 transition-colors">{stats.vendors}</p>
            <p className="text-[11px] text-purple-400 font-medium mt-1">Correlated Profiles</p>
          </div>
        </div>

        {/* Card 3: Investigative Leads */}
        <div className="stein-card-hover group relative overflow-hidden bg-slate-900/90 border-amber-500/30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 group-hover:h-[3.5px] group-hover:shadow-[0_0_12px_#f59e0b] transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:border-amber-400/40 transition-all duration-300">
              <Target className="w-4.5 h-4.5 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
            </div>
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>↑ 100%</span>
              <span className="text-slate-400 font-normal">vs last 24h</span>
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">INVESTIGATIVE LEADS</p>
            <p className="text-3xl md:text-4xl font-black mt-1 text-amber-400 font-mono group-hover:text-amber-300 transition-colors">{stats.leads}</p>
            <p className="text-[11px] text-amber-400 font-medium mt-1">High Risk Signals</p>
          </div>
        </div>

        {/* Card 4: Active Cases */}
        <div className="stein-card-hover group relative overflow-hidden bg-slate-900/90 border-emerald-500/30">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 group-hover:h-[3.5px] group-hover:shadow-[0_0_12px_#10b981] transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40 transition-all duration-300">
              <Briefcase className="w-4.5 h-4.5 transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>- 0%</span>
              <span className="text-slate-400 font-normal">vs last 24h</span>
            </span>
          </div>

          <div className="mt-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-slate-200 transition-colors">ACTIVE CASES</p>
            <p className="text-3xl md:text-4xl font-black mt-1 text-emerald-400 font-mono group-hover:text-emerald-300 transition-colors">{stats.cases}</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Open Operations</p>
          </div>
        </div>
      </div>

      {/* Recent Messages Triage Snippet */}
      <div className="stein-card space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Recent Ingested Messages Triage</h2>
          </div>
          <Link to="/messages" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
            <span>View All Triage Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400 text-xs py-8 text-center flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Loading message intelligence...</span>
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="text-slate-500 text-xs py-8 text-center">
            No messages found. Click <strong className="text-cyan-400">"Seed Demo Scenario"</strong> above to populate.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {msg.dataSource === 'LIVE' ? (
                      <span className="stein-badge-live">LIVE</span>
                    ) : (
                      <span className="stein-badge-demo">DEMO</span>
                    )}
                    <span className="text-xs font-bold text-cyan-300">
                      {msg.vendorId?.name || (msg.metadata?.authorSignature ? `Author: ${msg.metadata.authorSignature}` : 'Unassigned Author')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.encodingDetected && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-amber-400" />
                        {msg.encodingDetected}
                      </span>
                    )}
                    <p className="text-xs text-slate-200 line-clamp-1 font-medium">
                      {msg.decodedText ?? msg.originalText ?? msg.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {msg.classification?.label === 'SUSPICIOUS' ? (
                    <span className="stein-badge-suspicious">
                      <ShieldAlert className="w-3 h-3" />
                      SUSPICIOUS ({msg.classification?.riskScore ?? 0})
                    </span>
                  ) : msg.classification?.label === 'NEEDS_REVIEW' ? (
                    <span className="stein-badge-review">
                      NEEDS REVIEW ({msg.classification?.riskScore ?? 0})
                    </span>
                  ) : msg.classification?.label === 'BENIGN' ? (
                    <span className="stein-badge-benign">BENIGN</span>
                  ) : (
                    <span className="stein-badge">UNCLASSIFIED</span>
                  )}

                  {msg.extractedAddresses?.length > 0 && (
                    <span className="stein-badge bg-amber-500/10 text-amber-400 border-amber-500/30">
                      {msg.extractedAddresses.length} Address(es)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
