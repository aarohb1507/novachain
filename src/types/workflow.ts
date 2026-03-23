export type WorkflowNodeData = {
  label: string;
  category: "trigger" | "action" | "logic";
};

export type WorkflowDefinition = {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: WorkflowNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
};