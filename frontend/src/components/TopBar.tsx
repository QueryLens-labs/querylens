import type { ApiHealth } from "../types";
import { Icon } from "./Icon";

export type ConnectionState = "checking" | "connected" | "disconnected";

interface TopBarProps {
  connectionState: ConnectionState;
  health: ApiHealth | null;
  onOpenSidebar: () => void;
}

const connectionLabels: Record<ConnectionState, string> = {
  checking: "Checking connection",
  connected: "PostgreSQL connected",
  disconnected: "PostgreSQL unavailable",
};

export function TopBar({ connectionState, health, onOpenSidebar }: TopBarProps) {
  return (
    <header className="topbar">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label="Open workspace navigation"
        onClick={onOpenSidebar}
      >
        <Icon name="menu" size={20} />
      </button>
      <a className="brand" href="#workspace" aria-label="QueryLens home">
        <span className="brand-mark"><Icon name="database" size={25} /></span>
        <span className="brand-name">QueryLens</span>
      </a>
      <p className="brand-tagline">Understand. Optimize. Go faster.</p>

      <div className="topbar-connection" aria-live="polite">
        <span className={`connection-dot connection-dot--${connectionState}`} />
        <div className="connection-copy">
          <span className="connection-label">{connectionLabels[connectionState]}</span>
          {connectionState === "connected" && health?.database_name && (
            <span className="connection-database">{health.database_name}</span>
          )}
        </div>
      </div>
    </header>
  );
}

