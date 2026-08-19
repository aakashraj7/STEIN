import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  Feather,
  WalletCards,
  Network,
  FolderKanban,
  FileSpreadsheet,
  ShieldCheck,
  Activity,
  Radio,
  Terminal,
  Lock,
  ExternalLink,
} from 'lucide-react';

import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import VendorsPage from './pages/VendorsPage';
import VendorProfilePage from './pages/VendorProfilePage';
import StylometryPage from './pages/StylometryPage';
import WalletsPage from './pages/WalletsPage';
import GraphPage from './pages/GraphPage';
import CasesPage from './pages/CasesPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogPage from './pages/AuditLogPage';

const NAV_GROUPS = [
  {
    title: 'CORE INTELLIGENCE',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/messages', label: 'Messages Triage', icon: MessageSquareText },
      { to: '/vendors', label: 'Vendor Directory', icon: Users },
    ],
  },
  {
    title: 'CORRELATION & ANALYTICS',
    items: [
      { to: '/stylometry', label: 'Stylometry Engine', icon: Feather },
      { to: '/wallets', label: 'Crypto Wallets', icon: WalletCards },
      { to: '/graph', label: 'Link Graph', icon: Network },
    ],
  },
  {
    title: 'CASE MANAGEMENT',
    items: [
      { to: '/cases', label: 'Cases & Leads', icon: FolderKanban },
      { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
      { to: '/audit', label: 'Audit Trail', icon: ShieldCheck },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-rotate-hexagon">
            <polygon
              points="50,4 93,26 93,74 50,96 7,74 7,26"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-cyan-400"
            />
          </svg>
          <Lock className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_#06b6d4]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-wider text-white font-sans">
              STEIN
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-900 border border-slate-700/80 text-slate-300">
              v1.0
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 font-mono">
            CYBER THREAT INTEL
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#06b6d4]" />
                      )}
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
          <span>Engine Active</span>
        </div>
        <span className="font-mono text-slate-400">STEIN Platform</span>
      </div>
    </aside>
  );
}

function TopBar() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-20 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-wide">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>AI-ASSISTED DRUG-MARKET INVESTIGATION SYSTEM</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {health?.status?.telegram === 'LIVE' ? (
          <span className="stein-badge-live">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            LIVE TELEGRAM INTEGRATION
          </span>
        ) : (
          <span className="stein-badge-demo">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            DEMO MODE
          </span>
        )}

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
          <span className={`w-2 h-2 rounded-full ${health?.ready ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'}`} />
          <span>{health?.ready ? 'Systems Operational' : 'Initializing...'}</span>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Sidebar />
        <TopBar />
        <main className="ml-64 mt-14 min-h-[calc(100vh-3.5rem)] p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/:id" element={<VendorProfilePage />} />
            <Route path="/stylometry" element={<StylometryPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
