import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.key === item.key);
      if (!existing) return [...current, item];

      const max = Math.min(existing.max, item.max);
      return current.map((entry) => entry.key === item.key
        ? { ...entry, max, qty: Math.min(entry.qty + item.qty, max) }
        : entry);
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((key, delta) => {
    setItems((current) => current.map((item) => item.key === key
      ? { ...item, qty: Math.min(Math.max(item.qty + delta, 1), item.max) }
      : item));
  }, []);

  const removeItem = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);
  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const itemCount = items.reduce((total, item) => total + item.qty, 0);

  const value = useMemo(() => ({
    items, itemCount, isOpen, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart,
  }), [items, itemCount, isOpen, addItem, updateQuantity, removeItem, clearCart, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
