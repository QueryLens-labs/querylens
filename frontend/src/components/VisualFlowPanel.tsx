import { Icon } from "./Icon";

export function VisualFlowPanel() {
  return (
    <section className="panel visual-flow-panel" aria-labelledby="flow-title">
      <div className="panel-heading">
        <div>
          <h2 id="flow-title">Visual Execution Flow</h2>
          <p>See the flow of data through the query plan.</p>
        </div>
        <span className="pending-label">PHASE 2.3</span>
      </div>
      <div className="flow-pending-state">
        <span className="flow-pending-icon"><Icon name="flow" size={23} /></span>
        <strong>Interactive flow is planned</strong>
        <p>This view will be generated from a real plan in a future phase.</p>
      </div>
    </section>
  );
}
