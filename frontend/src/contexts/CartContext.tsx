import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, apiService, AddToCartRequest } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (request: AddToCartRequest) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  checkout: () => Promise<{ success: boolean; orderId?: number; message?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const cartData = await apiService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      // Don't show toast for initial load errors
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart when user logs in
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (request: AddToCartRequest) => {
    try {
      const response = await apiService.addToCart(request);
      toast.success(`${response.product_name} agregado al carrito`);
      await refreshCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar al carrito';
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await apiService.updateCartItem(productId, { quantity });
      await refreshCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar cantidad';
      toast.error(message);
      throw error;
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await apiService.removeFromCart(productId);
      toast.success('Producto eliminado del carrito');
      await refreshCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      toast.error(message);
      throw error;
    }
  };

  const checkout = async () => {
    try {
      const response = await apiService.checkout();
      await refreshCart(); // Refresh to show empty cart
      return { 
        success: true, 
        orderId: response.order_id,
        message: response.message 
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar la compra';
      return { success: false, message };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
