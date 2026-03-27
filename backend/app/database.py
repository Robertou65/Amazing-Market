import logging
from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling

from app.config import settings

logger = logging.getLogger("uvicorn.error")


db_pool = pooling.MySQLConnectionPool(
    pool_name="amazing_market_pool",
    pool_size=5,
    host=settings.DB_HOST,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
    port=settings.DB_PORT,
)


@contextmanager
def get_db_connection():
    """Context manager para obtener una conexión de la base de datos"""
    conn = db_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()


def get_db_cursor(conn):
    """Obtiene un cursor con diccionario como resultado"""
    return conn.cursor(dictionary=True)


def init_db_schema() -> None:
    """Crea tablas faltantes requeridas por la API (modo dev) y migra datos básicos.

    Evita el error 500 cuando faltan `product_sections` / `product_categories`.
    Es idempotente (usa CREATE TABLE IF NOT EXISTS / INSERT IGNORE).
    """

    def table_exists(cursor, name: str) -> bool:
        cursor.execute("SHOW TABLES LIKE %s", (name,))
        return cursor.fetchone() is not None

    with get_db_connection() as conn:
        cur = conn.cursor()

        # Tablas que usa el router de productos
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS product_sections (
              id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL
            )
            """
        )
        # Nota: no agregamos FOREIGN KEY porque el usuario MySQL de dev puede no tener privilegio REFERENCES.
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS product_categories (
              id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              name       VARCHAR(100) NOT NULL,
              section_id INT UNSIGNED NOT NULL,
              INDEX (section_id)
            )
            """
        )

        # Seed mínimo para que la API funcione
        cur.execute(
            "INSERT IGNORE INTO product_sections (id, name) VALUES (1, %s)",
            ("Wines and Spirits",),
        )

        # Si existen categorías legacy, migrarlas a product_categories (sección 1)
        cur.execute("SELECT COUNT(*) FROM product_categories")
        (pc_count,) = cur.fetchone()
        if pc_count == 0 and table_exists(cur, "categories"):
            cur.execute(
                """
                INSERT IGNORE INTO product_categories (id, name, section_id)
                SELECT id, name, 1 FROM categories
                """
            )

        # Garantizar que cualquier category_id referenciado por products exista en product_categories
        if table_exists(cur, "products"):
            cur.execute(
                """
                INSERT IGNORE INTO product_categories (id, name, section_id)
                SELECT DISTINCT p.category_id, CONCAT('Category ', p.category_id), 1
                FROM products p
                LEFT JOIN product_categories pc ON pc.id = p.category_id
                WHERE pc.id IS NULL
                """
            )

        conn.commit()
        logger.info("DB schema check complete (product_sections/product_categories)")
