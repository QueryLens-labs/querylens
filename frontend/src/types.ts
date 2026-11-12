export interface PlanNode {
  node_type: string;
  relation_name: string | null;
  schema_name: string | null;
  alias: string | null;
  index_name: string | null;
  join_type: string | null;
  strategy: string | null;
  startup_cost: number | null;
  total_cost: number | null;
  estimated_rows: number | null;
  actual_rows: number | null;
  actual_loops: number | null;
  actual_total_time_ms: number | null;
  rows_removed_by_filter: number | null;
  shared_hit_blocks: number | null;
  shared_read_blocks: number | null;
  children: PlanNode[];
}

export interface AnalyzeResult {
  planning_time_ms: number | null;
  execution_time_ms: number | null;
  root: PlanNode;
}

export interface ApiHealth {
  service: string;
  database: string;
  database_name: string | null;
  postgres_version: string | null;
}

