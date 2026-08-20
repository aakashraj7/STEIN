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
  Search,
} from 'lucide-react';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTarget, setSearchTarget] = useState('');

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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-600" />
            <span>Investigation Link Graph</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Neo4j multi-entity network intelligence visualization &amp; Target Node Search
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search target node */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search node target..."
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <button onClick={handleSeed} disabled={seeding || loading} className="stein-btn-primary text-xs">
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Initializing...' : 'Initialize Graph Data'}</span>
          </button>
          <button onClick={fetchGraph} className="stein-btn-secondary text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="w-full h-[580px] bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading Neo4j multi-entity network dataset...</span>
            </div>
          ) : (
            <CytoscapeGraph
              data={graphData}
              onNodeClick={setSelectedNode}
              onSeed={handleSeed}
              searchQuery={searchTarget}
            />
          )}
        </div>

        {/* Node Inspector */}
        <div className="stein-card bg-slate-50 border-slate-200 space-y-4 h-[580px] overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Node Intelligence Inspector
            </h2>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Entity Label
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedNode.properties?.name ||
                    selectedNode.properties?.title ||
                    selectedNode.properties?.caseNumber ||
                    selectedNode.properties?.address ||
                    selectedNode.labels?.[0]}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Type
                </span>
                <span className="stein-badge-cyan mt-1">
                  {selectedNode.labels?.[0] || 'Node Entity'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Properties
                </span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700 max-h-60 overflow-y-auto">
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-semibold">{key}:</span>
                      <span className="text-slate-900 truncate font-semibold">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs py-16 text-center space-y-2">
              <Network className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-500">Click any node to inspect properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
