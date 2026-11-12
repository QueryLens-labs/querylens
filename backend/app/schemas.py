from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    query: str = Field(min_length=1, max_length=50_000)


class PlanNode(BaseModel):
    node_type: str
    relation_name: str | None = None
    schema_name: str | None = None
    alias: str | None = None
    index_name: str | None = None
    join_type: str | None = None
    strategy: str | None = None
    startup_cost: float | None = None
    total_cost: float | None = None
    estimated_rows: int | None = None
    actual_rows: int | None = None
    actual_loops: int | None = None
    actual_total_time_ms: float | None = None
    rows_removed_by_filter: int | None = None
    shared_hit_blocks: int | None = None
    shared_read_blocks: int | None = None
    children: list["PlanNode"] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    planning_time_ms: float | None
    execution_time_ms: float | None
    root: PlanNode


class HealthResponse(BaseModel):
    service: str
    database: str
    database_name: str | None = None
    postgres_version: str | None = None

