#!/bin/sh
set -eu

: "${QUERYLENS_DB_PASSWORD:?QUERYLENS_DB_PASSWORD es obligatorio}"

psql --set=ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=app_password="$QUERYLENS_DB_PASSWORD" <<'SQL'
CREATE ROLE querylens_readonly LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE querylens TO querylens_readonly;
REVOKE CREATE, TEMPORARY ON DATABASE querylens FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO querylens_readonly;
GRANT SELECT ON products, sales TO querylens_readonly;
SQL

