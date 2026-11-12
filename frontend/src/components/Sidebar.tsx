import type { ApiHealth } from "../types";
import type { ConnectionState } from "./TopBar";
import { Icon, type IconName } from "./Icon";

interface SidebarProps {
  connectionState: ConnectionState;
  health: ApiHealth | null;
  mobileOpen: boolean;
  onClose: () => void;
}

const workspaceItems: Array<{
  label: string;
  icon: IconName;
  active?: boolean;
}> = [
  { label: "Query Analyzer", icon: "query", active: true },
  { label: "Saved Queries", icon: "saved" },
  { label: "Experiments", icon: "experiment" },
  { label: "Schema", icon: "schema" },
  { label: "Settings", icon: "settings" },
];

const demoTables = ["products", "sales"];

function connectionStatusText(state: ConnectionState) {
  if (state === "connected") return "Connected";
  if (state === "checking") return "Checking";
  return "Unavailable";
}

export function Sidebar({
  connectionState,
  health,
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close workspace navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`} aria-label="Workspace navigation">
        <div className="sidebar-mobile-heading">
          <span>Workspace</span>
          <button type="button" aria-label="Close navigation" onClick={onClose}>
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Workspace</p>
          <nav className="workspace-nav" aria-label="Workspace">
            {workspaceItems.map((item) => (
              <button
                className={`sidebar-item${item.active ? " sidebar-item--active" : " sidebar-item--pending"}`}
                key={item.label}
                type="button"
                disabled={!item.active}
                aria-current={item.active ? "page" : undefined}
                title={item.active ? item.label : `${item.label} is planned`}
                onClick={item.active ? onClose : undefined}
              >
                <Icon name={item.icon} size={17} />
                <span className="sidebar-item-label">{item.label}</span>
                {!item.active && <span className="sidebar-soon">Soon</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section sidebar-database-section">
          <p className="sidebar-section-title">Demo Database</p>
          <div className="sidebar-table-list" aria-label="Demo database tables">
            {demoTables.map((table) => (
              <div className="sidebar-table" key={table} title={table}>
                <Icon name="table" size={16} />
                <span>{table}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="sidebar-status-card" aria-label="Database status">
          <p className="sidebar-status-title">Database Status</p>
          <div className="sidebar-status-heading">
            <span className={`connection-dot connection-dot--${connectionState}`} />
            <span>{connectionStatusText(connectionState)}</span>
          </div>
          {connectionState === "connected" && health?.database_name && (
            <p className="sidebar-database-name">{health.database_name}</p>
          )}
          {connectionState === "disconnected" && (
            <p className="sidebar-status-note">The API health check failed.</p>
          )}
          {connectionState === "checking" && (
            <p className="sidebar-status-note">Waiting for the API health check.</p>
          )}
        </section>
      </aside>
    </>
  );
}

