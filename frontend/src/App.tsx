import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AppShell } from "@/components/layout/app-shell";
import { CategoryView } from "@/pages/category-view";
import { LoginView } from "@/pages/login-view";
import { MainView } from "@/pages/main-view";
import { ProductView } from "@/pages/product-view";
import { ProductsView } from "@/pages/products-view";
import { ProfileView } from "@/pages/profile-view";
import { PurchaseView } from "@/pages/purchase-view";
import { RegisterView } from "@/pages/register-view";
import { ShoppingCartView } from "@/pages/shopping-cart-view";

function PurchaseGuard() {
  const location = useLocation();
  const fromCart = Boolean((location.state as { fromCart?: boolean } | null)?.fromCart);

  if (!fromCart) {
    return <Navigate to="/cart" replace />;
  }

  return <PurchaseView />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<MainView />} />
            <Route path="/categories/:categorySlug" element={<CategoryView />} />
            <Route path="/products" element={<ProductsView />} />
            <Route path="/products/:productId" element={<ProductView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/cart" element={<ShoppingCartView />} />
            <Route path="/purchase" element={<PurchaseGuard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
