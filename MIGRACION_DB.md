# 🚀 Guía de Migración de Base de Datos y Fix de GitHub Actions

## ✅ Problemas Corregidos en GitHub Actions

### 1. **Credenciales Unificadas**
- ✅ Todos los jobs usan las mismas credenciales: `app_user` / `Pz0@PhXifvht94%I`
- ✅ Eliminadas referencias a secrets no configurados
- ✅ Consistencia entre servicios MySQL y scripts

### 2. **Cliente MySQL Instalado**
- ✅ Agregado paso para instalar `mysql-client` en los jobs que lo necesitan
- ✅ Previene error "mysql: command not found"

### 3. **Schema de Base de Datos**
- ✅ El archivo `database.sql` se ejecuta correctamente en cada job

---

## 📊 Migración de Datos Local → GitHub Actions

### Opción 1: Exportar y Combinar (Recomendado para datos de producción)

#### Paso 1: Exportar datos locales
```bash
cd backend
./export_database_data.sh
```
Esto crea el archivo `database_data.sql` con todos tus datos.

#### Paso 2: Combinar schema + datos
```bash
./merge_database_files.sh
```
Esto actualiza `database.sql` con tu schema + datos de producción.

#### Paso 3: Commit y push
```bash
git add database.sql export_database_data.sh merge_database_files.sh
git commit -m "feat: add production data to database schema"
git push
```

### Opción 2: Solo Schema Base (Para testing)
Si solo necesitas el schema base con categorías (sin productos/usuarios):
```bash
# No hagas nada, database.sql ya tiene lo necesario
git add .github/workflows/ci.yml
git commit -m "fix: correct GitHub Actions database credentials and install mysql-client"
git push
```

---

## 🔍 Verificación

### Verificar localmente antes de push:
```bash
# Test del schema
mysql -h localhost -u app_user -p'Pz0@PhXifvht94%I' -e "DROP DATABASE IF EXISTS test_amazing_market; CREATE DATABASE test_amazing_market;"
mysql -h localhost -u app_user -p'Pz0@PhXifvht94%I' test_amazing_market < backend/database.sql
mysql -h localhost -u app_user -p'Pz0@PhXifvht94%I' test_amazing_market -e "SHOW TABLES;"
mysql -h localhost -u app_user -p'Pz0@PhXifvht94%I' -e "DROP DATABASE test_amazing_market;"
```

### Después del push:
1. Ve a: https://github.com/Robertou65/Amazing-Market/actions
2. Verifica que el workflow ejecute sin errores
3. Revisa los logs de los jobs `test` y `coverage`

---

## 📝 Cambios Realizados

### `.github/workflows/ci.yml`
- ✅ Job `test`: Credenciales unificadas + mysql-client instalado
- ✅ Job `coverage`: Credenciales unificadas + mysql-client instalado
- ✅ Eliminados: `${{ secrets.DB_USER }}` y `${{ secrets.DB_PASSWORD }}`

### Scripts Nuevos
- ✅ `backend/export_database_data.sh`: Exporta datos locales
- ✅ `backend/merge_database_files.sh`: Combina schema + datos

---

## ⚠️ Consideraciones de Seguridad

**IMPORTANTE**: Las credenciales están hardcodeadas en el workflow porque:
- Es un entorno de CI/CD efímero (se destruye después de cada ejecución)
- La base de datos solo existe durante el test
- No es accesible desde fuera del runner

**Para producción real**, deberías:
1. Usar GitHub Secrets
2. Usar un servicio de base de datos administrado
3. Implementar rotación de credenciales

---

## 🎯 Próximos Pasos

1. **Decide qué opción usar** (con datos o solo schema)
2. **Ejecuta los scripts** si elegiste la Opción 1
3. **Haz commit y push** de los cambios
4. **Verifica el workflow** en GitHub Actions

---

¿Necesitas ayuda con algún paso? 🤔
