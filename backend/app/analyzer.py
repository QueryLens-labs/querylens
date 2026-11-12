from typing import Any

from app.config import settings
from app.database import connect


def explain_query(query: str) -> list[dict[str, Any]]:
    with connect() as connection:
        with connection.transaction():
            connection.execute("SET TRANSACTION READ ONLY")
            connection.execute(
                "SELECT set_config('statement_timeout', %s, true)",
                (f"{settings.statement_timeout_ms}ms",),
            )
            return connection.execute(
                f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query}"
            ).fetchone()[0]

