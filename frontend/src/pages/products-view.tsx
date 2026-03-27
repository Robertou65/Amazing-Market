import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { apiService, Product } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const pageParam = searchParams.get("page");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const pageSize = 20; // Mostrar 20 productos por página

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getProducts({ 
          page: currentPage,
          page_size: pageSize 
        });
        setProducts(response.products);
        setTotalPages(response.total_pages);
        setTotal(response.total);
      } catch (err) {
        setError("Error al cargar productos");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filteredProducts = products.filter((product) => {
    if (!query) {
      return true;
    }
    return (
      product.name.toLowerCase().includes(query) ||
      (product.category_name?.toLowerCase() || "").includes(query)
    );
  });

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setSearchParams(query ? { q: query, page: newPage.toString() } : { page: newPage.toString() });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setSearchParams(query ? { q: query, page: newPage.toString() } : { page: newPage.toString() });
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-center text-muted-foreground py-12">Cargando productos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Card>
          <CardContent className="pt-6 text-sm text-red-500">{error}</CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-muted-foreground">
            {query ? `Resultados para "${query}"` : "Explora nuestro catálogo completo"}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {total} productos totales
        </Badge>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {!query && totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} de {total} productos
              </p>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No se encontraron productos{query ? ` con la búsqueda "${query}"` : ""}.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
