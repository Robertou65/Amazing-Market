import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCOP } from "@/lib/utils";
import { useState, useEffect } from "react";
import { apiService, Order } from "@/lib/api";
import { ChevronDown, ChevronUp, Package, Calendar, DollarSign } from "lucide-react";

export function ProfileView() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await apiService.getOrders();
        setOrders(response.orders);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const toggleOrder = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      'paid': 'bg-green-100 text-green-800 hover:bg-green-100',
      'shipped': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'delivered': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'cancelled': 'bg-red-100 text-red-800 hover:bg-red-100',
    };

    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'paid': 'Pagada',
      'shipped': 'Enviada',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada',
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Debes iniciar sesión para ver tu perfil</p>
        </CardContent>
      </Card>
    );
  }

  // Format birthdate
  const birthdate = new Date(user.birthdate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Tus datos personales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Nombre de usuario:</span> {user.username}</p>
            <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
            <p><span className="font-medium text-foreground">Teléfono:</span> {user.phone}</p>
            <p><span className="font-medium text-foreground">Fecha de nacimiento:</span> {birthdate}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Órdenes Recientes</CardTitle>
                <CardDescription>Historial de tus compras</CardDescription>
              </div>
              {orders.length > 0 && (
                <Badge variant="secondary">{orders.length} órdenes</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">Cargando órdenes...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No tienes órdenes aún</p>
                <p className="text-xs text-muted-foreground mt-1">Tus compras aparecerán aquí</p>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const orderDate = new Date(order.created_at).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={order.id} className="rounded-lg border overflow-hidden">
                    {/* Order Header - Clickable */}
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">Orden #{order.id}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {orderDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">{formatCOP(order.total)}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Order Details - Expandable */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 p-4 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Productos</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 bg-background rounded-md p-3 text-sm">
                              <div className="flex-1">
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Cantidad: {item.quantity} × {formatCOP(item.unit_price)}
                                </p>
                              </div>
                              <p className="font-semibold">{formatCOP(item.subtotal)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm font-medium">Total de la orden</span>
                          <span className="text-lg font-bold text-primary">{formatCOP(order.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
