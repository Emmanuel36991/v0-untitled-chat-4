export type NodeType = 'strategy' | 'setup' | 'weakness' | 'strength' | 'neutral';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  val: number; // Size of the node
  color: string;
  // Stats for tooltip
  stats: {
    tradeCount: number;
    totalPnl: number;
    winRate: number;
  };
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string; // ID of source node
  target: string; // ID of target node
  value: number; // Weight/Thickness
  color?: string;
}

export interface VisualMapData {
  nodes: GraphNode[];
  links: GraphLink[];
}
