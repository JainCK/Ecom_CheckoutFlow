"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: string[];
};

export default function Home() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setVariant(data.variants[0]);
      });
  }, []);

  const handleBuyNow = () => {
    router.push(
      `/checkout?productId=${product?.id}&variant=${variant}&quantity=${quantity}`
    );
  };

  if (!product) return <p>Loading...</p>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="rounded w-full"
      />
      <h1 className="text-2xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="text-xl font-semibold mt-2">${product.price}</p>

      <div className="mt-4">
        <label className="block text-sm mb-1">Variant</label>
        <select
          className="w-full border rounded p-2"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
        >
          {product.variants.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm mb-1">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        onClick={handleBuyNow}
        className="mt-6 bg-black text-white px-4 py-2 rounded hover:opacity-80"
      >
        Buy Now
      </button>
    </main>
  );
}
