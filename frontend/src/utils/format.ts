export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatMilliseconds(value: number | null): string {
  return value === null ? "Not available" : `${formatNumber(value, 3)} ms`;
}

export function formatTotalTime(
  planningTime: number | null,
  executionTime: number | null,
): string {
  if (planningTime === null || executionTime === null) return "Not available";
  return formatMilliseconds(planningTime + executionTime);
}

