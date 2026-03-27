from fastapi import APIRouter, HTTPException, status, Depends
from app.models import (
    Cart, CartItem, AddToCartRequest, UpdateCartItemRequest,
    Order, OrderItem, OrderListResponse, CheckoutResponse, UserResponse
)
from app.database import get_db_connection
from app.auth_utils import get_current_user
from decimal import Decimal

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def get_or_create_cart(user_id: int, connection):
    """Get or create a cart for the user"""
    cursor = connection.cursor(dictionary=True)
    
    # Try to get existing cart
    cursor.execute("SELECT id FROM carts WHERE user_id = %s", (user_id,))
    cart = cursor.fetchone()
    
    if cart:
        cart_id = cart["id"]
    else:
        # Create new cart
        cursor.execute(
            "INSERT INTO carts (user_id) VALUES (%s)",
            (user_id,)
        )
        connection.commit()
        cart_id = cursor.lastrowid
    
    cursor.close()
    return cart_id


@router.get("", response_model=Cart)
async def get_cart(current_user: UserResponse = Depends(get_current_user)):
    """Get current user's cart with all items"""
    
    try:
        with get_db_connection() as connection:
            cart_id = get_or_create_cart(current_user.id, connection)
            cursor = connection.cursor(dictionary=True)
            
            # Get cart items with product details
            cursor.execute(
                """
                SELECT 
                    ci.id,
                    ci.product_id,
                    p.name as product_name,
                    p.total_price as product_price,
                    p.image_url as product_image_url,
                    ci.quantity,
                    (p.total_price * ci.quantity) as subtotal
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = %s
                """,
                (cart_id,)
            )
            items_data = cursor.fetchall()
            cursor.close()
            
            # Calculate total
            items = [CartItem(**item) for item in items_data]
            total = sum(item.subtotal for item in items)
            
            return Cart(
                id=cart_id,
                user_id=current_user.id,
                items=items,
                total=total
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el carrito: {str(e)}"
        )


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    request: AddToCartRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Add a product to the cart or update quantity if it already exists"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Check if product exists and has enough stock
            cursor.execute(
                "SELECT id, name, stock FROM products WHERE id = %s",
                (request.product_id,)
            )
            product = cursor.fetchone()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado"
                )
            
            # Get or create cart
            cart_id = get_or_create_cart(current_user.id, connection)
            
            # Check if item already in cart
            cursor.execute(
                "SELECT id, quantity FROM cart_items WHERE cart_id = %s AND product_id = %s",
                (cart_id, request.product_id)
            )
            existing_item = cursor.fetchone()
            
            if existing_item:
                # Update quantity
                new_quantity = existing_item["quantity"] + request.quantity
                
                # Check stock
                if new_quantity > product["stock"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente. Disponible: {product['stock']}"
                    )
                
                cursor.execute(
                    "UPDATE cart_items SET quantity = %s WHERE id = %s",
                    (new_quantity, existing_item["id"])
                )
            else:
                # Check stock for new item
                if request.quantity > product["stock"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente. Disponible: {product['stock']}"
                    )
                
                # Add new item
                cursor.execute(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s, %s, %s)",
                    (cart_id, request.product_id, request.quantity)
                )
            
            connection.commit()
            cursor.close()
            
            return {"message": "Producto agregado al carrito", "product_name": product["name"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al agregar producto al carrito: {str(e)}"
        )


@router.put("/items/{product_id}")
async def update_cart_item(
    product_id: int,
    request: UpdateCartItemRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update quantity of a product in the cart"""
    
    if request.quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cantidad no puede ser negativa"
        )

    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)

            # Get cart
            cart_id = get_or_create_cart(current_user.id, connection)

            if request.quantity == 0:
                cursor.execute(
                    "DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s",
                    (cart_id, product_id)
                )

                if cursor.rowcount == 0:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Producto no encontrado en el carrito"
                    )

                connection.commit()
                cursor.close()
                return {"message": "Producto eliminado del carrito"}
            
            # Check product stock
            cursor.execute(
                "SELECT stock FROM products WHERE id = %s",
                (product_id,)
            )
            product = cursor.fetchone()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado"
                )
            
            if request.quantity > product["stock"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente. Disponible: {product['stock']}"
                )

            # Update item
            cursor.execute(
                "UPDATE cart_items SET quantity = %s WHERE cart_id = %s AND product_id = %s",
                (request.quantity, cart_id, product_id)
            )
            
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado en el carrito"
                )
            
            connection.commit()
            cursor.close()
            
            return {"message": "Cantidad actualizada"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar cantidad: {str(e)}"
        )


@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    product_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """Remove a product from the cart"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Get cart
            cart_id = get_or_create_cart(current_user.id, connection)
            
            # Delete item
            cursor.execute(
                "DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s",
                (cart_id, product_id)
            )
            
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado en el carrito"
                )
            
            connection.commit()
            cursor.close()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar producto: {str(e)}"
        )


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(current_user: UserResponse = Depends(get_current_user)):
    """Process cart checkout - create order and clear cart"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Get cart
            cart_id = get_or_create_cart(current_user.id, connection)
            
            # Get cart items
            cursor.execute(
                """
                SELECT 
                    ci.product_id,
                    p.name,
                    p.total_price,
                    p.stock,
                    ci.quantity
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = %s
                """,
                (cart_id,)
            )
            items = cursor.fetchall()
            
            if not items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El carrito está vacío"
                )
            
            # Validate stock for all items
            for item in items:
                if item["quantity"] > item["stock"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente para {item['name']}. Disponible: {item['stock']}"
                    )
            
            # Calculate total
            total = sum(Decimal(str(item["total_price"])) * item["quantity"] for item in items)
            
            # Create order
            cursor.execute(
                "INSERT INTO orders (user_id, total, status) VALUES (%s, %s, %s)",
                (current_user.id, float(total), "paid")
            )
            order_id = cursor.lastrowid
            
            # Create order items and update stock
            for item in items:
                cursor.execute(
                    """
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (order_id, item["product_id"], item["quantity"], item["total_price"])
                )
                
                # Reduce stock
                cursor.execute(
                    "UPDATE products SET stock = stock - %s WHERE id = %s",
                    (item["quantity"], item["product_id"])
                )
            
            # Clear cart
            cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart_id,))
            
            connection.commit()
            cursor.close()
            
            return CheckoutResponse(
                order_id=order_id,
                total=float(total),
                message="¡Compra realizada con éxito!"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la compra: {str(e)}"
        )


@router.get("/orders", response_model=OrderListResponse)
async def get_orders(current_user: UserResponse = Depends(get_current_user)):
    """Get all orders for the current user"""
    
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            
            # Get orders
            cursor.execute(
                """
                SELECT id, user_id, total, status, created_at
                FROM orders
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (current_user.id,)
            )
            orders_data = cursor.fetchall()
            
            orders = []
            for order_data in orders_data:
                # Get order items
                cursor.execute(
                    """
                    SELECT 
                        oi.id,
                        oi.product_id,
                        p.name as product_name,
                        oi.quantity,
                        oi.unit_price,
                        (oi.quantity * oi.unit_price) as subtotal
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = %s
                    """,
                    (order_data["id"],)
                )
                items_data = cursor.fetchall()
                items = [OrderItem(**item) for item in items_data]
                
                orders.append(Order(
                    id=order_data["id"],
                    user_id=order_data["user_id"],
                    total=float(order_data["total"]),
                    status=order_data["status"],
                    created_at=str(order_data["created_at"]),
                    items=items
                ))
            
            cursor.close()
            return OrderListResponse(orders=orders)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener órdenes: {str(e)}"
        )
