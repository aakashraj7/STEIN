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
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalysisPage() {
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [granularity, setGranularity] = useState('DAY'); // 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'

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

  // Metrics summary
  const suspiciousMsgs = messages.filter((m) => m.classification?.label === 'SUSPICIOUS');
  const reviewMsgs = messages.filter((m) => m.classification?.label === 'NEEDS_REVIEW');
  const totalVolume = messages.length;

  // Dynamic Multi-Timeframe Grouping (Day / Week / Month / Year)
  const timelineData = (function () {
    const map = {};

    messages.forEach((m) => {
      const dateObj = new Date(m.timestamp);
      let key = '';

      if (granularity === 'DAY') {
        key = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (granularity === 'WEEK') {
        const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
        const pastDays = (dateObj - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
        key = `W${weekNum} (${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
      } else if (granularity === 'MONTH') {
        key = dateObj.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      } else if (granularity === 'YEAR') {
        key = String(dateObj.getFullYear());
      }

      if (!map[key]) {
        map[key] = { label: key, dateObj, suspicious: 0, review: 0, benign: 0, total: 0 };
      }

      map[key].total += 1;
      if (m.classification?.label === 'SUSPICIOUS') map[key].suspicious += 1;
      else if (m.classification?.label === 'NEEDS_REVIEW') map[key].review += 1;
      else map[key].benign += 1;
    });

    return Object.values(map).sort((a, b) => a.dateObj - b.dateObj);
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
            Dynamic time-series activity correlation &amp; multi-timeframe threat velocity analytics
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
            <span>TIME BUCKETS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{timelineData.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Grouped By {granularity}</p>
        </div>

        <div className="stein-card border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL VOLUME</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-2">{totalVolume}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Ingested Messages Corpus</p>
        </div>
      </div>

      {/* Flexible Dynamic Time-Series Activity Graph Card */}
      <div className="stein-card border-slate-200 space-y-4 shadow-sm">
        {/* Controls Bar: Timeframe Buttons & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <span>Flexible Activity Velocity Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Toggle timeframe granularity (Day, Week, Month, Year) to inspect dynamic threat velocity
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Timeframe Selector Buttons */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold">
              {[
                { id: 'DAY', label: 'Daily' },
                { id: 'WEEK', label: 'Weekly' },
                { id: 'MONTH', label: 'Monthly' },
                { id: 'YEAR', label: 'Yearly' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setGranularity(tf.id)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    granularity === tf.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5">
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
        </div>

        {loadingMsgs ? (
          <div className="py-20 text-center text-slate-500 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Calculating dynamic {granularity.toLowerCase()} activity analytics...</span>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">
            No temporal data recorded. Click "Seed Intelligence Dataset" above to populate dataset.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Pretty Visual Canvas with Y-Axis & Stacked Gradient Bars */}
            <div className="bg-gradient-to-b from-white to-slate-50/50 border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4 h-72">
                {/* Y-Axis Column */}
                <div className="flex flex-col justify-between h-56 text-[10px] font-mono text-slate-500 py-1 text-right w-8 shrink-0 font-bold">
                  <span>{maxTimelineVal}</span>
                  <span>{Math.round(maxTimelineVal * 0.75)}</span>
                  <span>{Math.round(maxTimelineVal * 0.5)}</span>
                  <span>{Math.round(maxTimelineVal * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Grid Lines & Dynamic Columns */}
                <div className="flex-1 h-full flex flex-col justify-between relative">
                  {/* Dashed Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-slate-300 w-full" />
                  </div>

                  {/* Dynamic Columns */}
                  <div className="flex-1 flex items-end justify-between gap-3 px-3 z-10 pb-6">
                    {timelineData.map((item, idx) => {
                      const suspH = Math.max(0, Math.round((item.suspicious / maxTimelineVal) * 100));
                      const revH = Math.max(0, Math.round((item.review / maxTimelineVal) * 100));
                      const stdH = Math.max(0, Math.round((item.benign / maxTimelineVal) * 100));

                      if (timeFilter === 'SUSPICIOUS' && item.suspicious === 0) return null;
                      if (timeFilter === 'REVIEW' && item.review === 0) return null;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Rich Interactive Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[11px] font-sans p-3.5 rounded-xl shadow-2xl pointer-events-none absolute -top-20 z-30 whitespace-nowrap space-y-1.5 border border-slate-700 transform group-hover:-translate-y-1">
                            <div className="font-bold border-b border-slate-700 pb-1.5 text-blue-400 flex items-center justify-between gap-3">
                              <span>{item.label} Intelligence</span>
                              <span className="font-mono text-slate-300 text-[10px]">({granularity})</span>
                            </div>
                            <div className="flex items-center justify-between gap-5 text-xs">
                              <span className="text-red-400 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Suspicious:
                              </span>
                              <span className="font-mono font-bold text-red-300">{item.suspicious} msgs</span>
                            </div>
                            <div className="flex items-center justify-between gap-5 text-xs">
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Needs Review:
                              </span>
                              <span className="font-mono font-bold text-amber-300">{item.review} msgs</span>
                            </div>
                            <div className="flex items-center justify-between gap-5 text-xs">
                              <span className="text-blue-400 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Standard:
                              </span>
                              <span className="font-mono font-bold text-blue-300">{item.benign} msgs</span>
                            </div>
                            <div className="pt-1 border-t border-slate-700/80 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Total Aggregated:</span>
                              <span className="font-bold text-white font-mono">{item.total}</span>
                            </div>
                          </div>

                          {/* Stacked / Grouped Bars with Smooth Animations */}
                          <div className="flex items-end gap-1.5 h-full w-full justify-center">
                            {(timeFilter === 'ALL' || timeFilter === 'SUSPICIOUS') && (
                              <div
                                className="w-3.5 sm:w-5 bg-gradient-to-t from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-t-md transition-all duration-300 animate-grow-bar shadow-sm"
                                style={{ height: `${suspH}%`, animationDelay: `${idx * 80}ms` }}
                              />
                            )}
                            {(timeFilter === 'ALL' || timeFilter === 'REVIEW') && (
                              <div
                                className="w-3.5 sm:w-5 bg-gradient-to-t from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-t-md transition-all duration-300 animate-grow-bar shadow-sm"
                                style={{ height: `${revH}%`, animationDelay: `${idx * 80 + 30}ms` }}
                              />
                            )}
                            {timeFilter === 'ALL' && (
                              <div
                                className="w-3.5 sm:w-5 bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-t-md transition-all duration-300 animate-grow-bar shadow-sm"
                                style={{ height: `${stdH}%`, animationDelay: `${idx * 80 + 60}ms` }}
                              />
                            )}
                          </div>

                          {/* X-Axis Date / Granularity Label */}
                          <span className="absolute -bottom-6 text-[10px] font-mono font-bold text-slate-700 truncate max-w-[80px] text-center">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart Legend Strip */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-700 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-r from-red-600 to-red-500 inline-block shadow-sm" />
                  <span>Suspicious High-Risk Offers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-r from-amber-600 to-amber-500 inline-block shadow-sm" />
                  <span>Needs Review Contextual Phrases</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 inline-block shadow-sm" />
                  <span>Standard Ingested Feeds</span>
                </div>
              </div>
            </div>

            {/* Detailed Multi-Timeframe Data Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{granularity} Time Interval</span>
                </span>
                <span>Suspicious Count</span>
                <span>Needs Review</span>
                <span>Standard Activity</span>
                <span>Threat Velocity State</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-medium">
                {[...timelineData].reverse().map((item, idx) => (
                  <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <span className="font-mono font-bold text-slate-900">{item.label}</span>
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
