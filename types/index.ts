// Aquí definimos los tipos de datos que usaremos
// en todo el proyecto para tener consistencia

// Tipo para los productos de la tienda
export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  active: boolean;
  featured: boolean;
  sold: number;
  category: {
    id: string;
    name: string;
  };
};

// Tipo para cada artículo dentro del carrito
export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

// Tipo para el carrito completo
export type Cart = {
  items: CartItem[];
  total: number;
};

// Tipo para los pedidos
export type Order = {
  id: string;
  orderNumber: string;
  status: "SOLICITADO" | "COMPLETADO" | "CANCELADO";
  total: number;
  createdAt: Date;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
      brand: string;
    };
  }[];
};