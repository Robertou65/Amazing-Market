const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Auth interfaces
export interface UserCreate {
  username: string;
  email: string;
  phone: string;
  password: string;
  birthdate: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  birthdate: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Product interfaces
export interface Section {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  section_id: number;
  section_name?: string;
}

export interface Product {
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

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Cart interfaces
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order interfaces
export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderListResponse {
  orders: Order[];
}

export interface CheckoutResponse {
  order_id: number;
  total: number;
  message: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Auth methods
  async register(userData: UserCreate): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al registrar usuario');
    }
    
    return response.json();
  }

  async login(credentials: UserLogin): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }
    
    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    
    return response.json();
  }

  // Product methods
  async getSections(): Promise<Section[]> {
    const response = await fetch(`${this.baseUrl}/api/sections`);
    if (!response.ok) throw new Error('Failed to fetch sections');
    return response.json();
  }

  async getCategoriesBySection(sectionId: number): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/sections/${sectionId}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async getProducts(params: {
    section_id?: number;
    category_id?: number;
    page?: number;
    page_size?: number;
  }): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.section_id) queryParams.append('section_id', params.section_id.toString());
    if (params.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const response = await fetch(`${this.baseUrl}/api/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async getProduct(productId: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/api/products/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }

  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return '/placeholder-product.png';
    return `${this.baseUrl}${imagePath}`;
  }

  // Cart methods
  async getCart(): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/api/cart`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener el carrito');
    }
    
    return response.json();
  }

  async addToCart(request: AddToCartRequest): Promise<{ message: string; product_name: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al agregar al carrito');
    }
    
    return response.json();
  }

  async updateCartItem(productId: number, request: UpdateCartItemRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/items/${productId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar cantidad');
    }
    
    return response.json();
  }

  async removeFromCart(productId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/cart/items/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar del carrito');
    }
  }

  async checkout(): Promise<CheckoutResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart/checkout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al procesar la compra');
    }
    
    return response.json();
  }

  async getOrders(): Promise<OrderListResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart/orders`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener órdenes');
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();
