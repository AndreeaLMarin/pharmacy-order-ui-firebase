// components/Header.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/authContext";
import { Pill, ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";



export default function Header() {

  const { user, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems, setCartOpen } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  const navItems = [
    { path: "/", label: "Home" },
    { path: "/pharmacies", label: "Pharmacies" },
    { path: "/products", label: "Products" },
    { path: "/orders", label: "My Orders" },
    ...(profile?.role === "admin" ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  async function handleSignOut() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <Pill className="h-6 w-6" />
            </div>
            <span className="font-semibold text-xl hidden sm:inline">PharmaCare</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            {user && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-md hover:bg-secondary transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                {profile?.role === "admin" && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col gap-2 border-t">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" className="px-3 py-2 text-sm text-muted-foreground">
                Login / Register
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}