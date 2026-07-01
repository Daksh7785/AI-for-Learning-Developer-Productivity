'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphNode, GraphEdge, KnowledgeGraph } from '@/lib/knowledge-graph';

interface ArchitectureVizProps {
  knowledgeGraph: KnowledgeGraph;
}

const nodeTypes: NodeTypes = {};

export default function ArchitectureViz({ knowledgeGraph }: ArchitectureVizProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const initialNodes: Node[] = useMemo(() => {
    return knowledgeGraph.nodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      position: { x: (index % 4) * 200, y: Math.floor(index / 4) * 150 },
      data: {
        label: (
          <div className="p-2">
            <div className="font-semibold text-sm">{node.label}</div>
            <div className="text-xs text-gray-500">{node.type}</div>
          </div>
        ),
        originalNode: node,
      },
      style: {
        background: getNodeColor(node.type),
        border: '2px solid #333',
        borderRadius: '8px',
        width: 180,
        height: 80,
      },
    }));
  }, [knowledgeGraph.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return knowledgeGraph.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.type === 'call',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      label: edge.type,
      labelStyle: {
        fontSize: '10px',
        fontWeight: 'bold',
      },
      style: {
        stroke: getEdgeColor(edge.type),
        strokeWidth: 2,
      },
    }));
  }, [knowledgeGraph.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data.originalNode);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#1e293b" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => getNodeColor(node.data.originalNode?.type || 'default')}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-slate-800 rounded-lg p-4 shadow-xl border border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">Type:</span>
              <span className="ml-2 text-white">{selectedNode.type}</span>
            </div>
            <div>
              <span className="text-slate-400">File:</span>
              <span className="ml-2 text-blue-400">{selectedNode.file}</span>
            </div>
            <div>
              <span className="text-slate-400">Line:</span>
              <span className="ml-2 text-white">{selectedNode.properties.line}</span>
            </div>
            {selectedNode.properties.dependencies?.length > 0 && (
              <div>
                <span className="text-slate-400">Dependencies:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedNode.properties.dependencies.map((dep: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-700 rounded text-xs text-white"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    function: '#3b82f6',
    class: '#8b5cf6',
    variable: '#10b981',
    interface: '#f59e0b',
    type: '#ef4444',
    default: '#64748b',
  };
  return colors[type] || colors.default;
}

function getEdgeColor(type: string): string {
  const colors: Record<string, string> = {
    import: '#3b82f6',
    call: '#10b981',
    extends: '#8b5cf6',
    implements: '#f59e0b',
    reference: '#64748b',
  };
  return colors[type] || colors.reference;
}
