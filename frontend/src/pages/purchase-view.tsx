import { BadgeCheck, CheckCircle2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCOP } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { apiService } from "@/lib/api";

export function PurchaseView() {
  const navigate = useNavigate();
  const { cart, checkout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tu carrito está vacío</CardTitle>
            <CardDescription>Agrega productos antes de continuar con la compra</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/products")}>
              Ver Productos
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const handleConfirmPurchase = async () => {
    try {
      setIsProcessing(true);
      const result = await checkout();
      
      if (result.success && result.orderId) {
        setOrderSuccess(true);
        setOrderId(result.orderId);
      } else {
        // Error already shown in toast
      }
    } catch (error) {
      // Error already handled
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Compra realizada con éxito!</CardTitle>
            <CardDescription>
              Tu orden #{orderId} ha sido procesada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Gracias por tu compra. Pronto recibirás un correo con los detalles de tu pedido.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate("/products")}>
                Seguir Comprando
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Confirmar Compra</h1>
      
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la orden</CardTitle>
          <CardDescription>Revisa los productos antes de confirmar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="flex items-center gap-3">
                  {item.product_image_url && (
                    <img 
                      src={apiService.getImageUrl(item.product_image_url)} 
                      alt={item.product_name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCOP(item.product_price)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium">{formatCOP(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatCOP(cart.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Método de pago</CardTitle>
          <CardDescription>
            Este es un demo. No se requiere información de pago real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed p-4 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              En una aplicación real, aquí se integraría un método de pago.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <Button 
        onClick={handleConfirmPurchase}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        <BadgeCheck className="mr-2 h-5 w-5" />
        {isProcessing ? "Procesando..." : "Confirmar compra"}
      </Button>
    </section>
  );
}
