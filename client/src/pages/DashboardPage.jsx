import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

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
    <div className="p-6 space-y-6">
      {/* Header with Seed Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Investigation Dashboard</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Synthetic Telegram Drug-Market Intelligence &amp; Correlation System
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="stein-btn-primary flex items-center gap-2"
        >
          {seeding ? 'Seeding Synthetic Scenario...' : '⚡ Seed Demo Scenario'}
        </button>
      </div>

      {seedResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg text-emerald-400 text-sm flex justify-between items-center">
          <span>✓ Demo scenario successfully seeded (Vendors, Messages, Wallets, Leads, Case, Report &amp; Audit Log created).</span>
          <button onClick={() => setSeedResult(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Telegram Status Banner */}
      <div className="stein-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${teleStatus?.polling ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              Telegram Integration Mode:
              {teleStatus?.mode === 'LIVE' ? (
                <span className="stein-badge-live">LIVE TELEGRAM</span>
              ) : (
                <span className="stein-badge-demo">DEMO / SNAPSHOT</span>
              )}
            </div>
            <p className="text-xs text-stein-text-dim mt-0.5">
              {teleStatus?.mode === 'LIVE'
                ? `Active bot @${teleStatus.botUsername} monitoring channel ${teleStatus.channelId}`
                : 'No Telegram bot token configured. Operating on synthetic seeded data.'}
            </p>
          </div>
        </div>
        <div className="text-xs text-stein-text-dim text-right">
          {teleStatus?.lastUpdateTime && <div>Last Activity: {new Date(teleStatus.lastUpdateTime).toLocaleTimeString()}</div>}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stein-card">
          <p className="text-stein-text-dim text-xs uppercase tracking-wide">Total Messages</p>
          <p className="text-3xl font-bold mt-1 text-stein-cyan">{stats.messages}</p>
        </div>
        <div className="stein-card">
          <p className="text-stein-text-dim text-xs uppercase tracking-wide">Tracked Vendors</p>
          <p className="text-3xl font-bold mt-1 text-stein-accent-bright">{stats.vendors}</p>
        </div>
        <div className="stein-card">
          <p className="text-stein-text-dim text-xs uppercase tracking-wide">Investigative Leads</p>
          <p className="text-3xl font-bold mt-1 text-stein-warning">{stats.leads}</p>
        </div>
        <div className="stein-card">
          <p className="text-stein-text-dim text-xs uppercase tracking-wide">Active Cases</p>
          <p className="text-3xl font-bold mt-1 text-stein-success">{stats.cases}</p>
        </div>
      </div>

      {/* Recent Messages Triage Snippet */}
      <div className="stein-card space-y-4">
        <div className="flex justify-between items-center border-b border-stein-border pb-3">
          <h2 className="text-lg font-semibold text-stein-text">Recent Ingested Messages</h2>
          <Link to="/messages" className="text-xs text-stein-accent hover:underline">View All Messages →</Link>
        </div>

        {loading ? (
          <div className="text-stein-text-dim text-sm py-4">Loading messages...</div>
        ) : recentMessages.length === 0 ? (
          <div className="text-stein-text-dim text-sm py-4">No messages found. Click "Seed Demo Scenario" above.</div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg._id} className="p-3 bg-stein-surface-alt rounded border border-stein-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {msg.dataSource === 'LIVE' ? (
                      <span className="stein-badge-live">LIVE</span>
                    ) : (
                      <span className="stein-badge-demo">DEMO</span>
                    )}
                    <span className="text-xs font-semibold text-stein-accent-bright">
                      {msg.vendorId?.name || (msg.metadata?.authorSignature ? `Author: ${msg.metadata.authorSignature}` : 'Unassigned Author')}
                    </span>
                    <span className="text-[10px] text-stein-text-dim">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.encodingDetected && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {msg.encodingDetected}
                      </span>
                    )}
                    <p className="text-sm text-stein-text line-clamp-1">{msg.decodedText ?? msg.originalText ?? msg.text}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {msg.classification?.label === 'SUSPICIOUS' ? (
                    <span className="stein-badge-suspicious">SUSPICIOUS (Risk: {msg.classification?.riskScore ?? 0})</span>
                  ) : msg.classification?.label === 'NEEDS_REVIEW' ? (
                    <span className="stein-badge-review">NEEDS REVIEW (Risk: {msg.classification?.riskScore ?? 0})</span>
                  ) : msg.classification?.label === 'BENIGN' ? (
                    <span className="stein-badge-benign">BENIGN</span>
                  ) : (
                    <span className="stein-badge">UNCLASSIFIED</span>
                  )}
                  {msg.extractedAddresses?.length > 0 && (
                    <span className="stein-badge bg-amber-500/20 text-amber-400">
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
