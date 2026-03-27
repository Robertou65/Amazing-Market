# Amazing Market - Frontend

Aplicación web construida con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Características

- **React 19**: Framework UI moderno
- **TypeScript**: Tipado estático
- **Vite**: Build tool rápido
- **Tailwind CSS**: Estilos utilitarios
- **React Router**: Navegación
- **Shadcn/ui**: Componentes UI

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Cobertura de código

### Istanbul (JS/TS) vía Vitest

```bash
npm run test         # modo watch
npm run test:run      # una sola corrida
npm run test:coverage # genera cobertura (frontend/coverage/)
```

## 🏃 Ejecutar

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

El frontend estará disponible en: http://localhost:5173

## 🎨 Nuevos Componentes

### ProductCard

Tarjeta para mostrar un producto individual.

**Ubicación**: `src/components/product-card.tsx`

**Props**:
- `product: Product` - Datos del producto
- `onAddToCart?: (product: Product) => void` - Callback al agregar al carrito

**Características**:
- Imagen del producto con fallback
- Badge de descuento si aplica
- Badge de "Agotado" si no hay stock
- Nombre y cantidad del producto
- Precio con descuento tachado si aplica
- Botón de agregar al carrito
- Hover effects

**Ejemplo**:
```tsx
<ProductCard 
  product={product} 
  onAddToCart={(p) => console.log('Agregado:', p)}
/>
```

### ProductGrid

Grid responsive de productos con filtros y paginación.

**Ubicación**: `src/components/product-grid.tsx`

**Props**:
- `sectionId: number` - ID de la sección a mostrar
- `sectionName: string` - Nombre de la sección
- `onAddToCart?: (product: Product) => void` - Callback al agregar al carrito

**Características**:
- Grid responsive (1-5 columnas según tamaño de pantalla)
- Filtros por categoría
- Paginación automática
- Estados de carga y error
- Contador de productos totales
- Botones de navegación entre páginas

**Ejemplo**:
```tsx
<ProductGrid 
  sectionId={1} 
  sectionName="Wines and Spirits"
  onAddToCart={handleAddToCart}
/>
```

## 🔌 API Service

### Ubicación
`src/lib/api.ts`

### Configuración
El servicio lee la URL base de la API desde `VITE_API_URL` o usa `http://localhost:8000` por defecto.

### Métodos disponibles

```typescript
// Obtener secciones
const sections = await apiService.getSections();

// Obtener categorías por sección
const categories = await apiService.getCategoriesBySection(1);

// Obtener todas las categorías
const allCategories = await apiService.getAllCategories();

// Obtener productos con filtros
const response = await apiService.getProducts({
  section_id: 1,
  category_id: 2,
  page: 1,
  page_size: 20
});

// Obtener un producto específico
const product = await apiService.getProduct(123);

// Obtener URL completa de imagen
const imageUrl = apiService.getImageUrl(product.image_url);
```

### Tipos TypeScript

```typescript
interface Section {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  section_id: number;
  section_name?: string;
}

interface Product {
  id: number;
  name: string;
  number: number;
  category_id: number;
  quantity: string;
  discount: number;
  price: number;
  total_price: number;
  stock: number;
  image_url: string | null;
  category_name?: string;
  section_name?: string;
}

interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
```

## 🎯 Uso - Wines and Spirits

La sección "Wines and Spirits" ahora muestra productos dinámicamente desde la base de datos.

### CategoryView actualizado

**Ubicación**: `src/pages/category-view.tsx`

La vista de categorías ahora detecta si es "Wines and Spirits" y muestra el componente `ProductGrid` en lugar de las subcategorías estáticas.

**Flujo**:
1. Usuario hace click en "Wines and Spirits" desde la página principal
2. Se navega a `/categories/wines_spirits`
3. Se renderiza `ProductGrid` con `sectionId=1`
4. Se cargan automáticamente las categorías (Wines, Whiskey, Beer, etc.)
5. Se muestran los productos con paginación
6. Usuario puede filtrar por categoría
7. Usuario puede agregar productos al carrito

## 📱 Responsive Design

El grid se adapta automáticamente:
- **Mobile (< 640px)**: 1 columna
- **Tablet (640px - 768px)**: 2 columnas
- **Desktop (768px - 1024px)**: 3 columnas
- **Large (1024px - 1280px)**: 4 columnas
- **XL (> 1280px)**: 5 columnas

## 🛒 Carrito de Compras (TODO)

Actualmente, el botón "Agregar al carrito" muestra un alert. Para implementar:

1. Crear un Context para el carrito
2. Almacenar productos en localStorage
3. Mostrar contador en el header
4. Crear vista del carrito completa

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── app-shell.tsx
│   │   ├── ui/              # Componentes Shadcn
│   │   ├── product-card.tsx  # ✨ NUEVO
│   │   └── product-grid.tsx  # ✨ NUEVO
│   ├── lib/
│   │   ├── api.ts           # ✨ NUEVO - Servicio API
│   │   └── utils.ts
│   ├── pages/
│   │   ├── category-view.tsx  # ✨ ACTUALIZADO
│   │   └── ...
│   ├── data/
│   │   └── categories.ts
│   ├── App.tsx
│   └── main.tsx
├── .env                     # ✨ NUEVO
├── .env.example            # ✨ NUEVO
└── package.json
```

## 🎨 Estilos y Temas

Los componentes usan las clases de Tailwind y variables CSS de Shadcn/ui:

- `text-primary`: Color primario
- `text-muted-foreground`: Texto secundario
- `border`: Bordes por defecto
- `hover:shadow-lg`: Efectos hover

## 🔧 Desarrollo

### Agregar nuevas secciones

Para agregar productos a otras secciones:

1. Actualizar `category-view.tsx` para detectar el slug de la sección
2. Obtener el `sectionId` correcto de la base de datos
3. Renderizar `ProductGrid` con el `sectionId` apropiado

Ejemplo para Pantry:
```tsx
const isPantry = category.slug === "pantry";

{isPantry && (
  <ProductGrid 
    sectionId={2} 
    sectionName={category.name}
    onAddToCart={handleAddToCart}
  />
)}
```

### Personalizar el grid

Puedes cambiar el número de productos por página editando `ProductGrid`:

```tsx
const pageSize = 20; // Cambiar a 12, 24, etc.
```

## 🐛 Troubleshooting

**Error: Failed to fetch**
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa que `.env` tenga `VITE_API_URL` correcto
- Verifica CORS en el backend

**Imágenes no se cargan**
- Verifica que las rutas en `image_url` existan en `/backend/assets`
- El backend debe servir archivos estáticos correctamente
- Revisa la consola del navegador para errores 404

**TypeScript errors**
- Ejecuta `npm run build` para verificar errores de tipado
- Asegúrate de tener todas las dependencias instaladas

## 📝 Notas

- Las imágenes se sirven desde el backend
- Hay fallback a placeholder si falta la imagen
- Los filtros resetean la paginación a la página 1
- El estado de carga evita clicks múltiples
