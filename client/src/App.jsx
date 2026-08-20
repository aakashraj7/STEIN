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
  ShieldAlert,
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
import AnalysisPage from './pages/AnalysisPage';

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
      { to: '/analysis', label: 'Analysis & Timeline', icon: Activity },
      { to: '/graph', label: 'Link Graph', icon: Network },
      { to: '/stylometry', label: 'Stylometry Engine', icon: Feather },
      { to: '/wallets', label: 'Crypto Wallets', icon: WalletCards },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden">
          <img
            src="/Chandigarh_Police_Logo.png"
            alt="Chandigarh Police Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              STEIN
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 border border-blue-200 text-blue-700">
              POLICE
            </span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Cyber Threat Intel
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
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
                    `group flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 font-semibold'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
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
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-600" />
          <span>Engine Active</span>
        </div>
        <span className="font-mono text-slate-500">STEIN Platform</span>
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
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 tracking-wider">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>AI-ASSISTED DRUG-MARKET INVESTIGATION SYSTEM</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {health?.status?.telegram === 'LIVE' ? (
          <span className="stein-badge-live">
            <Radio className="w-3 h-3 text-emerald-600" />
            LIVE TELEGRAM
          </span>
        ) : (
          <span className="stein-badge-demo">
            DEMO MODE
          </span>
        )}

        <div className="h-3.5 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs text-slate-700 font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${health?.ready ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{health?.ready ? 'Operational' : 'Initializing...'}</span>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <TopBar />
        <main className="ml-64 mt-14 min-h-[calc(100vh-3.5rem)] p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/:id" element={<VendorProfilePage />} />
            <Route path="/stylometry" element={<StylometryPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
