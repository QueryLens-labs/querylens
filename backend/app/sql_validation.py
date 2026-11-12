from collections.abc import Iterator

from pglast import ast, parse_sql
from pglast.parser import ParseError


MAX_QUERY_LENGTH = 50_000
_WRITE_NODES = (
    ast.InsertStmt,
    ast.UpdateStmt,
    ast.DeleteStmt,
    ast.MergeStmt,
)


class SQLValidationError(ValueError):
    """A query is not a single, read-only SELECT statement."""


def _walk(value: object) -> Iterator[ast.Node]:
    if isinstance(value, ast.Node):
        yield value
        for field_name in value:
            yield from _walk(getattr(value, field_name))
    elif isinstance(value, (tuple, list)):
        for child in value:
            yield from _walk(child)


def validate_read_query(query: str) -> str:
    normalized = query.strip()
    if not normalized:
        raise SQLValidationError("Escribe una consulta SQL para analizarla.")
    if len(normalized) > MAX_QUERY_LENGTH:
        raise SQLValidationError(
            f"La consulta supera el límite de {MAX_QUERY_LENGTH} caracteres."
        )

    try:
        statements = parse_sql(normalized)
    except ParseError as exc:
        raise SQLValidationError("La consulta tiene un error de sintaxis SQL.") from exc

    if len(statements) != 1:
        raise SQLValidationError("Solo se permite una sentencia SQL por análisis.")

    root = statements[0].stmt
    if not isinstance(root, ast.SelectStmt):
        raise SQLValidationError("Solo se permiten consultas SELECT de lectura.")

    for node in _walk(root):
        if isinstance(node, _WRITE_NODES):
            raise SQLValidationError(
                "Las expresiones WITH solo pueden contener consultas de lectura."
            )
        if isinstance(node, ast.SelectStmt):
            if node.intoClause is not None:
                raise SQLValidationError("SELECT INTO no está permitido.")
            if node.lockingClause:
                raise SQLValidationError("Las cláusulas FOR UPDATE/SHARE no están permitidas.")

    return normalized

