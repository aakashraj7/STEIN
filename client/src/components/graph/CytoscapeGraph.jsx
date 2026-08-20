import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { Network, Sparkles, RefreshCw } from 'lucide-react';

export default function CytoscapeGraph({ data, onNodeClick, onSeed, searchQuery }) {
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
            'background-color': '#ffffff',
            'label': 'data(label)',
            'color': '#0f172a',
            'font-size': '11px',
            'font-family': 'system-ui, sans-serif',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': 28,
            'height': 28,
            'border-width': 2.5,
            'border-color': '#2563eb',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': 2,
          },
        },
        {
          selector: 'node[type = "Vendor"]',
          style: {
            'background-color': '#fef2f2',
            'border-color': '#dc2626',
            'color': '#991b1b',
            'shape': 'ellipse',
          },
        },
        {
          selector: 'node[type = "Wallet"]',
          style: {
            'background-color': '#fffbeb',
            'border-color': '#d97706',
            'color': '#92400e',
            'shape': 'diamond',
          },
        },
        {
          selector: 'node[type = "Message"]',
          style: {
            'background-color': '#eff6ff',
            'border-color': '#2563eb',
            'color': '#1e40af',
            'shape': 'round-rectangle',
          },
        },
        {
          selector: 'node[type = "Case"]',
          style: {
            'background-color': '#ecfdf5',
            'border-color': '#059669',
            'color': '#065f46',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "Channel"]',
          style: {
            'background-color': '#faf5ff',
            'border-color': '#9333ea',
            'color': '#6b21a8',
            'shape': 'pentagon',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#94a3b8',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.85,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#475569',
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
            'border-width': 4,
            'border-color': '#2563eb',
            'line-color': '#2563eb',
            'target-arrow-color': '#2563eb',
            'opacity': 1,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 5,
            'border-color': '#2563eb',
            'width': 34,
            'height': 34,
          },
        },
      ],
      layout: {
        name: 'concentric',
        animate: true,
        animationDuration: 600,
        fit: true,
        padding: 70,
        startAngle: (3 / 2) * Math.PI,
        clockwise: true,
        equidistant: false,
        minNodeSpacing: 85,
        nodeDimensionsIncludeLabels: true,
        concentric: function (node) {
          const type = node.data('type');
          if (type === 'Vendor') return 4;
          if (type === 'Case') return 3;
          if (type === 'Wallet') return 2;
          return 1;
        },
        levelWidth: function () {
          return 1;
        },
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
    }, 200);

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [data, hasNodes, onNodeClick]);

  // Handle Search Query Auto-Zoom & Highlighting
  useEffect(() => {
    if (!cyRef.current || !hasNodes) return;
    const cy = cyRef.current;
    cy.nodes().removeClass('highlighted');
    cy.nodes().unselect();

    if (!searchQuery || !searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const matchingNodes = cy.nodes().filter((node) => {
      const label = (node.data('label') || '').toLowerCase();
      const raw = node.data('raw') || {};
      const name = (raw.properties?.name || '').toLowerCase();
      const addr = (raw.properties?.address || '').toLowerCase();
      const title = (raw.properties?.title || '').toLowerCase();
      return label.includes(q) || name.includes(q) || addr.includes(q) || title.includes(q);
    });

    if (matchingNodes.length > 0) {
      matchingNodes.select();
      matchingNodes.addClass('highlighted');
      cy.animate({
        zoom: 1.4,
        center: { eles: matchingNodes[0] },
        duration: 500,
      });
    }
  }, [searchQuery, hasNodes]);

  return (
    <div className="relative w-full h-[580px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]">
      {hasNodes ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Network className="w-6 h-6" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Neo4j Link Graph Workspace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
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

      {/* Graph Toolbar Overlay */}
      {hasNodes && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm p-1.5 rounded-lg text-xs flex items-center gap-1.5 z-10">
          <button
            onClick={() => {
              if (!cyRef.current) return;
              cyRef.current.layout({
                name: 'concentric',
                animate: true,
                animationDuration: 500,
                fit: true,
                padding: 60,
                minNodeSpacing: 85,
                concentric: (n) => (n.data('type') === 'Vendor' ? 4 : n.data('type') === 'Case' ? 3 : n.data('type') === 'Wallet' ? 2 : 1),
              }).run();
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200"
          >
            Structured Rings
          </button>

          <button
            onClick={() => {
              if (!cyRef.current) return;
              cyRef.current.layout({
                name: 'circle',
                animate: true,
                animationDuration: 500,
                fit: true,
                padding: 60,
              }).run();
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200"
          >
            Circle Layout
          </button>

          <button
            onClick={() => {
              if (!cyRef.current) return;
              cyRef.current.layout({
                name: 'grid',
                animate: true,
                animationDuration: 500,
                fit: true,
                padding: 60,
              }).run();
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200"
          >
            Grid Matrix
          </button>

          <button
            onClick={() => {
              if (cyRef.current) {
                cyRef.current.fit();
                cyRef.current.center();
              }
            }}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-sm"
          >
            Reset View
          </button>
        </div>
      )}

      {/* Graph Legend Overlay */}
      {hasNodes && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm p-3 rounded-xl text-xs space-y-2 z-10 text-slate-700">
          <div className="font-bold text-slate-900 text-[10px] uppercase tracking-wider border-b border-slate-200 pb-1">
            GRAPH LEGEND
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-300 inline-block" />
            <span>Vendor</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="w-2.5 h-2.5 bg-amber-500 rotate-45 border border-amber-300 inline-block" />
            <span>Crypto Wallet</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 border border-blue-300 inline-block" />
            <span>Ingested Msg</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="w-2.5 h-2.5 bg-emerald-500 border border-emerald-300 inline-block" />
            <span>Case File</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="w-2.5 h-2.5 rounded bg-purple-500 border border-purple-300 inline-block" />
            <span>Telegram Channel</span>
          </div>
        </div>
      )}
    </div>
  );
}
