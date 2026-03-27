import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, Category, apiService } from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGridProps {
  sectionId: number;
  sectionName: string;
  initialCategoryName?: string;
}

export function ProductGrid({ sectionId, sectionName, initialCategoryName }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await apiService.getCategoriesBySection(sectionId);
        setCategories(cats);

        if (initialCategoryName) {
          const normalized = initialCategoryName.trim().toLowerCase();
          const match = cats.find((cat) => cat.name.trim().toLowerCase() === normalized);
          if (match) {
            setSelectedCategoryId(match.id);
            setCurrentPage(1);
          }
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadCategories();
  }, [sectionId, initialCategoryName]);

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getProducts({
          section_id: sectionId,
          category_id: selectedCategoryId || undefined,
          page: currentPage,
          page_size: pageSize,
        });

        setProducts(response.products);
        setTotalPages(response.total_pages);
        setTotal(response.total);
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sectionId, selectedCategoryId, currentPage]);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Reset a la primera página
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{sectionName}</h1>
        <Badge variant="secondary" className="text-sm">
          {total} productos
        </Badge>
      </div>

      {/* Filtro de categorías */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryFilter(null)}
        >
          Todas
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
          {error}
        </div>
      )}

      {/* Grid de productos */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron productos
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
