import { Icon } from "./Icon";

export function DatabaseSchemaPanel() {
  return (
    <section className="panel schema-panel" aria-labelledby="schema-title">
      <div className="panel-heading">
        <h2 id="schema-title">Database Schema</h2>
        <span className="pending-label">COMING SOON</span>
      </div>
      <div className="schema-pending-state">
        <span className="schema-illustration"><Icon name="relationship" size={24} /></span>
        <strong>Schema explorer is coming soon</strong>
        <p>The live schema view is planned for a later phase. No table details are shown until the API provides them.</p>
      </div>
    </section>
  );
}
