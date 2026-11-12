import logging

import psycopg
from fastapi import FastAPI, HTTPException

from app.analyzer import explain_query
from app.database import connect
from app.plan_parser import parse_explain_result
from app.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse
from app.sql_validation import SQLValidationError, validate_read_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("querylens.api")

app = FastAPI(title="QueryLens API", version="1.0.0")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        with connect() as connection:
            row = connection.execute(
                "SELECT current_database(), current_setting('server_version')"
            ).fetchone()
        return HealthResponse(
            service="ok",
            database="connected",
            database_name=row[0],
            postgres_version=row[1],
        )
    except Exception:
        logger.warning("Database health check failed")
        raise HTTPException(
            status_code=503,
            detail={"message": "La API está activa, pero no puede conectar con PostgreSQL."},
        ) from None


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        query = validate_read_query(request.query)
    except SQLValidationError as exc:
        raise HTTPException(status_code=422, detail={"message": str(exc)}) from None

    try:
        return parse_explain_result(explain_query(query))
    except psycopg.errors.QueryCanceled:
        raise HTTPException(
            status_code=408,
            detail={
                "message": (
                    "La consulta superó el límite de ejecución configurado. "
                    "Reduce el trabajo de la consulta e inténtalo de nuevo."
                )
            },
        ) from None
    except psycopg.OperationalError:
        logger.warning("Database connection failed during query analysis")
        raise HTTPException(
            status_code=503,
            detail={"message": "No se puede conectar con la base de datos de demostración."},
        ) from None
    except psycopg.Error as exc:
        message = getattr(getattr(exc, "diag", None), "message_primary", None)
        logger.info("PostgreSQL rejected an analysis query: %s", exc.sqlstate)
        raise HTTPException(
            status_code=400,
            detail={
                "message": message or "PostgreSQL no pudo analizar esta consulta.",
            },
        ) from None
    except Exception:
        logger.exception("Unexpected error while analyzing a query")
        raise HTTPException(
            status_code=500,
            detail={"message": "No se pudo analizar la consulta por un error interno."},
        ) from None

