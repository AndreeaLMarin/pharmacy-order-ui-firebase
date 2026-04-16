// components/CartDrawer.jsx
"use client";

import { useCart } from "@/lib/cartContext";
import Cart from "./Cart";

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useCart();

  if (!cartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setCartOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl">
        <Cart onClose={() => setCartOpen(false)} />
      </div>
    </>
  );
}