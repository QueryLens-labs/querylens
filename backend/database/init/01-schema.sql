CREATE TABLE products (
    id integer PRIMARY KEY,
    sku text NOT NULL UNIQUE,
    name text NOT NULL,
    category text NOT NULL,
    price numeric(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE sales (
    id bigint PRIMARY KEY,
    product_id integer NOT NULL REFERENCES products(id),
    customer_id integer NOT NULL,
    quantity smallint NOT NULL CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
    sold_at timestamptz NOT NULL
);

INSERT INTO products (id, sku, name, category, price)
SELECT
    product_id,
    'QL-' || lpad(product_id::text, 4, '0'),
    'Producto de muestra ' || lpad(product_id::text, 3, '0'),
    CASE product_id % 5
        WHEN 0 THEN 'Accesorios'
        WHEN 1 THEN 'Audio'
        WHEN 2 THEN 'Informática'
        WHEN 3 THEN 'Hogar'
        ELSE 'Oficina'
    END,
    (10 + ((product_id * 173) % 9000) / 100.0)::numeric(10, 2)
FROM generate_series(1, 100) AS series(product_id);

INSERT INTO sales (id, product_id, customer_id, quantity, unit_price, sold_at)
SELECT
    sale_id,
    product.id,
    ((sale_id * 7919) % 10000 + 1)::integer,
    ((sale_id * 7) % 5 + 1)::smallint,
    product.price,
    now() - (((sale_id * 97) % 730)::text || ' days')::interval
FROM generate_series(1, 100000) AS series(sale_id)
JOIN products AS product ON product.id = ((sale_id - 1) % 100 + 1);

CREATE INDEX sales_product_id_idx ON sales (product_id);
CREATE INDEX sales_sold_at_idx ON sales (sold_at);

ANALYZE products;
ANALYZE sales;

