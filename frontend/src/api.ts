import type { AnalyzeResult, ApiHealth } from "./types";

interface ApiError {
  detail?: string | { message?: string };
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    if (typeof body.detail === "string") return body.detail;
    if (body.detail?.message) return body.detail.message;
  } catch {
    // The API may return a non-JSON gateway error.
  }
  return `The request failed (HTTP ${response.status}).`;
}

export async function fetchHealth(): Promise<ApiHealth> {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as ApiHealth;
}

export async function analyzeQuery(query: string): Promise<AnalyzeResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as AnalyzeResult;
}

