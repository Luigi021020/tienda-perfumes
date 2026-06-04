// Carrito de compras usando Zustand
// Zustand guarda el estado del carrito en memoria
// mientras el cliente navega por la tienda

import { create } from "zustand";
import { CartItem } from "@/types";

type CarritoStore = {
  items: CartItem[];
  // Agregar producto al carrito
  agregar: (item: CartItem) => void;
  // Eliminar producto del carrito
  eliminar: (id: string) => void;
  // Cambiar cantidad de un producto
  cambiarCantidad: (id: string, cantidad: number) => void;
  // Vaciar el carrito completo
  vaciar: () => void;
  // Calcular el total
  total: () => number;
  // Contar items totales
  cantidadTotal: () => number;
};

export const useCarrito = create<CarritoStore>((set, get) => ({
  items: [],

  agregar: (nuevoItem) => {
    const items = get().items;
    // Verificar si el producto ya está en el carrito
    const existente = items.find((i) => i.id === nuevoItem.id);

    if (existente) {
      // Si ya existe, aumentar la cantidad
      set({
        items: items.map((i) =>
          i.id === nuevoItem.id
            ? { ...i, quantity: Math.min(i.quantity + nuevoItem.quantity, i.stock) }
            : i
        ),
      });
    } else {
      // Si no existe, agregarlo
      set({ items: [...items, nuevoItem] });
    }
  },

  eliminar: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  cambiarCantidad: (id, cantidad) => {
    if (cantidad < 1) return;
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.min(cantidad, i.stock) }
          : i
      ),
    });
  },

  vaciar: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  cantidadTotal: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));