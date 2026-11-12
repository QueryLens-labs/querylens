import { useCallback, useEffect, useState } from "react";
import { analyzeQuery, fetchHealth } from "./api";
import { DatabaseSchemaPanel } from "./components/DatabaseSchemaPanel";
import { ExecutionPlan } from "./components/ExecutionPlan";
import { QueryAnalyzer } from "./components/QueryAnalyzer";
import { Sidebar } from "./components/Sidebar";
import { TopBar, type ConnectionState } from "./components/TopBar";
import { VisualFlowPanel } from "./components/VisualFlowPanel";
import type { AnalyzeResult, ApiHealth } from "./types";

const SAMPLE_QUERY = `-- Top products by revenue over the last 3 months
SELECT
  p.id,
  p.name,
  p.category,
  SUM(s.quantity) AS total_quantity,
  ROUND(SUM(s.quantity * s.unit_price), 2) AS total_revenue
FROM sales AS s
JOIN products AS p ON p.id = s.product_id
WHERE s.sold_at >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 10;`;

function App() {
  const [query, setQuery] = useState(SAMPLE_QUERY);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetchHealth();
      setHealth(response);
      setConnectionState(response.database === "connected" ? "connected" : "disconnected");
    } catch {
      setHealth(null);
      setConnectionState("disconnected");
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const timer = window.setInterval(() => void checkHealth(), 20_000);
    return () => window.clearInterval(timer);
  }, [checkHealth]);

  async function handleAnalyze() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      setResult(await analyzeQuery(query));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The query could not be analyzed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="app-shell min-h-screen w-full overflow-x-hidden">
      <TopBar
        connectionState={connectionState}
        health={health}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />
      <div className="workspace-frame">
        <Sidebar
          connectionState={connectionState}
          health={health}
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="dashboard" id="workspace">
          <div className="dashboard-grid">
            <QueryAnalyzer
              query={query}
              onQueryChange={setQuery}
              result={result}
              error={error}
              running={running}
              onAnalyze={() => void handleAnalyze()}
            />
            <DatabaseSchemaPanel />
            <ExecutionPlan
              result={result}
              error={error}
              running={running}
            />
            <VisualFlowPanel />
          </div>
          <footer className="dashboard-footer">
            <span>QUERYLENS <i /> POSTGRESQL QUERY ANALYSIS</span>
            <span>Read-only queries <i /> 10 second execution limit</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
