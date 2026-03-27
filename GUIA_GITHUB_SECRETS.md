# 🔐 Guía: Configurar GitHub Secrets para CI/CD

## 📋 ¿Por qué usar Secrets?

✅ **Ventajas:**
- Las credenciales NO aparecen en el código
- Puedes usar contraseñas diferentes para CI y producción
- GitHub oculta los secrets en los logs
- Puedes cambiar las credenciales sin modificar el código

---

## 🚀 Paso a Paso: Configurar Secrets en GitHub

### 1️⃣ Ve a la configuración de tu repositorio

```
https://github.com/Robertou65/Amazing-Market/settings/secrets/actions
```

O manualmente:
1. Ve a tu repositorio: https://github.com/Robertou65/Amazing-Market
2. Haz clic en **Settings** (⚙️)
3. En el menú izquierdo, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en el botón verde **New repository secret**

---

### 2️⃣ Crea los siguientes secrets (uno por uno)

#### Secret #1: `MYSQL_ROOT_PASSWORD`
```
Name:  MYSQL_ROOT_PASSWORD
Value: MyS3cur3R00tP@ssw0rd!
```
**Nota:** Esta es para el usuario root de MySQL en CI. Usa una contraseña fuerte pero diferente a tu local.

---

#### Secret #2: `MYSQL_USER`
```
Name:  MYSQL_USER
Value: ci_test_user
```
**Nota:** Un nombre de usuario SOLO para CI, diferente a tu usuario local `app_user`.

---

#### Secret #3: `MYSQL_PASSWORD`
```
Name:  MYSQL_PASSWORD
Value: CI_T3st_P@ssw0rd_2026!
```
**Nota:** Una contraseña DIFERENTE a `Pz0@PhXifvht94%I`. Esta solo se usa en GitHub Actions.

---

### 3️⃣ Verificación

Después de crear los 3 secrets, deberías ver algo así:

```
Repository secrets
───────────────────────────────────────
MYSQL_ROOT_PASSWORD    Updated now
MYSQL_USER             Updated now  
MYSQL_PASSWORD         Updated now
```

---

## ✅ Qué cambió en tu proyecto

### Antes (INSEGURO):
```yaml
env:
  MYSQL_USER: app_user
  MYSQL_PASSWORD: Pz0@PhXifvht94%I  # ⚠️ Tu contraseña local expuesta
```

### Ahora (SEGURO):
```yaml
env:
  MYSQL_USER: ${{ secrets.MYSQL_USER }}
  MYSQL_PASSWORD: ${{ secrets.MYSQL_PASSWORD }}  # ✅ Oculta y diferente
```

---

## 🎯 Valores Recomendados para los Secrets

Puedes usar estos valores (son seguros porque solo existen en GitHub Actions):

| Secret               | Valor Recomendado          | ¿Por qué?                           |
|---------------------|----------------------------|-------------------------------------|
| MYSQL_ROOT_PASSWORD | `GH_Root_2026!Secure`      | Password para root en CI            |
| MYSQL_USER          | `ci_test_user`             | Usuario diferente al local          |
| MYSQL_PASSWORD      | `CI_Test_Pass_2026!`       | Password solo para CI, no local     |

**Importante:** Estas contraseñas son DIFERENTES a tus credenciales locales `app_user` / `Pz0@PhXifvht94%I`.

---

## 🔒 Seguridad: Comparación

### Tu Setup Local (en tu máquina):
```env
# backend/.env (NO se sube a Git)
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=Pz0@PhXifvht94%I  # ✅ Solo en tu .env local
```

### Setup de CI (en GitHub Actions):
```yaml
# Usa secrets diferentes
MYSQL_USER: ci_test_user        # ✅ Diferente
MYSQL_PASSWORD: CI_Test_Pass_2026!  # ✅ Diferente
```

**Resultado:** Si alguien compromete tu repositorio, NO pueden acceder a tu base de datos local.

---

## 📝 Checklist Final

Antes de hacer push, verifica:

- [ ] Creaste `MYSQL_ROOT_PASSWORD` en GitHub Secrets
- [ ] Creaste `MYSQL_USER` en GitHub Secrets  
- [ ] Creaste `MYSQL_PASSWORD` en GitHub Secrets
- [ ] Los valores son DIFERENTES a tus credenciales locales
- [ ] Tu archivo `.env` local NO está en Git (verifica con `git status`)
- [ ] El archivo `.gitignore` incluye `.env`

---

## 🚀 Siguiente Paso: Hacer Commit y Push

```bash
git add .github/workflows/ci.yml
git add GUIA_GITHUB_SECRETS.md
git commit -m "security: use GitHub Secrets for MySQL credentials in CI"
git push
```

Después del push:
1. Ve a: https://github.com/Robertou65/Amazing-Market/actions
2. El workflow se ejecutará automáticamente
3. Verifica que los jobs pasen ✅

---

## ❓ FAQ

**P: ¿Qué pasa si olvido crear los secrets?**
R: El workflow fallará con un error de autenticación MySQL.

**P: ¿Puedo ver los valores de los secrets después de crearlos?**
R: No, GitHub no muestra los valores. Solo puedes actualizarlos.

**P: ¿Necesito cambiar mi contraseña local?**
R: No, tu `.env` local sigue igual. Solo usa contraseñas diferentes en GitHub.

**P: ¿Y si quiero volver a las credenciales hardcoded?**
R: No recomendado, pero puedes restaurar el commit anterior.

---

## 🎉 Resultado Final

✅ Tus credenciales locales están protegidas  
✅ GitHub Actions usa credenciales separadas  
✅ Los secrets están ocultos en los logs  
✅ Puedes rotar contraseñas sin tocar el código  

**¡Tu proyecto ahora es más seguro!** 🔒
