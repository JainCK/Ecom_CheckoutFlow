"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("productId");
  const variant = params.get("variant") || "";
  const quantity = parseInt(params.get("quantity") || "1");
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    transactionType: "1",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then(setProduct);
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: +productId!,
        variant,
        quantity,
        transactionType: form.transactionType,
        customerData: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      }),
    });
    const data = await res.json();
    if (data.orderNumber) router.push(`/thank-you?order=${data.orderNumber}`);
  };

  if (!product) return <p>Loading...</p>;
  return (
    <main className="max-w-3xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Checkout Form</h2>
        {[
          "fullName",
          "email",
          "phone",
          "address",
          "city",
          "state",
          "zipCode",
          "cardNumber",
          "expiry",
          "cvv",
        ].map((field) => (
          <input
            key={field}
            name={field}
            value={(form as any)[field]}
            onChange={handleChange}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            className="mb-2 p-2 border rounded w-full"
          />
        ))}
        <label className="block text-sm mt-2">
          Transaction Type (1=✅, 2=❌, 3=⚠)
        </label>
        <input
          name="transactionType"
          value={form.transactionType}
          onChange={handleChange}
          className="p-2 border rounded w-full"
        />
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
        >
          Submit Order
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Order Summary</h2>
        <p>Product: {product.title}</p>
        <p>Variant: {variant}</p>
        <p>Quantity: {quantity}</p>
        <p>Price per unit: ${product.price}</p>
        <p>Total: ${product.price * quantity}</p>
      </div>
    </main>
  );
}
