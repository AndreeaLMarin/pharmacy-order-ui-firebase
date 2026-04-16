// app/products/ProductsClient.jsx
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useCart } from "@/lib/cartContext";
import { Search } from "lucide-react";

export default function ProductsClient({ inventoryItems }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();

  const categories = [
    "All",
    ...Array.from(new Set(inventoryItems.map((item) => item.product.category))),
  ];

  const filtered = inventoryItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.product.category === selectedCategory;
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isActive;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold mb-4">Browse Products</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              placeholder="Search by name, category..."
              className="w-full border rounded-md pl-10 pr-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category filters */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:border-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} products found
        </p>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.inventoryId} className="bg-card border rounded-lg p-4">
              <div className="mb-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {item.product.category}
                </span>
              </div>
              <h3 className="font-medium text-sm mb-1">{item.product.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">{item.product.dosage}</p>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.product.description}
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Expiry: {item.product.expiryDate}
              </p>
              <p className="text-sm font-semibold text-primary mb-1">
                £{item.product.price}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                In stock: {item.quantityAvailable}
              </p>
              {item.product.requiresPrescription && (
                <p className="text-xs text-orange-600 mb-2">⚠ Requires prescription</p>
              )}
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
      </div>
    </div>
  );
}