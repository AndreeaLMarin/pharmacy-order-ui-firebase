// app/pharmacies/[id]/page.jsx
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PharmacyDetailsClient from "./PharmacyDetailsClient";
import { notFound } from "next/navigation";

// React Server Component - fetches data server-side
export default async function PharmacyDetailsPage({ params }) {
  const { id } = await params;

  const pharmacySnap = await getDoc(doc(db, "pharmacies", id));
  if (!pharmacySnap.exists()) return notFound();

  const pharmacy = { id: pharmacySnap.id, ...pharmacySnap.data() };

  // Get inventory for this pharmacy
  const inventorySnap = await getDocs(
    query(collection(db, "inventory"), where("pharmacyId", "==", id))
  );

  // For each inventory item, get the product details
  const inventoryItems = await Promise.all(
    inventorySnap.docs.map(async (inventoryDoc) => {
      const inventoryData = inventoryDoc.data();
      const productSnap = await getDoc(doc(db, "products", inventoryData.productId));
      if (!productSnap.exists()) return null;
      return {
        inventoryId: inventoryDoc.id,
        pharmacyId: id,
        quantityAvailable: inventoryData.quantityAvailable,
        isActive: inventoryData.isActive,
        product: { id: productSnap.id, ...productSnap.data() },
      };
    })
  );

  const activeItems = inventoryItems.filter((item) => item && item.isActive);

  return <PharmacyDetailsClient pharmacy={pharmacy} inventoryItems={activeItems} />;
}