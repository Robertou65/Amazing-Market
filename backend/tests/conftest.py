import sqlite3
from contextlib import contextmanager
from typing import Iterator

import pytest
from mysql.connector import IntegrityError
from starlette.testclient import TestClient

import app.auth_utils as auth_utils
import app.database as database
import app.main as main_module
import app.routers.auth as auth_router
import app.routers.cart as cart_router
import app.routers.products as products_router


def _mysql_to_sqlite(query: str) -> str:
    # Basic placeholder conversion for mysql-connector style queries.
    return query.replace("%s", "?")


class SQLiteCursor:
    def __init__(self, cursor: sqlite3.Cursor):
        self._cursor = cursor

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def execute(self, query: str, params=None):
        try:
            if params is None:
                return self._cursor.execute(_mysql_to_sqlite(query))
            return self._cursor.execute(_mysql_to_sqlite(query), params)
        except sqlite3.IntegrityError as e:
            # The auth router expects mysql.connector.IntegrityError
            raise IntegrityError(str(e))

    def executemany(self, query: str, seq_of_params):
        return self._cursor.executemany(_mysql_to_sqlite(query), seq_of_params)

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        if isinstance(row, sqlite3.Row):
            return dict(row)
        return row

    def fetchall(self):
        rows = self._cursor.fetchall()
        if rows and isinstance(rows[0], sqlite3.Row):
            return [dict(r) for r in rows]
        return rows

    def close(self):
        self._cursor.close()


class SQLiteConnection:
    def __init__(self, conn: sqlite3.Connection):
        self._conn = conn

    def cursor(self, dictionary: bool = False):
        # dictionary flag is ignored because we always return dict-like rows.
        return SQLiteCursor(self._conn.cursor())

    def commit(self):
        return self._conn.commit()

    def close(self):
        return self._conn.close()


def _init_schema(conn: sqlite3.Connection) -> None:
    cur = conn.cursor()

    # Core catalog
    cur.execute(
        """
        CREATE TABLE product_sections (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE product_categories (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          section_id INTEGER NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE products (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          number INTEGER NOT NULL UNIQUE,
          category_id INTEGER NOT NULL,
          quantity TEXT NOT NULL,
          discount INTEGER DEFAULT 0,
          price REAL NOT NULL,
          total_price REAL NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          image_url TEXT
        )
        """
    )

    # Auth + cart
    cur.execute(
        """
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          birthdate TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE carts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cart_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL
        )
        """
    )

    # Seed minimal data
    cur.execute("INSERT INTO product_sections (id, name) VALUES (1, 'Wines and Spirits')")
    categories = [
        (1, "Wines"),
        (2, "Whiskey"),
        (3, "Beer"),
        (4, "Tequila"),
        (5, "Vodka"),
        (6, "Gin"),
        (7, "Cognac - Brandy"),
        (8, "Rum"),
        (9, "Schnapps"),
    ]
    cur.executemany(
        "INSERT INTO product_categories (id, name, section_id) VALUES (?, ?, 1)",
        categories,
    )
    products = [
        (1, "Red Wine", 1001, 1, "750ml", 0, 50000.0, 50000.0, 10, "/assets/products/red_wine.webp"),
        (2, "Irish Whiskey", 1002, 2, "700ml", 10, 120000.0, 108000.0, 5, "/assets/products/whiskey.webp"),
        (3, "Craft Beer", 1003, 3, "330ml", 0, 8000.0, 8000.0, 0, None),
    ]
    cur.executemany(
        """
        INSERT INTO products (id, name, number, category_id, quantity, discount, price, total_price, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        products,
    )

    conn.commit()


@pytest.fixture()
def sqlite_db() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    _init_schema(conn)
    return conn


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch, sqlite_db: sqlite3.Connection) -> Iterator[TestClient]:
    # Avoid running MySQL schema init during startup.
    monkeypatch.setattr(main_module, "init_db_schema", lambda: None)

    wrapped = SQLiteConnection(sqlite_db)

    @contextmanager
    def _get_db_connection():
        yield wrapped

    def _get_db_cursor(conn):
        return conn.cursor(dictionary=True)

    # Patch DB access points used across modules
    monkeypatch.setattr(database, "get_db_connection", _get_db_connection)
    monkeypatch.setattr(database, "get_db_cursor", _get_db_cursor)

    monkeypatch.setattr(products_router, "get_db_connection", _get_db_connection)
    monkeypatch.setattr(products_router, "get_db_cursor", _get_db_cursor)

    monkeypatch.setattr(auth_router, "get_db_connection", _get_db_connection)
    monkeypatch.setattr(cart_router, "get_db_connection", _get_db_connection)
    monkeypatch.setattr(auth_utils, "get_db_connection", _get_db_connection)

    with TestClient(main_module.app) as c:
        yield c


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
