from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import init_db_schema
from app.routers import products, auth, cart


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db_schema()
    yield


app = FastAPI(
    title="Amazing Market API",
    description="API para el supermercado Amazing Market",
    version="1.0.0",
    lifespan=lifespan,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar la carpeta de assets como archivos estáticos
assets_path = Path(__file__).parent.parent / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

# Incluir routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)


@app.get("/")
async def root():
    return {
        "message": "Amazing Market API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
