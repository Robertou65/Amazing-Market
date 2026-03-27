#!/bin/bash
# Script para combinar schema y datos en un solo archivo
# Elimina las categorías duplicadas del archivo final

set -e

SCHEMA_FILE="database.sql"
DATA_FILE="database_data.sql"
BACKUP_FILE="database.sql.backup"
TEMP_FILE="database_combined.tmp"

echo "🔄 Combinando schema y datos..."

# Hacer backup del schema actual
cp "$SCHEMA_FILE" "$BACKUP_FILE"
echo "✅ Backup creado: $BACKUP_FILE"

# Crear archivo temporal con schema
cat "$SCHEMA_FILE" > "$TEMP_FILE"

echo "" >> "$TEMP_FILE"
echo "-- ============================================" >> "$TEMP_FILE"
echo "-- DATA: Exported from local database" >> "$TEMP_FILE"
echo "-- ============================================" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Filtrar los INSERTs de categorías que ya están en el schema
# Solo agregar datos de otras tablas (products, users, carts, etc.)
grep -v "^INSERT INTO \`categories\`" "$DATA_FILE" >> "$TEMP_FILE" || true

# Reemplazar el archivo original
mv "$TEMP_FILE" "$SCHEMA_FILE"

echo "✅ Archivos combinados exitosamente"
echo ""
echo "📝 Archivo final: $SCHEMA_FILE"
echo "   - Contiene: Schema + Datos de producción"
echo "   - Backup original: $BACKUP_FILE"
echo ""
echo "🚀 Ahora puedes hacer commit:"
echo "   git add backend/database.sql"
echo "   git commit -m 'feat: add production data to database schema'"
echo "   git push"
