// app/page.jsx
"use client";

import { useAuth } from "@/lib/authContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { MapPin, Package, Clock, Shield } from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const features = [
    {
      icon: MapPin,
      title: "Find Local Pharmacies",
      description: "Discover trusted community pharmacies near you with our interactive map",
    },
    {
      icon: Package,
      title: "Easy Ordering",
      description: "Browse products and medications from multiple pharmacies in one place",
    },
    {
      icon: Clock,
      title: "Quick Pickup",
      description: "Order online and pick up at your convenience",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your health information is protected with industry-standard encryption",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
<Header />

      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Your Local Pharmacy, Online</h1>
        <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
          Order medications and health products from trusted community pharmacies near you.
        </p>
        <button
          onClick={() => router.push(user ? "/pharmacies" : "/login")}
          className="bg-white text-primary font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition"
        >
          {user ? "Browse Pharmacies" : "Get Started"}
        </button>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">Why Choose PharmaCare?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}