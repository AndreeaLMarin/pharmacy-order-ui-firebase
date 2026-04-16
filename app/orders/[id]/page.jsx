// app/orders/[id]/page.jsx
import OrderDetailsClient from "./OrderDetailsClient";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;
  return <OrderDetailsClient orderId={id} />;
}