# Amazing Market - Backend API

API RESTful construida con FastAPI para el supermercado Amazing Market.

## 🚀 Características

- **FastAPI**: Framework moderno y rápido para construir APIs
- **MySQL**: Base de datos relacional
- **CORS**: Configurado para desarrollo local
- **Static Files**: Servicio de imágenes desde `/assets`
- **Paginación**: Soporte completo para paginación de productos
- **Filtros**: Filtrado por sección y categoría

## 📦 Instalación

```bash
# Activar entorno virtual
source .venv/bin/activate

# Instalar dependencias con uv
uv pip install fastapi uvicorn mysql-connector-python python-dotenv pydantic pydantic-settings
```

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=tu_password
DB_NAME=amazing_market
DB_PORT=3306

BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Inicializar base de datos

Si ves errores 500 en `/api/products` del estilo "Table ... doesn't exist", inicializá el esquema ejecutando:

```bash
mysql -u app_user -p -D amazing_market < database.sql
```

En modo desarrollo, el backend también crea automáticamente las tablas `product_sections` y `product_categories` si faltan.

## 🏃 Ejecutar

```bash
# Desde la carpeta backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: http://localhost:8000

## 📚 Documentación API

Una vez iniciado el servidor, puedes acceder a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛣️ Endpoints Disponibles

### Secciones

**GET** `/api/sections`
- Obtiene todas las secciones disponibles
- Respuesta: `List[Section]`

### Categorías

**GET** `/api/sections/{section_id}/categories`
- Obtiene las categorías de una sección específica
- Parámetros: `section_id` (int)
- Respuesta: `List[Category]`

**GET** `/api/categories`
- Obtiene todas las categorías
- Respuesta: `List[Category]`

### Productos

**GET** `/api/products`
- Obtiene productos con filtros opcionales
- Query Params:
  - `section_id` (opcional): Filtrar por sección
  - `category_id` (opcional): Filtrar por categoría
  - `q` (opcional): Búsqueda por nombre o número
  - `page` (opcional, default=1): Número de página
  - `page_size` (opcional, default=20, max=100): Productos por página
- Respuesta: `ProductListResponse`

**GET** `/api/products/{product_id}`
- Obtiene un producto específico por ID
- Parámetros: `product_id` (int)
- Respuesta: `Product`

### Salud

**GET** `/health`
- Verifica el estado del servidor
- Respuesta: `{"status": "ok"}`

## 📊 Modelos de Datos

### Section
```json
{
  "id": 1,
  "name": "Wines and Spirits"
}
```

### Category
```json
{
  "id": 1,
  "name": "Wines",
  "section_id": 1,
  "section_name": "Wines and Spirits"
}
```

### Product
```json
{
  "id": 1,
  "name": "Diablo Purple Malbec",
  "number": 272341570726234,
  "category_id": 1,
  "quantity": "750 ml",
  "discount": 0,
  "price": 1065.0,
  "total_price": 1065.0,
  "stock": 0,
  "image_url": "/assets/diablo_purple_malbec_x.webp",
  "category_name": "Wines",
  "section_name": "Wines and Spirits"
}
```

### ProductListResponse
```json
{
  "products": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

## 🖼️ Imágenes

Las imágenes se sirven estáticamente desde `/assets`:

```
GET http://localhost:8000/assets/diablo_purple_malbec_x.webp
```

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # Aplicación principal FastAPI
│   ├── config.py         # Configuración y variables de entorno
│   ├── database.py       # Conexión a base de datos
│   ├── models.py         # Modelos Pydantic
│   └── routers/
│       ├── __init__.py
│       └── products.py   # Endpoints de productos
├── assets/               # Imágenes de productos
├── .env                  # Variables de entorno (no commitear)
├── pyproject.toml        # Dependencias del proyecto
└── README_API.md         # Este archivo
```

## 🧪 Cobertura de código

### Coverage.py (Python)

```bash
# Reporte en consola (incluye líneas faltantes)
pytest --cov=app --cov-report=term-missing

# HTML en backend/htmlcov/
pytest --cov=app --cov-report=html

# Alternativa “pura” coverage.py
python -m coverage run -m pytest
python -m coverage report -m
python -m coverage html
```

## 🔧 Desarrollo

### Agregar nuevos endpoints

1. Crear un nuevo archivo en `app/routers/`
2. Definir el router con `APIRouter()`
3. Importar y registrar en `app/main.py`:

```python
from app.routers import products, nuevo_modulo

app.include_router(products.router)
app.include_router(nuevo_modulo.router)
```

### Testing

Puedes probar los endpoints con curl:

```bash
# Obtener secciones
curl http://localhost:8000/api/sections

# Obtener productos de Wines & Spirits
curl "http://localhost:8000/api/products?section_id=1&page=1&page_size=10"

# Obtener categorías de una sección
curl http://localhost:8000/api/sections/1/categories
```

## 📝 Notas

- El pool de conexiones MySQL está configurado con 5 conexiones simultáneas
- El CORS está habilitado para `http://localhost:5173` (frontend)
- Las imágenes se sirven con cache automático
- La paginación está limitada a 100 productos por página máximo
