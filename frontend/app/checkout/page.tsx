"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  transactionType: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("productId");
  const variant = params.get("variant") || "";
  const quantity = parseInt(params.get("quantity") || "1");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
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
    const fetchProduct = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const products = await response.json();
        const foundProduct = products.find(
          (p: any) => p.id === parseInt(productId!)
        );
        setProduct(foundProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Error loading product data");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Basic validations
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    // Payment validations
    if (!form.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!form.expiry.trim()) {
      newErrors.expiry = "Expiry date is required";
    } else {
      const [month, year] = form.expiry.split("/");
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiry = "Expiry date must be in MM/YY format";
      } else {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expiryMonth = parseInt(month);
        const expiryYear = parseInt(year);

        if (expiryMonth < 1 || expiryMonth > 12) {
          newErrors.expiry = "Invalid month";
        } else if (
          expiryYear < currentYear ||
          (expiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          newErrors.expiry = "Expiry date must be in the future";
        }
      }
    }

    if (!form.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3}$/.test(form.cvv)) {
      newErrors.cvv = "CVV must be 3 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setForm((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setForm((prev) => ({ ...prev, expiry: value }));
    if (errors.expiry) {
      setErrors((prev) => ({ ...prev, expiry: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(productId!),
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
          paymentData: {
            cardNumber: form.cardNumber,
            expiry: form.expiry,
            cvv: form.cvv,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.orderNumber) {
        router.push(`/thank-you?order=${data.orderNumber}`);
      } else {
        if (data.errors) {
          const errorObj: FormErrors = {};
          data.errors.forEach((error: string) => {
            // Map server errors to form fields
            if (error.includes("email")) errorObj.email = error;
            else if (error.includes("phone")) errorObj.phone = error;
            else if (error.includes("card")) errorObj.cardNumber = error;
            else if (error.includes("expiry")) errorObj.expiry = error;
            else if (error.includes("CVV")) errorObj.cvv = error;
            else errorObj.general = error;
          });
          setErrors(errorObj);
        } else {
          alert(data.message || "Failed to submit order");
        }
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">Product not found</div>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Billing Information</h2>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  Payment Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      value={form.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiry ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="MM/YY"
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.expiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={form.cvv}
                      onChange={handleChange}
                      maxLength={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Type Simulator */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Simulation (For Testing)
                </label>
                <select
                  name="transactionType"
                  value={form.transactionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 - ✅ Approved Transaction</option>
                  <option value="2">2 - ❌ Declined Transaction</option>
                  <option value="3">3 - ⚠️ Gateway Error</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {submitting
                  ? "Processing..."
                  : `Place Order - ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-600">Variant: {variant}</p>
                  <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
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

              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h4 className="font-semibold mb-2">🔒 Secure Checkout</h4>
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and secure. We never
                  store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
