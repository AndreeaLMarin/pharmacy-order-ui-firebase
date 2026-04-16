// app/pharmacies/PharmaciesClient.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { Search } from "lucide-react";

// Leaflet must be dynamically imported - it uses browser APIs
const PharmacyMap = dynamic(() => import("@/components/PharmacyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function PharmaciesClient({ pharmacies }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const router = useRouter();

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold mb-4">Find Pharmacies Near You</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              placeholder="Search by name or location..."
              className="w-full border rounded-md pl-10 pr-4 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Map */}
          <div className="h-[500px] rounded-md overflow-hidden border">
            <PharmacyMap
              pharmacies={filtered}
              onPharmacyClick={(pharmacy) => setSelectedPharmacyId(pharmacy.id)}
              selectedPharmacyId={selectedPharmacyId}
            />
          </div>

          {/* Pharmacy list */}
          <div className="space-y-4 h-[500px] overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              Found {filtered.length} pharmacies
            </p>
            {filtered.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className={`bg-card border rounded-lg p-4 cursor-pointer transition hover:border-primary ${
                  selectedPharmacyId === pharmacy.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedPharmacyId(pharmacy.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{pharmacy.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pharmacy.address}</p>
                    <p className="text-sm text-muted-foreground">{pharmacy.phone}</p>
                    <p className="text-sm text-muted-foreground">{pharmacy.hours}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      pharmacy.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {pharmacy.isOpen ? "Open" : "Closed"}
                    </span>
                    <span className="text-sm">⭐ {pharmacy.rating}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/pharmacies/${pharmacy.id}`);
                  }}
                  className="mt-3 w-full bg-primary text-primary-foreground py-1.5 rounded-md text-sm hover:opacity-90 transition"
                >
                  View Products
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}