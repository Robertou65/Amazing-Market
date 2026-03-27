#!/bin/bash

# Amazing Market - Script de inicio

echo "🚀 Iniciando Amazing Market..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Puerto $1 ya está en uso"
        return 1
    fi
    return 0
}

# Verificar puertos
check_port 8000
BACKEND_AVAILABLE=$?

check_port 5173
FRONTEND_AVAILABLE=$?

# Iniciar backend
if [ $BACKEND_AVAILABLE -eq 0 ]; then
    echo -e "${BLUE}📦 Iniciando Backend (FastAPI)...${NC}"
    cd backend
    source .venv/bin/activate
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend corriendo en http://localhost:8000${NC}"
    echo -e "${GREEN}   Documentación: http://localhost:8000/docs${NC}"
    cd ..
else
    echo "⏭️  Backend ya está corriendo"
fi

# Esperar un poco
sleep 2

# Iniciar frontend
if [ $FRONTEND_AVAILABLE -eq 0 ]; then
    echo ""
    echo -e "${BLUE}🎨 Iniciando Frontend (React + Vite)...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend corriendo en http://localhost:5173${NC}"
    cd ..
else
    echo "⏭️  Frontend ya está corriendo"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Amazing Market está listo!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"
echo ""

# Esperar por Ctrl+C
if [ $BACKEND_AVAILABLE -eq 0 ] || [ $FRONTEND_AVAILABLE -eq 0 ]; then
    trap "echo ''; echo 'Deteniendo servidores...'; [ ! -z '$BACKEND_PID' ] && kill $BACKEND_PID 2>/dev/null; [ ! -z '$FRONTEND_PID' ] && kill $FRONTEND_PID 2>/dev/null; exit" INT
    wait
fi
