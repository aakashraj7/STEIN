import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { Network, Sparkles, RefreshCw } from 'lucide-react';

export default function CytoscapeGraph({ data, onNodeClick, onSeed }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const hasNodes = data && data.nodes && data.nodes.length > 0;

  useEffect(() => {
    if (!containerRef.current || !hasNodes) return;

    // Convert nodes and edges into Cytoscape format
    const cyNodes = (data?.nodes || []).map((n, idx) => {
      const type = n.labels?.[0] || n.type || 'Vendor';
      let label =
        n.properties?.name ||
        n.properties?.alias ||
        n.properties?.caseNumber ||
        (n.properties?.address ? n.properties.address.substring(0, 6) + '...' + n.properties.address.substring(n.properties.address.length - 4) : null) ||
        n.properties?.title ||
        `Node #${idx + 1}`;

      const nodeId = String(n.id ?? n._id ?? `node_${idx}`);
      return {
        data: {
          id: nodeId,
          label,
          type,
          raw: n,
        },
      };
    });

    const cyEdges = (data?.edges || []).map((e, idx) => ({
      data: {
        id: String(e.id ?? e._id ?? `edge_${idx}`),
        source: String(e.source ?? e.from),
        target: String(e.target ?? e.to),
        label: e.type || e.relationship || 'LINKED',
        raw: e,
      },
    }));

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1e293b',
            'label': 'data(label)',
            'color': '#cbd5e1',
            'font-size': '10px',
            'font-family': 'system-ui, sans-serif',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': 28,
            'height': 28,
            'border-width': 2,
            'border-color': '#3b82f6',
            'text-background-opacity': 0,
          },
        },
        {
          selector: 'node[type = "Vendor"]',
          style: {
            'background-color': '#1e1b4b',
            'border-color': '#ef4444',
            'color': '#fca5a5',
            'shape': 'ellipse',
          },
        },
        {
          selector: 'node[type = "Wallet"]',
          style: {
            'background-color': '#1c1917',
            'border-color': '#f59e0b',
            'color': '#fde68a',
            'shape': 'diamond',
          },
        },
        {
          selector: 'node[type = "Message"]',
          style: {
            'background-color': '#0f172a',
            'border-color': '#3b82f6',
            'color': '#93c5fd',
            'shape': 'round-rectangle',
          },
        },
        {
          selector: 'node[type = "Case"]',
          style: {
            'background-color': '#064e3b',
            'border-color': '#10b981',
            'color': '#a7f3d0',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "Channel"]',
          style: {
            'background-color': '#3b0764',
            'border-color': '#a855f7',
            'color': '#e9d5ff',
            'shape': 'pentagon',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#64748b',
            'font-size': '8px',
            'font-family': 'monospace',
            'text-rotation': 'autorotate',
            'text-margin-y': -6,
            'opacity': 0.85,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#38bdf8',
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'opacity': 1,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        padding: 60,
        nodeOverlap: 30,
        componentSpacing: 80,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 80,
        edgeElasticity: () => 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    if (onNodeClick) {
      cyRef.current.on('tap', 'node', (evt) => {
        const node = evt.target;
        onNodeClick(node.data('raw'));
      });
    }

    // Force layout centering & fit after rendering
    setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit();
        cyRef.current.center();
      }
    }, 150);

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [data, hasNodes, onNodeClick]);

  return (
    <div className="relative w-full h-[580px] bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
      {hasNodes ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#111827]">
          <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <Network className="w-6 h-6" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-white tracking-tight">Neo4j Link Graph Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No multi-entity nodes or relationships are currently loaded. Populate synthetic intelligence to visualize live threat actors, crypto wallets, and ingested channel messages.
            </p>
          </div>

          {onSeed && (
            <button
              onClick={onSeed}
              className="stein-btn-primary text-xs px-5 py-2.5"
            >
              <Network className="w-4 h-4" />
              <span>Initialize Graph Intelligence</span>
            </button>
          )}
        </div>
      )}

      {/* Graph Legend Overlay */}
      {hasNodes && (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl text-xs space-y-2 z-10 text-slate-300 shadow-xl">
          <div className="font-bold text-white text-[10px] uppercase tracking-wider border-b border-slate-800 pb-1">
            GRAPH LEGEND
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] inline-block" />
            <span>Vendor Node</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="w-3 h-3 bg-amber-500 rotate-45 shadow-[0_0_8px_#f59e0b] inline-block" />
            <span>Crypto Wallet</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_8px_#22d3ee] inline-block" />
            <span>Ingested Msg</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="w-3 h-3 bg-emerald-500 shadow-[0_0_8px_#10b981] inline-block" />
            <span>Case File</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="w-3 h-3 rounded bg-purple-500 shadow-[0_0_8px_#8b5cf6] inline-block" />
            <span>Channel Intel</span>
          </div>
        </div>
      )}
    </div>
  );
}
