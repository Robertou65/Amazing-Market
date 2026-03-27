from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class Section(BaseModel):
    id: int
    name: str


class Category(BaseModel):
    id: int
    name: str
    section_id: int
    section_name: Optional[str] = None


class Product(BaseModel):
    id: int
    name: str
    number: int
    category_id: int
    quantity: str
    discount: int
    price: float
    total_price: float
    stock: int
    image_url: Optional[str] = None
    category_name: Optional[str] = None
    section_name: Optional[str] = None


class ProductListResponse(BaseModel):
    products: list[Product]
    total: int
    page: int
    page_size: int
    total_pages: int


# User Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    phone: str
    password: str
    birthdate: date


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    birthdate: date


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Cart Models
class CartItem(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_image_url: Optional[str] = None
    quantity: int
    subtotal: float


class Cart(BaseModel):
    id: int
    user_id: int
    items: list[CartItem]
    total: float


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1


class UpdateCartItemRequest(BaseModel):
    quantity: int


# Order Models
class OrderItem(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float


class Order(BaseModel):
    id: int
    user_id: int
    total: float
    status: str
    created_at: str
    items: list[OrderItem]


class OrderListResponse(BaseModel):
    orders: list[Order]


class CheckoutResponse(BaseModel):
    order_id: int
    total: float
    message: str
