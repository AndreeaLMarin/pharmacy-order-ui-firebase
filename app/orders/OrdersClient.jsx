// app/orders/OrdersClient.jsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Package } from "lucide-react";

export default function OrdersClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [pharmacies, setPharmacies] = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      // Fetch pharmacies for names
      const pharmacySnap = await getDocs(collection(db, "pharmacies"));
      const pharmacyMap = {};
      pharmacySnap.docs.forEach((doc) => {
        pharmacyMap[doc.id] = doc.data().name;
      });
      setPharmacies(pharmacyMap);

      // Fetch this user's orders
      const ordersSnap = await getDocs(
        query(collection(db, "orders"), where("userId", "==", user.uid))
      );

      const ordersData = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by date newest first
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
      setFetching(false);
    }

    fetchOrders();
  }, [user]);

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "processing": return "bg-blue-100 text-blue-700";
      case "ready for pickup": return "bg-green-100 text-green-700";
      case "delivered": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold">My Orders</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your pharmacy orders
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => router.push("/pharmacies")}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90"
            >
              Browse Pharmacies
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border rounded-lg p-4 cursor-pointer hover:border-primary transition"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pharmacies[order.pharmacyId] || "Unknown Pharmacy"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold text-primary">£{order.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}