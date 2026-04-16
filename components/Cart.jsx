// components/Cart.jsx
"use client";

import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, writeBatch, increment, collection, addDoc, getDoc } from "firebase/firestore";

export default function Cart({ onClose }) {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  async function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (cartItems.length === 0) return;

    try {
      const batch = writeBatch(db);

      // Check stock and prepare inventory updates
      for (const item of cartItems) {
        const inventoryRef = doc(db, "inventory", item.inventoryId);
        const inventorySnap = await getDoc(inventoryRef);
        
        if (!inventorySnap.exists()) {
          alert(`${item.product.name} is no longer available.`);
          return;
        }

        const currentQty = inventorySnap.data().quantityAvailable;
        if (currentQty < item.quantity) {
          alert(`Not enough stock for ${item.product.name}. Only ${currentQty} left.`);
          return;
        }

        // Reduce inventory quantity
        batch.update(inventoryRef, {
          quantityAvailable: increment(-item.quantity),
        });
      }

      // Create the order
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        pharmacyId: cartItems[0].pharmacyId,
        status: "processing",
        total: total.toFixed(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Create order items
      for (const item of cartItems) {
        batch.set(doc(collection(db, "orderItems")), {
          orderId: orderRef.id,
          inventoryId: item.inventoryId,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          lineTotal: (parseFloat(item.product.price) * item.quantity).toFixed(2),
        });
      }

      await batch.commit();

      clearCart();
      onClose();
      router.push("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Shopping Cart</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <ShoppingBag className="h-16 w-16" />
          <p className="font-medium">Your cart is empty</p>
          <p className="text-sm">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Shopping Cart ({cartItems.length})</h2>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.map((item) => (
          <div key={item.inventoryId} className="flex gap-3 pb-4 border-b last:border-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">{item.product.category}</p>
              <p className="text-sm font-semibold text-primary mt-1">
                £{item.product.price}
              </p>
              <p className="text-xs text-muted-foreground">
                Available: {item.availableQuantity}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.inventoryId, item.quantity - 1)}
                  className="h-7 w-7 border rounded-md flex items-center justify-center hover:bg-secondary"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.inventoryId, item.quantity + 1)}
                  disabled={item.quantity >= item.availableQuantity}
                  className="h-7 w-7 border rounded-md flex items-center justify-center hover:bg-secondary disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => removeItem(item.inventoryId)}
                  className="ml-auto text-destructive hover:bg-destructive/10 p-1 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center justify-between font-semibold">
          <span>Total:</span>
          <span className="text-primary">£{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition"
        >
          Proceed to Checkout
        </button>
        <button
          onClick={clearCart}
          className="w-full border py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary transition"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}