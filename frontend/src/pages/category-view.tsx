import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product-grid";
import { getCategoryBySlug } from "@/data/categories";

export function CategoryView() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const prefilter = searchParams.get("prefilter") ?? undefined;

  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <ProductGrid key={prefilter ?? "all"} sectionId={1} sectionName={category.name} initialCategoryName={prefilter} />
    </section>
  );
}
