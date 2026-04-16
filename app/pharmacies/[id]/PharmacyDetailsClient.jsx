// app/pharmacies/[id]/PharmacyDetailsClient.jsx
"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCart } from "@/lib/cartContext";
import { ArrowLeft, MapPin, Phone, Clock, Star } from "lucide-react";

export default function PharmacyDetailsClient({ pharmacy, inventoryItems }) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartCount} />

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/pharmacies")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pharmacies
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <h1 className="text-3xl font-semibold mb-3">{pharmacy.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{pharmacy.rating}</span>
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  pharmacy.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {pharmacy.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{pharmacy.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{pharmacy.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Available Products</h2>
        {inventoryItems.length === 0 ? (
          <p className="text-muted-foreground">No products available at this pharmacy.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventoryItems.map((item) => (
              <div key={item.inventoryId} className="bg-card border rounded-lg p-4">
                <h3 className="font-medium text-sm mb-1">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{item.product.category}</p>
                <p className="text-xs text-muted-foreground mb-2">{item.product.dosage}</p>
                <p className="text-sm font-semibold text-primary mb-2">£{item.product.price}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  In stock: {item.quantityAvailable}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.quantityAvailable < 1}
                  className="w-full bg-primary text-primary-foreground py-1.5 rounded-md text-xs hover:opacity-90 transition disabled:opacity-50"
                >
                  {item.quantityAvailable < 1 ? "Out of stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}