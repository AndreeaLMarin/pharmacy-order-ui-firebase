// lib/cartContext.jsx
"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  function addToCart(inventoryItem) {
    setCartItems((prev) => {
      // Check if cart has items from a different pharmacy
      if (prev.length > 0 && prev[0].pharmacyId !== inventoryItem.pharmacyId) {
        alert("You can only order from one pharmacy at a time. Please clear your cart first.");
        return prev;
      }

      const existing = prev.find((i) => i.inventoryId === inventoryItem.inventoryId);
      if (existing) {
        if (existing.quantity >= inventoryItem.quantityAvailable) return prev;
        return prev.map((i) =>
          i.inventoryId === inventoryItem.inventoryId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          inventoryId: inventoryItem.inventoryId,
          pharmacyId: inventoryItem.pharmacyId,
          product: inventoryItem.product,
          quantity: 1,
          availableQuantity: inventoryItem.quantityAvailable,
        },
      ];
    });
  }

  function updateQuantity(inventoryId, quantity) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.inventoryId === inventoryId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.availableQuantity)) }
          : item
      )
    );
  }

  function removeItem(inventoryId) {
    setCartItems((prev) => prev.filter((item) => item.inventoryId !== inventoryId));
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}