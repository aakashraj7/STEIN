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
      const label =
        n.properties?.name ||
        n.properties?.alias ||
        n.properties?.caseNumber ||
        (n.properties?.address ? n.properties.address.substring(0, 8) + '...' : null) ||
        n.properties?.title ||
        n.labels?.[0] ||
        `Node #${idx + 1}`;
      const type = n.labels?.[0] || n.type || 'Vendor';
      const nodeId = String(n.id ?? n._id ?? `node_${idx}`);
      return {
        data: {
          id: nodeId,
          label: `${type}: ${label}`,
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
        label: e.type || e.relationship || 'CONNECTED_TO',
        raw: e,
      },
    }));

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '11px',
            'font-family': 'monospace',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 36,
            'height': 36,
            'border-width': 2.5,
            'border-color': '#0284c7',
            'shadow-blur': 12,
            'shadow-color': '#38bdf8',
            'shadow-opacity': 0.4,
          },
        },
        {
          selector: 'node[type = "Vendor"]',
          style: {
            'background-color': '#ef4444',
            'shape': 'ellipse',
            'border-color': '#fca5a5',
            'shadow-color': '#ef4444',
          },
        },
        {
          selector: 'node[type = "Wallet"]',
          style: {
            'background-color': '#f59e0b',
            'shape': 'diamond',
            'border-color': '#fde68a',
            'shadow-color': '#f59e0b',
          },
        },
        {
          selector: 'node[type = "Message"]',
          style: {
            'background-color': '#06b6d4',
            'shape': 'round-rectangle',
            'border-color': '#a5f3fc',
            'shadow-color': '#06b6d4',
          },
        },
        {
          selector: 'node[type = "Case"]',
          style: {
            'background-color': '#10b981',
            'shape': 'rectangle',
            'border-color': '#6ee7b7',
            'shadow-color': '#10b981',
          },
        },
        {
          selector: 'node[type = "Channel"]',
          style: {
            'background-color': '#8b5cf6',
            'shape': 'pentagon',
            'border-color': '#c4b5fd',
            'shadow-color': '#8b5cf6',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#38bdf8',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.2,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94a3b8',
            'font-size': '9px',
            'font-family': 'monospace',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'shadow-blur': 20,
            'shadow-opacity': 0.8,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 600,
        padding: 50,
        nodeOverlap: 20,
        componentSpacing: 100,
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
      }
    }, 150);

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [data, hasNodes, onNodeClick]);

  return (
    <div className="relative w-full h-[580px] bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {hasNodes ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-5 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
          {/* Glowing Hexagonal Network Icon Container */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-cyan-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-rotate-hexagon">
              <polygon
                points="50,4 93,26 93,74 50,96 7,74 7,26"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-cyan-400"
              />
            </svg>
            <Network className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]" />
          </div>

          <div className="max-w-md space-y-2 z-10">
            <h3 className="text-lg font-black text-white tracking-tight">Neo4j Link Graph Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              No multi-entity nodes or relationships are currently loaded. Populate synthetic intelligence to visualize live threat actors, crypto wallets, and ingested channel messages.
            </p>
          </div>

          {onSeed && (
            <button
              onClick={onSeed}
              className="stein-btn-cyan text-xs px-6 py-3 shadow-[0_0_25px_rgba(6,182,212,0.5)] z-10"
            >
              <Network className="w-4 h-4 text-cyan-300" />
              <span>INITIALIZE GRAPH INTELLIGENCE</span>
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
