// app/orders/[id]/OrderDetailsClient.jsx
"use client";

import { useEffect, useState } from "react";
import {
  doc, getDoc, getDocs, collection,
  query, where, updateDoc, increment, writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { ArrowLeft, Calendar, Package, DollarSign } from "lucide-react";

export default function OrderDetailsClient({ orderId }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [fetching, setFetching] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    fetchOrderDetails();
  }, [user, orderId]);

  async function fetchOrderDetails() {
    // Fetch order
    const orderSnap = await getDoc(doc(db, "orders", orderId));
    if (!orderSnap.exists()) {
      router.push("/orders");
      return;
    }
    const orderData = { id: orderSnap.id, ...orderSnap.data() };
    setOrder(orderData);

    // Fetch pharmacy name
    const pharmacySnap = await getDoc(doc(db, "pharmacies", orderData.pharmacyId));
    if (pharmacySnap.exists()) setPharmacyName(pharmacySnap.data().name);

    // Fetch order items
    const itemsSnap = await getDocs(
      query(collection(db, "orderItems"), where("orderId", "==", orderId))
    );
    setOrderItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setFetching(false);
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);

    try {
      const batch = writeBatch(db);

      // Restore inventory quantities
      for (const item of orderItems) {
        const inventoryRef = doc(db, "inventory", item.inventoryId);
        batch.update(inventoryRef, {
          quantityAvailable: increment(item.quantity),
        });
      }

      // Update order status
      batch.update(doc(db, "orders", orderId), {
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();

      // Refresh order data
      await fetchOrderDetails();
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleReorder() {
    // Add items back to cart by navigating to the pharmacy
    router.push(`/pharmacies/${order.pharmacyId}`);
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "processing": return "bg-blue-100 text-blue-700";
      case "ready for pickup": return "bg-green-100 text-green-700";
      case "delivered": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  const canCancel = order && ["processing", "ready for pickup"].includes(
    order.status?.toLowerCase()
  );

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold">
              Order #{orderId.slice(-8).toUpperCase()}
            </h1>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{pharmacyName}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg p-6">

          {/* Order summary */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{orderItems.length} item(s)</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>£{order.total}</span>
            </div>
          </div>

          {/* Order items */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Unit: £{item.unitPrice}
                    </p>
                    <p className="font-semibold text-primary">
                      £{item.lineTotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 mt-4 flex gap-3 flex-wrap">
            <button
              onClick={handleReorder}
              className="border px-4 py-2 rounded-md text-sm hover:bg-secondary transition"
            >
              Reorder
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}