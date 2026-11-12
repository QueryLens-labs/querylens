import { useMemo, useState } from "react";
import type { AnalyzeResult, PlanNode } from "../types";
import { formatNumber } from "../utils/format";
import { Icon, type IconName } from "./Icon";

type ResultTab = "plan" | "raw";

function nodeKind(nodeType: string): { className: string; icon: IconName } {
  const name = nodeType.toLowerCase();
  if (name.includes("scan")) return { className: "scan", icon: "scan" };
  if (name.includes("join")) return { className: "join", icon: "join" };
  if (name.includes("aggregate")) return { className: "aggregate", icon: "aggregate" };
  if (name.includes("sort")) return { className: "sort", icon: "sort" };
  if (name.includes("limit")) return { className: "limit", icon: "limit" };
  return { className: "other", icon: "other" };
}

function collectBranchIds(node: PlanNode, id: string, ids: string[]) {
  if (node.children.length === 0) return;
  ids.push(id);
  node.children.forEach((child, index) => collectBranchIds(child, `${id}.${index}`, ids));
}

function PlanTreeNode({ node, id, collapsedIds, onToggle }: {
  node: PlanNode;
  id: string;
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsedIds.has(id);
  const kind = nodeKind(node.node_type);
  const details = [node.relation_name, node.index_name, node.join_type && `${node.join_type} join`, node.strategy]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={`plan-tree-item plan-tree-item--${kind.className}`}>
      <article className="plan-node">
        <div className="plan-node-summary">
          {hasChildren ? (
            <button
              className="node-disclosure"
              type="button"
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.node_type}`}
              aria-expanded={!isCollapsed}
              onClick={() => onToggle(id)}
            >
              <Icon name={isCollapsed ? "chevronRight" : "chevronDown"} size={15} />
            </button>
          ) : <span className="node-disclosure-spacer" />}
          <span className="node-glyph"><Icon name={kind.icon} size={15} /></span>
          <div className="node-name-wrap">
            <strong className="node-name">{node.node_type}</strong>
            {details && <span className="node-detail">{details}</span>}
          </div>
        </div>
        <div className="node-stats">
          <span><small>Actual time</small><b>{node.actual_total_time_ms === null ? "—" : `${formatNumber(node.actual_total_time_ms, 3)} ms`}</b></span>
          <span><small>Rows</small><b>{formatNumber(node.actual_rows)}</b></span>
          <span><small>Cost (est.)</small><b>{formatNumber(node.total_cost, 2)}</b></span>
          <span><small>Est. rows</small><b>{formatNumber(node.estimated_rows)}</b></span>
        </div>
        {(node.actual_loops !== null || node.shared_hit_blocks !== null || node.shared_read_blocks !== null || node.rows_removed_by_filter !== null) && (
          <details className="node-extra">
            <summary>Details</summary>
            <div className="node-extra-content">
              {node.actual_loops !== null && <span>Loops: {formatNumber(node.actual_loops)}</span>}
              {(node.shared_hit_blocks !== null || node.shared_read_blocks !== null) && (
                <span>Buffers hit / read: {formatNumber(node.shared_hit_blocks)} / {formatNumber(node.shared_read_blocks)}</span>
              )}
              {node.rows_removed_by_filter !== null && <span>Rows filtered: {formatNumber(node.rows_removed_by_filter)}</span>}
            </div>
          </details>
        )}
      </article>
      {hasChildren && !isCollapsed && (
        <ul className="plan-children">
          {node.children.map((child, index) => (
            <PlanTreeNode
              key={`${child.node_type}-${index}`}
              node={child}
              id={`${id}.${index}`}
              collapsedIds={collapsedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function PlanTree({ result }: { result: AnalyzeResult }) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const allBranchIds = useMemo(() => {
    const ids: string[] = [];
    collectBranchIds(result.root, "0", ids);
    return ids;
  }, [result]);
  const allCollapsed = allBranchIds.length > 0 && allBranchIds.every((id) => collapsedIds.has(id));

  function toggleNode(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setCollapsedIds(allCollapsed ? new Set() : new Set(allBranchIds));
  }

  return (
    <div className="plan-tree-wrap">
      <div className="plan-tree-toolbar">
        <span><i /> PostgreSQL plan tree</span>
        {allBranchIds.length > 0 && (
          <button type="button" className="tree-toggle" onClick={toggleAll}>
            <Icon name={allCollapsed ? "expand" : "collapse"} size={14} />
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
        )}
      </div>
      <ul className="plan-tree-list">
        <PlanTreeNode node={result.root} id="0" collapsedIds={collapsedIds} onToggle={toggleNode} />
      </ul>
    </div>
  );
}

interface ExecutionPlanProps {
  result: AnalyzeResult | null;
  error: string | null;
  running: boolean;
}

export function ExecutionPlan({ result, error, running }: ExecutionPlanProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("plan");

  return (
    <section className="results-panel" aria-labelledby="results-title">
      <div className="result-tabs" role="tablist" aria-label="Analysis results">
        <button
          className={`result-tab${activeTab === "plan" ? " result-tab--active" : ""}`}
          type="button" role="tab" aria-selected={activeTab === "plan"}
          onClick={() => setActiveTab("plan")}
        ><Icon name="execution" size={15} /> Execution Plan</button>
        <button className="result-tab result-tab--disabled" type="button" disabled title="Planned for Phase 2.3">
          <Icon name="flow" size={15} /> Visual Flow <span className="tab-soon">Soon</span>
        </button>
        <button className="result-tab result-tab--disabled" type="button" disabled title="The current API returns the execution plan, not query result rows">
          <Icon name="results" size={15} /> Results <span className="tab-soon">Soon</span>
        </button>
        <button
          className={`result-tab${activeTab === "raw" ? " result-tab--active" : ""}${!result ? " result-tab--empty" : ""}`}
          type="button" role="tab" aria-selected={activeTab === "raw"}
          onClick={() => setActiveTab("raw")}
        ><Icon name="raw" size={15} /> Raw JSON</button>
      </div>

      <div className="panel plan-content-panel">
        <div className="results-heading">
          <div>
            <h2 id="results-title">Execution Plan</h2>
            <p>Hierarchical view of how PostgreSQL executes your query.</p>
          </div>
          {result && <span className="result-badge"><span /> COMPLETE</span>}
          {running && <span className="running-badge"><span className="spinner" /> RUNNING</span>}
        </div>
      <div className="results-content">
        {running && <div className="result-state"><span className="large-spinner" /><strong>Analyzing query</strong><span>Waiting for the PostgreSQL execution plan…</span></div>}
        {!running && error && <div className="plan-empty-state plan-error-state" role="alert"><span className="error-icon">!</span><strong>Analysis failed</strong><p>{error}</p></div>}
        {!running && !error && !result && <div className="plan-empty-state"><span className="empty-plan-icon"><Icon name="execution" size={22} /></span><strong>Ready to analyze</strong><p>Run your read-only query to view the real plan from PostgreSQL.</p></div>}
        {!running && !error && result && activeTab === "plan" && (
          <>
            <PlanTree key={JSON.stringify(result.root)} result={result} />
            <p className="cost-note"><Icon name="pending" size={13} /> Cost values are PostgreSQL estimates in planner units, not elapsed time.</p>
          </>
        )}
        {!running && !error && result && activeTab === "raw" && (
          <pre className="raw-json-view" aria-label="Raw PostgreSQL plan JSON">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
      </div>
    </section>
  );
}

