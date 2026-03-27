import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCOP } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

export function ShoppingCartView() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <section className="flex flex-col items-center justify-center space-y-4 py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Inicia sesión para ver tu carrito</h2>
        <Button asChild>
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Carrito de Compras</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando carrito...</p>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center space-y-4 py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Tu carrito está vacío</h2>
        <p className="text-muted-foreground">Agrega productos para empezar a comprar</p>
        <Button asChild>
          <Link to="/products">Ver Productos</Link>
        </Button>
      </section>
    );
  }

  const handleIncrement = async (productId: number, currentQuantity: number) => {
    try {
      await updateQuantity(productId, currentQuantity + 1);
    } catch (error) {
      // Error already handled in context with toast
    }
  };

  const handleDecrement = async (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      try {
        await updateQuantity(productId, currentQuantity - 1);
      } catch (error) {
        // Error already handled in context with toast
      }
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeItem(productId);
    } catch (error) {
      // Error already handled in context with toast
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Carrito de Compras</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos ({cart.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex items-center gap-3">
                  {item.product_image_url && (
                    <img 
                      src={apiService.getImageUrl(item.product_image_url)} 
                      alt={item.product_name}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">{formatCOP(item.product_price)} cada uno</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDecrement(item.product_id, item.quantity)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleIncrement(item.product_id, item.quantity)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{formatCOP(item.subtotal)}</p>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleRemove(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCOP(cart.total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCOP(cart.total)}</span>
            </div>
            <Button asChild className="mt-3 w-full">
              <Link to="/purchase" state={{ fromCart: true }}>
                Continuar con la compra
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
