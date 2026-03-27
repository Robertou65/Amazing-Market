import { ShoppingCart, Store, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export function AppShell() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      navigate("/products");
      return;
    }
    navigate(`/products?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-primary">
            <Store className="h-6 w-6" />
            <span className="text-lg font-semibold">Amazing Market</span>
          </Link>

          <form onSubmit={onSearchSubmit} className="flex-1">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" aria-label="Go to cart" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button asChild variant="ghost" size="sm" aria-label="Go to profile">
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
