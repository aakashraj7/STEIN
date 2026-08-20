import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Activity,
  RefreshCw,
  Clock,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Filter,
  Sparkles,
  BarChart2,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function AnalysisPage() {
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [timeFilter, setTimeFilter] = useState('ALL');

  const fetchMessages = async () => {
    setLoadingMsgs(true);
    try {
      const res = await api.getMessages();
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seed();
      await fetchMessages();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Compute Timeline Metrics
  const suspiciousMsgs = messages.filter((m) => m.classification?.label === 'SUSPICIOUS');
  const reviewMsgs = messages.filter((m) => m.classification?.label === 'NEEDS_REVIEW');
  const totalVolume = messages.length;
  const peakRiskScore = Math.max(0, ...messages.map((m) => m.classification?.riskScore || 0));

  // Time Series Grouping (hourly / daily distribution)
  const timelineData = (function () {
    const map = {};
    messages.forEach((m) => {
      const dateStr = new Date(m.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!map[dateStr]) map[dateStr] = { date: dateStr, suspicious: 0, review: 0, benign: 0, total: 0 };
      map[dateStr].total += 1;
      if (m.classification?.label === 'SUSPICIOUS') map[dateStr].suspicious += 1;
      else if (m.classification?.label === 'NEEDS_REVIEW') map[dateStr].review += 1;
      else map[dateStr].benign += 1;
    });
    return Object.values(map);
  })();

  const maxTimelineVal = Math.max(1, ...timelineData.map((d) => d.total));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
            <span>Temporal Intelligence &amp; Threat Velocity Analysis</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Multi-dimensional time-series activity correlation &amp; suspicious risk score velocity metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSeed} disabled={seeding} className="stein-btn-primary text-xs shadow-sm">
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Initializing...' : 'Seed Intelligence Dataset'}</span>
          </button>
          <button onClick={fetchMessages} className="stein-btn-secondary text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMsgs ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stein-card border-slate-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>SUSPICIOUS EVENTS</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 font-mono mt-2">{suspiciousMsgs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">High-Risk Drug Trade Signals</p>
        </div>

        <div className="stein-card border-slate-200 hover:border-amber-300 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>NEEDS REVIEW</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono mt-2">{reviewMsgs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Flagged Contextual Phrases</p>
        </div>

        <div className="stein-card border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PEAK RISK SCORE</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 font-mono mt-2">{peakRiskScore} / 100</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Maximum Threat Intensity</p>
        </div>

        <div className="stein-card border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL TRIAGED VOLUME</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{totalVolume}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Ingested Channel Corpus</p>
        </div>
      </div>

      {/* Time to Suspicious Activities Timeline Graph */}
      <div className="stein-card border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-blue-600" />
              <span>Time-Series Suspicious Activity Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Temporal distribution of ingested drug-market offers &amp; suspicious risk score velocity over time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="SUSPICIOUS">Suspicious Only</option>
              <option value="REVIEW">Needs Review</option>
            </select>
          </div>
        </div>

        {loadingMsgs ? (
          <div className="py-16 text-center text-slate-500 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Calculating time-series suspicious activity metrics...</span>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            No temporal data available. Click "Seed Intelligence Dataset" above to populate dataset.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Chart Wrapper Container with Y-Axis */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4 h-72">
                {/* Y-Axis Label Column */}
                <div className="flex flex-col justify-between h-56 text-[10px] font-mono text-slate-400 py-1 text-right w-8 shrink-0">
                  <span>{maxTimelineVal}</span>
                  <span>{Math.round(maxTimelineVal * 0.75)}</span>
                  <span>{Math.round(maxTimelineVal * 0.5)}</span>
                  <span>{Math.round(maxTimelineVal * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Main Canvas with Dashed Gridlines & Bars */}
                <div className="flex-1 h-full flex flex-col justify-between relative">
                  {/* Dashed Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-slate-300 w-full" />
                  </div>

                  {/* Bars Container (Chronologically sorted: oldest to newest) */}
                  <div className="flex-1 flex items-end justify-between gap-2 px-2 z-10 pb-6">
                    {[...timelineData].reverse().map((item, idx) => {
                      const suspH = Math.max(0, Math.round((item.suspicious / maxTimelineVal) * 100));
                      const revH = Math.max(0, Math.round((item.review / maxTimelineVal) * 100));
                      const stdH = Math.max(0, Math.round((item.benign / maxTimelineVal) * 100));

                      if (timeFilter === 'SUSPICIOUS' && item.suspicious === 0) return null;
                      if (timeFilter === 'REVIEW' && item.review === 0) return null;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Rich Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-sans p-3 rounded-lg shadow-xl pointer-events-none absolute -top-16 z-30 whitespace-nowrap space-y-1">
                            <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                              {item.date} Intelligence Summary
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-red-400 font-medium">Suspicious:</span>
                              <span className="font-mono font-bold">{item.suspicious}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-amber-400 font-medium">Needs Review:</span>
                              <span className="font-mono font-bold">{item.review}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-blue-400 font-medium">Standard:</span>
                              <span className="font-mono font-bold">{item.benign}</span>
                            </div>
                          </div>

                          {/* Grouped Bars */}
                          <div className="flex items-end gap-1 h-full w-full justify-center">
                            {(timeFilter === 'ALL' || timeFilter === 'SUSPICIOUS') && (
                              <div
                                className="w-3.5 sm:w-4 bg-red-500 hover:bg-red-600 rounded-t-sm transition-all duration-300 animate-grow-bar"
                                style={{ height: `${suspH}%`, animationDelay: `${idx * 90}ms` }}
                              />
                            )}
                            {(timeFilter === 'ALL' || timeFilter === 'REVIEW') && (
                              <div
                                className="w-3.5 sm:w-4 bg-amber-500 hover:bg-amber-600 rounded-t-sm transition-all duration-300 animate-grow-bar"
                                style={{ height: `${revH}%`, animationDelay: `${idx * 90 + 30}ms` }}
                              />
                            )}
                            {timeFilter === 'ALL' && (
                              <div
                                className="w-3.5 sm:w-4 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300 animate-grow-bar"
                                style={{ height: `${stdH}%`, animationDelay: `${idx * 90 + 60}ms` }}
                              />
                            )}
                          </div>

                          {/* X-Axis Date Label */}
                          <span className="absolute -bottom-6 text-[10px] font-mono font-semibold text-slate-500 truncate">
                            {item.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-8 text-xs font-semibold text-slate-600 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                  <span>Suspicious High-Risk Signals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span>Needs Review Signals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                  <span>Standard Ingested Activity</span>
                </div>
              </div>
            </div>

            {/* Detailed Temporal Data Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span>Temporal Date</span>
                <span>Suspicious Count</span>
                <span>Needs Review</span>
                <span>Standard Activity</span>
                <span>Threat Velocity State</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-medium">
                {[...timelineData].reverse().map((item, idx) => (
                  <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="font-mono font-bold text-slate-900">{item.date}</span>
                    <span className="font-mono text-red-600 font-bold">{item.suspicious} msgs</span>
                    <span className="font-mono text-amber-600 font-bold">{item.review} msgs</span>
                    <span className="font-mono text-blue-600 font-bold">{item.benign} msgs</span>
                    <div>
                      {item.suspicious > 0 ? (
                        <span className="stein-badge-suspicious">▲ HIGH VELOCITY</span>
                      ) : item.review > 0 ? (
                        <span className="stein-badge-review">● MODERATE VELOCITY</span>
                      ) : (
                        <span className="stein-badge-benign">● NORMAL VELOCITY</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
