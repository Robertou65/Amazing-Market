#!/bin/bash
# Script para exportar datos de la base de datos local
# Este script exporta SOLO los datos (INSERT), no el schema

set -e

DB_HOST="localhost"
DB_USER="app_user"
DB_PASSWORD="Pz0@PhXifvht94%I"
DB_NAME="amazing_market"

OUTPUT_DIR="."
SCHEMA_FILE="${OUTPUT_DIR}/database.sql"
DATA_FILE="${OUTPUT_DIR}/database_data.sql"

echo "🔍 Exportando datos de la base de datos..."

# Exportar SOLO los datos (sin DROP, sin CREATE TABLE)
mysqldump \
  -h "$DB_HOST" \
  -u "$DB_USER" \
  -p"$DB_PASSWORD" \
  --no-create-info \
  --skip-triggers \
  --complete-insert \
  --skip-extended-insert \
  "$DB_NAME" \
  > "$DATA_FILE"

echo "✅ Datos exportados a: $DATA_FILE"
echo ""
echo "📊 Estadísticas:"
echo "   - Schema file: $SCHEMA_FILE"
echo "   - Data file: $DATA_FILE"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Revisa el archivo $DATA_FILE"
echo "   2. Combina schema + datos con: ./merge_database_files.sh"
echo "   3. Haz commit de database.sql actualizado"
