import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { SubcategoryRectGrid } from "@/components/subcategory-rect-grid";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";
import { isLoggedIn } from "@/lib/auth";

export function MainView() {
  const loggedIn = isLoggedIn();
  const winesAndSpirits = categories[0];

  return (
    <div className="space-y-6">
      {!loggedIn && (
        <section className="rounded-lg border bg-card p-8">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido a Amazing Market</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Tu supermercado en línea. Navega por nuestros productos, agrega al carrito y realiza tus compras de manera fácil y rápida.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/products">
                Explorar Productos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </section>
      )}

      {loggedIn && (
        <section className="rounded-lg border bg-card p-8">
          <h1 className="text-3xl font-bold tracking-tight">¡Hola de nuevo!</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Explora nuestro catálogo completo de productos y encuentra todo lo que necesitas.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Todos los Productos
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">{winesAndSpirits.name}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to={`/categories/${winesAndSpirits.slug}`}>
              Ver productos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <SubcategoryRectGrid
          items={winesAndSpirits.subcategories.map((subcategory) => ({
            ...subcategory,
            to: `/categories/${winesAndSpirits.slug}?prefilter=${encodeURIComponent(subcategory.name)}`,
          }))}
        />
      </section>
    </div>
  );
}
