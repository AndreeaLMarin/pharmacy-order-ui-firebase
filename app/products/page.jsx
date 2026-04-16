// app/products/page.jsx
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const inventorySnap = await getDocs(collection(db, "inventory"));

  const inventoryItems = await Promise.all(
    inventorySnap.docs.map(async (inventoryDoc) => {
      const data = inventoryDoc.data();
      const productSnap = await getDocs(collection(db, "products"));
      const productDoc = productSnap.docs.find((d) => d.id === data.productId);
      if (!productDoc) return null;
      return {
        inventoryId: inventoryDoc.id,
        pharmacyId: data.pharmacyId,
        quantityAvailable: data.quantityAvailable,
        isActive: data.isActive,
        product: { id: productDoc.id, ...productDoc.data() },
      };
    })
  );

  const activeItems = inventoryItems.filter((item) => item && item.isActive);

  return <ProductsClient inventoryItems={activeItems} />;
}