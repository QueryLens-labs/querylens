import type { AnalyzeResult } from "../types";
import { formatMilliseconds, formatNumber, formatTotalTime } from "../utils/format";

interface MetricsPanelProps {
  query: string;
  result: AnalyzeResult | null;
}

function getQueryType(query: string): string {
  const normalized = query.trim().replace(/^(?:--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/\s*)+/, "");
  return /^WITH\b/i.test(normalized) ? "SELECT · CTE" : "SELECT";
}

function Metric({ label, value, detail, highlight = false }: {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
}) {
  return (
    <div className="metric-card" title={detail}>
      <span className="metric-label">{label}</span>
      <strong className={`metric-value${highlight ? " metric-value--highlight" : ""}`}>{value}</strong>
    </div>
  );
}

export function MetricsPanel({ query, result }: MetricsPanelProps) {
  const queryType = result ? getQueryType(query) : "Not available";
  const estimatedRows = result?.root.estimated_rows ?? null;
  const actualRows = result?.root.actual_rows ?? null;
  const rowsValue = result ? formatNumber(actualRows) : "Not available";

  return (
    <aside className="metrics-panel" aria-label="Query metrics">
      <div className="metrics-grid">
        <Metric label="Query type" value={result ? `${queryType} (read-only)` : queryType} highlight={!!result} />
        <Metric
          label="Estimated cost"
          value={result ? formatNumber(result.root.total_cost, 2) : "Not available"}
          detail={result ? "PostgreSQL cost units" : undefined}
        />
        <Metric
          label="Execution time"
          value={result ? formatMilliseconds(result.execution_time_ms) : "Not available"}
        />
        <Metric
          label="Rows returned"
          value={rowsValue}
          detail={result ? `Estimated ${formatNumber(estimatedRows)} rows` : undefined}
        />
        <Metric
          label="Planning time"
          value={result ? formatMilliseconds(result.planning_time_ms) : "Not available"}
        />
        <Metric
          label="Total time"
          value={result ? formatTotalTime(result.planning_time_ms, result.execution_time_ms) : "Not available"}
          detail={result ? "Planning + execution" : undefined}
        />
      </div>
      <p className="metric-cost-note">Estimated cost is in PostgreSQL planner units, not time.</p>
    </aside>
  );
}
