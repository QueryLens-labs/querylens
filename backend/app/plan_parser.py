from typing import Any

from app.schemas import AnalyzeResponse, PlanNode


def _number(value: Any, target: type[int] | type[float]) -> Any:
    if value is None:
        return None
    return target(value)


def _to_node(plan: dict[str, Any]) -> PlanNode:
    return PlanNode(
        node_type=plan.get("Node Type", "Unknown"),
        relation_name=plan.get("Relation Name"),
        schema_name=plan.get("Schema"),
        alias=plan.get("Alias"),
        index_name=plan.get("Index Name"),
        join_type=plan.get("Join Type"),
        strategy=plan.get("Strategy"),
        startup_cost=_number(plan.get("Startup Cost"), float),
        total_cost=_number(plan.get("Total Cost"), float),
        estimated_rows=_number(plan.get("Plan Rows"), int),
        actual_rows=_number(plan.get("Actual Rows"), int),
        actual_loops=_number(plan.get("Actual Loops"), int),
        actual_total_time_ms=_number(plan.get("Actual Total Time"), float),
        rows_removed_by_filter=_number(plan.get("Rows Removed by Filter"), int),
        shared_hit_blocks=_number(plan.get("Shared Hit Blocks"), int),
        shared_read_blocks=_number(plan.get("Shared Read Blocks"), int),
        children=[_to_node(child) for child in plan.get("Plans", [])],
    )


def parse_explain_result(result: list[dict[str, Any]]) -> AnalyzeResponse:
    document = result[0]
    return AnalyzeResponse(
        planning_time_ms=_number(document.get("Planning Time"), float),
        execution_time_ms=_number(document.get("Execution Time"), float),
        root=_to_node(document["Plan"]),
    )

