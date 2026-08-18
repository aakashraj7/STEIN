import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

export default function CytoscapeGraph({ data, onNodeClick }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert nodes and edges into Cytoscape format
    const cyNodes = (data?.nodes || []).map((n) => {
      const label = n.properties?.name || n.properties?.caseNumber || n.properties?.address?.substring(0, 8) + '...' || n.properties?.title || n.labels?.[0] || 'Node';
      const type = n.labels?.[0] || 'Unknown';
      return {
        data: {
          id: n.id,
          label: `${type}: ${label}`,
          type,
          raw: n,
        },
      };
    });

    const cyEdges = (data?.edges || []).map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type,
        raw: e,
      },
    }));

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'color': '#e2e8f0',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'width': 32,
            'height': 32,
            'border-width': 2,
            'border-color': '#1e293b',
          },
        },
        {
          selector: 'node[type = "Vendor"]',
          style: {
            'background-color': '#ef4444',
            'shape': 'ellipse',
          },
        },
        {
          selector: 'node[type = "Wallet"]',
          style: {
            'background-color': '#f59e0b',
            'shape': 'diamond',
          },
        },
        {
          selector: 'node[type = "Message"]',
          style: {
            'background-color': '#06b6d4',
            'shape': 'round-rectangle',
          },
        },
        {
          selector: 'node[type = "Case"]',
          style: {
            'background-color': '#10b981',
            'shape': 'rectangle',
          },
        },
        {
          selector: 'node[type = "Channel"]',
          style: {
            'background-color': '#8b5cf6',
            'shape': 'pentagon',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94a3b8',
            'font-size': '9px',
            'text-rotation': 'autorotate',
            'text-margin-y': -6,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#60a5fa',
            'line-color': '#60a5fa',
            'target-arrow-color': '#60a5fa',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 30,
      },
    });

    if (onNodeClick) {
      cyRef.current.on('tap', 'node', (evt) => {
        const node = evt.target;
        onNodeClick(node.data('raw'));
      });
    }

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [data, onNodeClick]);

  return (
    <div className="relative w-full h-[550px] bg-stein-surface border border-stein-border rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-stein-bg/80 backdrop-blur border border-stein-border p-2 rounded text-xs space-y-1 z-10 text-stein-text-dim">
        <div className="font-semibold text-stein-text mb-1">Graph Legend</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Vendor</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-amber-500 rotate-45 inline-block" /> Wallet</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Message</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 inline-block" /> Case</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Channel</div>
      </div>
    </div>
  );
}
