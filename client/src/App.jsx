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
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              STEIN
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 border border-slate-700 text-slate-400">
              v1.0
            </span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Cyber Threat Intel
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                    `group flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
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
    <header className="h-14 bg-[#111827] border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>AI-ASSISTED DRUG-MARKET INVESTIGATION SYSTEM</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {health?.status?.telegram === 'LIVE' ? (
          <span className="stein-badge-live">
            <Radio className="w-3 h-3 text-emerald-400" />
            LIVE TELEGRAM
          </span>
        ) : (
          <span className="stein-badge-demo">
            DEMO MODE
          </span>
        )}

        <div className="h-3.5 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md text-xs text-slate-300 font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${health?.ready ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{health?.ready ? 'Operational' : 'Initializing...'}</span>
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
