import { Database, FileText, Save, FlaskConical, Table2, Settings, Menu, X, Play, Clock, List, DollarSign, Network, Share2, ChartNoAxesCombined, Workflow, Code2, ClipboardList, ChevronDown, ChevronRight, Expand, Shrink, Scan, GitMerge, Sigma, ListFilter, PanelTop, Ellipsis, type LucideIcon } from "lucide-react";

const icons = {
  database: Database, query: FileText, saved: Save, experiment: FlaskConical,
  table: Table2, settings: Settings, menu: Menu, close: X, play: Play,
  clock: Clock, rows: List, cost: DollarSign, schema: Network, relationship: Share2,
  execution: ChartNoAxesCombined, flow: Workflow, raw: Code2, results: ClipboardList,
  chevronDown: ChevronDown, chevronRight: ChevronRight, expand: Expand, collapse: Shrink,
  pending: Clock, scan: Scan, join: GitMerge, aggregate: Sigma, sort: ListFilter,
  limit: PanelTop, other: Ellipsis,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
interface IconProps { name: IconName; size?: number; className?: string; }
export function Icon({ name, size = 18, className }: IconProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" size={size} className={className} strokeWidth={1.7} />;
}
