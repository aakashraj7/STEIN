import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Feather,
  Zap,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Cpu,
  ArrowRightLeft,
} from 'lucide-react';

export default function StylometryPage() {
  const [vendors, setVendors] = useState([]);
  const [vendorA, setVendorA] = useState('');
  const [vendorB, setVendorB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getVendors().then((res) => {
      const v = res.data || [];
      setVendors(v);
      if (v.length >= 2) {
        setVendorA(v[0]._id);
        setVendorB(v[1]._id);
      }
    });
  }, []);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!vendorA || !vendorB) return;
    if (vendorA === vendorB) {
      setError('Please select two different vendors to compare.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.compareStylometry(vendorA, vendorB);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Feather className="w-6 h-6 text-cyan-400" />
          <span>Stylometry Feature-Analysis Engine</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Statistical writing-style similarity comparison across vendor message corpora (Pure Node.js)
        </p>
      </div>

      {/* Comparison Selector Card */}
      <div className="stein-card border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Select Vendor Corpora to Compare
          </h2>
        </div>

        <form onSubmit={handleCompare} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Vendor Target A (Corpus Alpha)
            </label>
            <select
              value={vendorA}
              onChange={(e) => setVendorA(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center p-2 text-cyan-400 shrink-0">
            <ArrowRightLeft className="w-5 h-5 hidden md:block" />
          </div>

          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Vendor Target B (Corpus Shadow)
            </label>
            <select
              value={vendorB}
              onChange={(e) => setVendorB(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="stein-btn-cyan text-xs py-2.5 px-6 shrink-0 w-full md:w-auto"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cpu className="w-4 h-4 text-cyan-300" />
            )}
            <span>{loading ? 'Calculating Vectors...' : 'Compute Cosine Similarity'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {result.status === 'INSUFFICIENT_TEXT' ? (
            <div className="stein-card bg-amber-500/10 border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>INSUFFICIENT_TEXT</span>
              </div>
              <p className="text-xs text-slate-300">{result.message}</p>
            </div>
          ) : (
            <>
              {/* Overall Similarity Score Box */}
              <div className="stein-card border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Stylometric Match Classification
                  </span>
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {result.level}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {result.note}
                  </p>
                </div>

                <div className="text-center p-5 bg-slate-950/80 rounded-xl border border-cyan-500/30 shadow-cyber-cyan min-w-[180px] shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cosine Similarity</div>
                  <div className="text-4xl font-black text-cyan-400 font-mono mt-1">
                    {(result.overallSimilarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 font-mono">Vector Dot Product</div>
                </div>
              </div>

              {/* Group Similarities Breakdown */}
              <div className="stein-card border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Feature-Group Vector Similarities
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.groupSimilarities || {}).map(([group, val]) => (
                    <div key={group} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="capitalize text-slate-300">{group} Similarity</span>
                        <span className="text-cyan-400 font-mono">{Math.round(val * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#06b6d4]"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Readable Explanations */}
              <div className="stein-card border-slate-800 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Investigative Evidence Findings
                  </h3>
                </div>

                <ul className="space-y-2">
                  {(result.explanations || []).map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_6px_#10b981]" />
                      <span className="leading-relaxed">{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
