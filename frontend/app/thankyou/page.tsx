"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then(setOrder);
  }, [orderNumber]);

  if (!order) return <p>Loading order...</p>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
      <p className="mb-4">
        Order Number: <strong>{order.orderNumber}</strong>
      </p>
      <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
      <p>Product: {order.product.title}</p>
      <p>Variant: {order.variant}</p>
      <p>Quantity: {order.quantity}</p>
      <p>Status: {order.status}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Customer Info</h2>
      <p>Name: {order.customer.fullName}</p>
      <p>Email: {order.customer.email}</p>
      <p>Phone: {order.customer.phone}</p>
      <p>
        Address: {order.customer.address}, {order.customer.city},{" "}
        {order.customer.state} {order.customer.zipCode}
      </p>
    </main>
  );
}
