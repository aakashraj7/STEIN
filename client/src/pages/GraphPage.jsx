import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import CytoscapeGraph from '../components/graph/CytoscapeGraph';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stein-text">Investigation Graph</h1>
          <p className="text-stein-text-dim text-sm mt-1">
            Neo4j multi-entity network intelligence visualization (Cytoscape.js)
          </p>
        </div>
        <button onClick={fetchGraph} className="stein-btn-primary text-sm">
          🔄 Refresh Graph
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="w-full h-[550px] bg-stein-surface border border-stein-border rounded-lg flex items-center justify-center text-stein-text-dim">
              Loading graph dataset from Neo4j...
            </div>
          ) : (
            <CytoscapeGraph data={graphData} onNodeClick={setSelectedNode} />
          )}
        </div>

        {/* Node Inspector Sidebar */}
        <div className="stein-card space-y-4">
          <h2 className="text-base font-semibold text-stein-text border-b border-stein-border pb-2">
            Entity Inspector
          </h2>
          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stein-text-dim font-medium uppercase">Entity Type</span>
                <p className="text-sm font-bold text-stein-accent-bright mt-0.5">
                  {selectedNode.labels?.[0] || 'Node'}
                </p>
              </div>

              <div>
                <span className="text-stein-text-dim font-medium uppercase">Properties</span>
                <div className="bg-stein-surface-alt p-3 rounded border border-stein-border mt-1 space-y-1 font-mono text-[11px]">
                  {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                    <div key={k} className="break-all">
                      <strong className="text-stein-cyan">{k}:</strong> {String(v)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stein-text-dim py-8 text-center">
              Click any node in the graph to inspect entity attributes and relationship properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
