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
  inventory: number;
};

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
          setVariant(data[0].variants[0]);
        }
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyNow = () => {
    if (!selectedProduct) return;

    if (quantity > selectedProduct.inventory) {
      alert(
        `Sorry, only ${selectedProduct.inventory} items available in stock.`
      );
      return;
    }

    router.push(
      `/checkout?productId=${selectedProduct.id}&variant=${encodeURIComponent(
        variant
      )}&quantity=${quantity}`
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (selectedProduct && newQuantity > selectedProduct.inventory) {
      alert(`Maximum available quantity is ${selectedProduct.inventory}`);
      return;
    }
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">No products available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Shop</h1>
        </div>
      </header>

      {/* Product Selection */}
      {products.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-xl font-semibold mb-4">Select a Product:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedProduct.id === product.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => {
                  setSelectedProduct(product);
                  setVariant(product.variants[0]);
                  setQuantity(1);
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h3 className="font-semibold text-lg">{product.title}</h3>
                <p className="text-green-600 font-bold">${product.price}</p>
                <p className="text-sm text-gray-600">
                  Stock: {product.inventory}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Product Display */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedProduct.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            <div className="text-3xl font-bold text-green-600">
              ${selectedProduct.price.toFixed(2)}
            </div>

            <div className="space-y-4">
              {/* Variant Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Variant
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  {selectedProduct.variants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct.inventory}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-20 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={quantity >= selectedProduct.inventory}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProduct.inventory} available in stock
                </p>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(selectedProduct.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                disabled={selectedProduct.inventory === 0}
              >
                {selectedProduct.inventory === 0 ? "Out of Stock" : "Buy Now"}
              </button>

              {selectedProduct.inventory < 10 &&
                selectedProduct.inventory > 0 && (
                  <p className="text-orange-600 text-sm font-medium">
                    ⚠️ Only {selectedProduct.inventory} left in stock!
                  </p>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
