import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stein-text">Stylometry Feature-Analysis Engine</h1>
        <p className="text-stein-text-dim text-sm mt-1">
          Statistical writing-style similarity comparison across vendor message corpora (Pure Node.js)
        </p>
      </div>

      {/* Comparison Selector */}
      <div className="stein-card">
        <form onSubmit={handleCompare} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-stein-text-dim uppercase">Vendor Alpha (Corpus A)</label>
            <select
              value={vendorA}
              onChange={(e) => setVendorA(e.target.value)}
              className="w-full bg-stein-surface-alt border border-stein-border text-stein-text text-sm rounded-lg p-2.5"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-stein-text-dim uppercase">Vendor Shadow (Corpus B)</label>
            <select
              value={vendorB}
              onChange={(e) => setVendorB(e.target.value)}
              className="w-full bg-stein-surface-alt border border-stein-border text-stein-text text-sm rounded-lg p-2.5"
            >
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.messageCount || 0} msgs)</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="stein-btn-primary py-2.5 px-6 whitespace-nowrap"
          >
            {loading ? 'Analyzing Vector Space...' : '⚡ Compute Cosine Similarity'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {result.status === 'INSUFFICIENT_TEXT' ? (
            <div className="stein-card bg-amber-500/10 border-amber-500/30">
              <h2 className="text-lg font-semibold text-amber-400">INSUFFICIENT_TEXT</h2>
              <p className="text-sm text-stein-text-dim mt-1">{result.message}</p>
            </div>
          ) : (
            <>
              {/* Overall Similarity Gauge */}
              <div className="stein-card flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase text-stein-text-dim tracking-wider font-semibold">Similarity Level Indicator</span>
                  <h2 className="text-2xl font-bold text-stein-accent-bright mt-1">{result.level}</h2>
                  <p className="text-xs text-stein-text-dim mt-2 max-w-xl">
                    {result.note}
                  </p>
                </div>

                <div className="text-center p-4 bg-stein-surface-alt rounded-lg border border-stein-border min-w-[160px]">
                  <div className="text-xs text-stein-text-dim uppercase font-semibold">Cosine Score</div>
                  <div className="text-4xl font-extrabold text-stein-cyan mt-1">
                    {(result.overallSimilarity * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-stein-text-dim mt-1">Vector Dot Product</div>
                </div>
              </div>

              {/* Group Similarities Breakdown */}
              <div className="stein-card space-y-4">
                <h3 className="text-base font-semibold text-stein-text border-b border-stein-border pb-2">
                  Feature-Group Similarities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.groupSimilarities || {}).map(([group, val]) => (
                    <div key={group} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-stein-text-dim">{group}</span>
                        <span className="text-stein-accent-bright">{Math.round(val * 100)}%</span>
                      </div>
                      <div className="w-full bg-stein-surface-alt h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-stein-accent h-full transition-all duration-300"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Readable Explanations */}
              <div className="stein-card space-y-3">
                <h3 className="text-base font-semibold text-stein-text border-b border-stein-border pb-2">
                  Investigative Evidence Explanation
                </h3>
                <ul className="space-y-2">
                  {(result.explanations || []).map((exp, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-stein-text">
                      <span className="text-stein-success">✓</span>
                      {exp}
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
