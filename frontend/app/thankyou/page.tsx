"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  variant: string;
  quantity: number;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  product: {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

export default function ThankYou() {
  const params = useSearchParams();
  const router = useRouter();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setError("No order number provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderNumber}`
        );
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "✅";
      case "DECLINED":
        return "❌";
      case "ERROR":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          title: "Order Confirmed!",
          message:
            "Your payment has been processed successfully and your order is confirmed.",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case "DECLINED":
        return {
          title: "Payment Declined",
          message:
            "Your payment was declined. Please check your payment method and try again.",
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case "ERROR":
        return {
          title: "Payment Error",
          message:
            "There was an error processing your payment. Please contact support or try again.",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          title: "Unknown Status",
          message: "Please contact support for order status.",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(order.status);
  const subtotal = order.product.price * order.quantity;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Order Confirmation
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div
          className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 mb-8`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl">{getStatusIcon(order.status)}</div>
          </div>
          <div className="text-center">
            <h1 className={`text-3xl font-bold ${statusInfo.textColor} mb-2`}>
              {statusInfo.title}
            </h1>
            <p className={`text-lg ${statusInfo.textColor}`}>
              {statusInfo.message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Order Number
                </label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                  {order.orderNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Order Date
                </label>
                <p className="text-lg">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "DECLINED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getStatusIcon(order.status)} {order.status}
                </span>
              </div>
            </div>

            {/* Product Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Product Summary</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={order.product.imageUrl}
                  alt={order.product.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{order.product.title}</h4>
                  <p className="text-sm text-gray-600">
                    Variant: {order.variant}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {order.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Unit Price: ${order.product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({order.quantity} item
                    {order.quantity > 1 ? "s" : ""}):
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Customer Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <p className="text-lg">{order.customer.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="text-lg">{order.customer.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="text-lg">{order.customer.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="text-lg">
                  {order.customer.address}, {order.customer.city},{" "}
                  {order.customer.state} {order.customer.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Shop Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </main>
    </div>
  );
}
