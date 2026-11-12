import pytest

from app.sql_validation import SQLValidationError, validate_read_query


@pytest.mark.parametrize(
    "query",
    [
        "SELECT 1",
        "-- comentario\nSELECT id FROM products;",
        "WITH recent AS (SELECT id FROM sales) SELECT id FROM recent",
    ],
)
def test_accepts_single_select_queries(query: str) -> None:
    assert validate_read_query(query).upper().find("SELECT") >= 0


@pytest.mark.parametrize(
    "query",
    [
        "",
        "UPDATE products SET price = 1",
        "SELECT 1; SELECT 2",
        "WITH changed AS (DELETE FROM products RETURNING id) SELECT * FROM changed",
        "SELECT * INTO copied_products FROM products",
        "SELECT * FROM products FOR UPDATE",
        "SELECT FROM",
    ],
)
def test_rejects_invalid_or_mutating_queries(query: str) -> None:
    with pytest.raises(SQLValidationError):
        validate_read_query(query)

