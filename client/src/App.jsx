import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

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

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/messages', label: 'Messages', icon: '✉' },
  { to: '/vendors', label: 'Vendors', icon: '👤' },
  { to: '/stylometry', label: 'Stylometry', icon: '✍' },
  { to: '/wallets', label: 'Wallets', icon: '⬡' },
  { to: '/graph', label: 'Graph', icon: '◎' },
  { to: '/cases', label: 'Cases & Leads', icon: '📁' },
  { to: '/reports', label: 'Reports', icon: '📄' },
  { to: '/audit', label: 'Audit Log', icon: '🔗' },
];

function Sidebar() {
  return (
    <aside className="w-56 bg-stein-surface border-r border-stein-border flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="px-4 py-5 border-b border-stein-border">
        <h1 className="text-xl font-bold tracking-wider text-stein-accent-bright">
          STEIN
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-stein-text-dim mt-0.5">
          Investigation Platform
        </p>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-stein-accent/10 text-stein-accent-bright border-r-2 border-stein-accent'
                  : 'text-stein-text-dim hover:text-stein-text hover:bg-white/5'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-stein-border text-[10px] text-stein-text-dim">
        STEIN Hackathon MVP v1.0
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
    <header className="h-12 bg-stein-surface border-b border-stein-border flex items-center justify-between px-6 fixed top-0 left-56 right-0 z-20">
      <span className="text-xs text-stein-text-dim font-medium uppercase tracking-wider">
        AI-Assisted Investigation &amp; Intelligence Support System
      </span>
      <div className="flex items-center gap-3">
        {health?.status?.telegram === 'LIVE' ? (
          <span className="stein-badge-live">⚡ LIVE TELEGRAM</span>
        ) : (
          <span className="stein-badge-demo">◉ DEMO MODE</span>
        )}
        <div className="flex items-center gap-1.5 text-xs text-stein-text-dim">
          <span className={`w-2 h-2 rounded-full ${health?.ready ? 'bg-stein-success' : 'bg-amber-500'}`} />
          {health?.ready ? 'Systems Connected' : 'Running'}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stein-bg text-stein-text">
        <Sidebar />
        <TopBar />
        <main className="ml-56 mt-12 min-h-[calc(100vh-3rem)]">
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
