import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import CytoscapeGraph from '../components/graph/CytoscapeGraph';
import {
  Network,
  RefreshCw,
  Eye,
  Info,
  Layers,
  Database,
  Tag,
  Sparkles,
} from 'lucide-react';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.getGraph();
      setGraphData(res.data || { nodes: [], edges: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seed();
      await fetchGraph();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <span>Investigation Link Graph</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Neo4j multi-entity network intelligence visualization (Cytoscape.js)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSeed} disabled={seeding || loading} className="stein-btn-cyan text-xs">
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 fill-cyan-300 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Initializing DB...' : 'Initialize Graph Data'}</span>
          </button>
          <button onClick={fetchGraph} disabled={loading} className="stein-btn-secondary text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching Graph...' : 'Refresh Graph'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="w-full h-[580px] bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Loading graph dataset from Neo4j DB...</span>
            </div>
          ) : (
            <CytoscapeGraph data={graphData} onNodeClick={setSelectedNode} onSeed={handleSeed} />
          )}
        </div>

        {/* Node Inspector Sidebar Panel */}
        <div className="stein-card border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Entity Attributes Inspector
            </h2>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Entity Type</span>
                <p className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedNode.labels?.[0] || 'Node'}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Inspected Properties</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                    <div key={k} className="break-all border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-cyan-400 font-bold block text-[10px] uppercase">{k}:</span>
                      <span className="text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-12 text-center space-y-2">
              <Eye className="w-6 h-6 text-slate-600 mx-auto" />
              <p>Click any node in the interactive canvas to inspect attributes and relationship properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
