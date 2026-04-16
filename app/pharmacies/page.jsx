// app/pharmacies/page.jsx
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PharmaciesClient from "./PharmaciesClient";

// This is a React Server Component - it fetches data on the server
export default async function PharmaciesPage() {
  const snapshot = await getDocs(collection(db, "pharmacies"));
  const pharmacies = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return <PharmaciesClient pharmacies={pharmacies} />;
}