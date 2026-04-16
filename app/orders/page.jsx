// app/orders/page.jsx
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import OrdersClient from "./OrdersClient";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  return <OrdersClient />;
}