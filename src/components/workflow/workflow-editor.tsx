"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { WorkflowNodeData } from "@/types/workflow";

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "trigger-email",
    type: "default",
    position: { x: 60, y: 120 },
    data: { label: "New Gmail Email", category: "trigger" },
  },
  {
    id: "action-slack",
    type: "default",
    position: { x: 380, y: 120 },
    data: { label: "Send Slack Message", category: "action" },
  },
  {
    id: "action-trello",
    type: "default",
    position: { x: 700, y: 120 },
    data: { label: "Create Trello Card", category: "action" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "trigger-email",
    target: "action-slack",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-2",
    source: "action-slack",
    target: "action-trello",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export function WorkflowEditor() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (connection: Connection) => {
    setEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true,
        },
        currentEdges,
      ),
    );
  };

  return (
    <section className="w-full rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-black">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/15">
        <h2 className="text-sm font-semibold">Workflow Canvas</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Drag nodes and connect edges</p>
      </div>
      <div className="h-[520px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap pannable zoomable />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>
    </section>
  );
}