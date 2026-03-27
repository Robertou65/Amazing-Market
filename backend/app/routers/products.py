from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models import Section, Category, Product, ProductListResponse
from app.database import get_db_connection, get_db_cursor
import math


router = APIRouter(prefix="/api", tags=["products"])


@router.get("/sections", response_model=list[Section])
async def get_sections():
    """Obtiene todas las secciones disponibles"""
    with get_db_connection() as conn:
        cursor = get_db_cursor(conn)
        cursor.execute("SELECT id, name FROM product_sections ORDER BY id")
        sections = cursor.fetchall()
        cursor.close()
        return sections


@router.get("/sections/{section_id}/categories", response_model=list[Category])
async def get_categories_by_section(section_id: int):
    """Obtiene las categorías de una sección específica"""
    with get_db_connection() as conn:
        cursor = get_db_cursor(conn)
        
        cursor.execute(
            """
            SELECT c.id, c.name, c.section_id, s.name as section_name
            FROM product_categories c
            JOIN product_sections s ON c.section_id = s.id
            WHERE c.section_id = %s
            ORDER BY c.id
            """,
            (section_id,)
        )
        categories = cursor.fetchall()
        cursor.close()
        
        if not categories:
            raise HTTPException(status_code=404, detail="No categories found for this section")
        
        return categories


@router.get("/categories", response_model=list[Category])
async def get_all_categories():
    """Obtiene todas las categorías"""
    with get_db_connection() as conn:
        cursor = get_db_cursor(conn)
        cursor.execute(
            """
            SELECT c.id, c.name, c.section_id, s.name as section_name
            FROM product_categories c
            JOIN product_sections s ON c.section_id = s.id
            ORDER BY c.section_id, c.id
            """
        )
        categories = cursor.fetchall()
        cursor.close()
        return categories


@router.get("/products", response_model=ProductListResponse)
async def get_products(
    section_id: Optional[int] = Query(None, description="ID de la sección"),
    category_id: Optional[int] = Query(None, description="ID de la categoría"),
    q: Optional[str] = Query(None, description="Búsqueda por nombre o número"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Productos por página")
):
    """
    Obtiene productos con filtros opcionales por sección o categoría.
    Incluye paginación.
    """
    with get_db_connection() as conn:
        cursor = get_db_cursor(conn)
        
        # Construir la consulta base
        base_query = """
            FROM products p
            JOIN product_categories c ON p.category_id = c.id
            JOIN product_sections s ON c.section_id = s.id
        """
        
        # Construir las condiciones WHERE
        where_conditions = []
        params = []
        
        if section_id is not None:
            where_conditions.append("s.id = %s")
            params.append(section_id)
        
        if category_id is not None:
            where_conditions.append("c.id = %s")
            params.append(category_id)

        if q is not None and q.strip() != "":
            q_stripped = q.strip()
            where_conditions.append(
                "(LOWER(p.name) LIKE %s OR CAST(p.number AS CHAR) LIKE %s)"
            )
            params.append(f"%{q_stripped.lower()}%")
            params.append(f"%{q_stripped}%")
        
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Contar total de productos
        count_query = f"SELECT COUNT(*) as total {base_query} {where_clause}"
        cursor.execute(count_query, tuple(params))
        total = cursor.fetchone()['total']
        
        # Calcular paginación
        total_pages = math.ceil(total / page_size)
        offset = (page - 1) * page_size
        
        # Obtener productos paginados
        products_query = f"""
            SELECT 
                p.id, p.name, p.number, p.category_id, p.quantity,
                p.discount, p.price, p.total_price, p.stock, p.image_url,
                c.name as category_name,
                s.name as section_name
            {base_query}
            {where_clause}
            ORDER BY p.id
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(products_query, tuple(params + [page_size, offset]))
        products = cursor.fetchall()
        cursor.close()
        
        return ProductListResponse(
            products=products,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Obtiene un producto por su ID"""
    with get_db_connection() as conn:
        cursor = get_db_cursor(conn)
        
        cursor.execute(
            """
            SELECT 
                p.id, p.name, p.number, p.category_id, p.quantity,
                p.discount, p.price, p.total_price, p.stock, p.image_url,
                c.name as category_name,
                s.name as section_name
            FROM products p
            JOIN product_categories c ON p.category_id = c.id
            JOIN product_sections s ON c.section_id = s.id
            WHERE p.id = %s
            """,
            (product_id,)
        )
        
        product = cursor.fetchone()
        cursor.close()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return product
