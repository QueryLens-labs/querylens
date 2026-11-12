import { useMemo } from "react";
import CodeMirror, { Prec } from "@uiw/react-codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import type { AnalyzeResult } from "../types";
import { Icon } from "./Icon";
import { MetricsPanel } from "./MetricsPanel";

interface QueryAnalyzerProps {
  query: string;
  onQueryChange: (query: string) => void;
  result: AnalyzeResult | null;
  error: string | null;
  running: boolean;
  onAnalyze: () => void;
}

export function QueryAnalyzer({
  query,
  onQueryChange,
  result,
  error,
  running,
  onAnalyze,
}: QueryAnalyzerProps) {
  const extensions = useMemo(() => [
    sql({ dialect: PostgreSQL }),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ "aria-label": "SQL query editor" }),
    Prec.high(keymap.of([{
      key: "Mod-Enter",
      run: () => {
        if (!running && query.trim()) onAnalyze();
        return true;
      },
    }])),
  ], [onAnalyze, query, running]);

  return (
    <section className="analyzer-panel" aria-labelledby="analyzer-title">
      <div className="analyzer-heading">
        <h1 id="analyzer-title">Query Analyzer</h1>
        <p>Write a query, analyze its execution plan and understand how PostgreSQL runs it.</p>
      </div>

      <div className="analyzer-body">
        <div className="editor-column">
          <div className="editor-window">
            <CodeMirror
              value={query}
              onChange={onQueryChange}
              extensions={extensions}
              theme={oneDark}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: true,
                bracketMatching: true,
                autocompletion: false,
              }}
              editable={!running}
              aria-label="SQL query editor"
              className="sql-code-editor"
              height="328px"
            />
          </div>
          <div className="editor-foot">
            <span className="execution-note"><span className="info-mark">i</span> EXPLAIN ANALYZE executes the query</span>
            <span>{query.length.toLocaleString("en-US")} characters</span>
          </div>
          {error && !running && (
            <div className="analyzer-error" role="alert">
              <span className="error-icon">!</span>
              <div><strong>Analysis failed</strong><p>{error}</p></div>
            </div>
          )}
          {running && <div className="analyzer-running" aria-live="polite"><span className="spinner" /> PostgreSQL is analyzing the query…</div>}
        </div>
        <div className="analyzer-controls">
          <div className="editor-actions">
            <button className="run-button" type="button" onClick={onAnalyze} disabled={running || !query.trim()}>
              {running ? <span className="spinner" /> : <Icon name="play" size={15} />}
              <span>{running ? "Analyzing…" : "Run Analysis"}<small>Ctrl / ⌘ + Enter</small></span>
            </button>
          </div>
          <MetricsPanel query={query} result={result} />
        </div>
      </div>
    </section>
  );
}
