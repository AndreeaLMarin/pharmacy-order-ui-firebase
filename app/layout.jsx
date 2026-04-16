// app/layout.jsx
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { CartProvider } from "@/lib/cartContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata = {
  title: "PharmaCare - Community Pharmacy Platform",
  description: "Order medications and health products from local pharmacies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}