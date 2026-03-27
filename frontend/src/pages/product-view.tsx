import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCOP } from "@/lib/utils";
import { apiService, Product } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ProductView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        const data = await apiService.getProduct(parseInt(productId));
        setProduct(data);
      } catch (error) {
        toast.error("Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      navigate("/login");
      return;
    }

    if (!product) return;

    try {
      await addToCart({ product_id: product.id, quantity });
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <p className="text-center text-muted-foreground">Cargando producto...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Producto no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/products">Volver a productos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasDiscount = product.discount > 0;
  const imageUrl = apiService.getImageUrl(product.image_url);

  return (
    <section className="space-y-4">
      <Button asChild variant="ghost" className="pl-0">
        <Link to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative bg-gray-100">
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="h-full min-h-64 w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.png';
              }}
            />
            {hasDiscount && (
              <Badge className="absolute right-4 top-4 bg-red-500 text-white hover:bg-red-600">
                -{product.discount}%
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="secondary" className="text-lg">
                  Agotado
                </Badge>
              </div>
            )}
          </div>
          <div>
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                {product.quantity && (
                  <p className="text-sm text-muted-foreground">{product.quantity}</p>
                )}
                {product.category_name && (
                  <p className="text-sm text-muted-foreground">{product.category_name}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatCOP(product.total_price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCOP(product.price)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="text-sm">
                <span className="text-muted-foreground">Stock disponible: </span>
                <span className="font-medium">{product.stock} unidades</span>
              </div>

              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-12 text-center text-lg font-medium">{quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to cart button */}
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    </section>
  );
}
