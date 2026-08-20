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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Feather className="w-6 h-6 text-blue-600" />
          <span>Stylometry Feature-Analysis Engine</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Statistical writing-style similarity comparison across vendor message corpora (Pure Node.js)
        </p>
      </div>

      {/* Comparison Selector Card */}
      <div className="stein-card border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Select Vendor Corpora to Compare
          </h2>
        </div>

        <form onSubmit={handleCompare} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Vendor Target A (Corpus Alpha)
            </label>
            <select
              value={vendorA}
              onChange={(e) => setVendorA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center p-2 text-blue-600 shrink-0">
            <ArrowRightLeft className="w-5 h-5 hidden md:block" />
          </div>

          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Vendor Target B (Corpus Shadow)
            </label>
            <select
              value={vendorB}
              onChange={(e) => setVendorB(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="stein-btn-primary text-xs py-2.5 px-6 shrink-0 w-full md:w-auto"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
            <span>{loading ? 'Calculating Vectors...' : 'Compute Cosine Similarity'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {result.status === 'INSUFFICIENT_TEXT' ? (
            <div className="stein-card bg-amber-50 border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>INSUFFICIENT_TEXT</span>
              </div>
              <p className="text-xs text-amber-900 font-medium">{result.message}</p>
            </div>
          ) : (
            <>
              {/* Overall Similarity Score Box */}
              <div className="stein-card border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Stylometric Match Classification
                  </span>
                  <h2 className="text-2xl font-black text-blue-600">
                    {result.level}
                  </h2>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
                    {result.note}
                  </p>
                </div>

                <div className="text-center p-5 bg-blue-50 rounded-xl border border-blue-200 min-w-[180px] shrink-0">
                  <div className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">Cosine Similarity</div>
                  <div className="text-4xl font-black text-blue-600 font-mono mt-1">
                    {(result.overallSimilarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-blue-500 mt-1 font-mono">Vector Dot Product</div>
                </div>
              </div>

              {/* Group Similarities Breakdown */}
              <div className="stein-card border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Feature-Group Vector Similarities
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.groupSimilarities || {}).map(([group, val]) => (
                    <div key={group} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="capitalize text-slate-700">{group} Similarity</span>
                        <span className="text-blue-600 font-mono">{Math.round(val * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Readable Explanations */}
              <div className="stein-card border-slate-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Investigative Evidence Findings
                  </h3>
                </div>

                <ul className="space-y-2">
                  {(result.explanations || []).map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
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
