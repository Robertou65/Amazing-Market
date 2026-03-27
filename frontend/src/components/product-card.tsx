import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, apiService } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = apiService.getImageUrl(product.image_url);
  const hasDiscount = product.discount > 0;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      navigate("/login");
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 });
    } catch (error) {
      // Error already handled in context
    }
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.png';
            }}
          />
          
          {/* Badge de descuento */}
          {hasDiscount && (
            <Badge 
              className="absolute right-2 top-2 bg-red-500 text-white hover:bg-red-600"
            >
              -{product.discount}%
            </Badge>
          )}
          
          {/* Badge de sin stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="secondary" className="text-base">
                Agotado
              </Badge>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-2 p-4">
          {/* Nombre + Cantidad */}
          <h3 className="line-clamp-2 min-h-[3rem] text-sm font-medium leading-tight">
            {product.name}
            {product.quantity && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({product.quantity})
              </span>
            )}
          </h3>

          {/* Precio */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatCOP(product.total_price)}
            </span>
            
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCOP(product.price)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
