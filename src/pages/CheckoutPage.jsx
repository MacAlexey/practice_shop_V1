import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createOrder({
        name: form.name,
        email: form.email,
        address: form.address,
        items: cart,
        totalPrice,
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <ul className="divide-y text-sm">
          {cart.map((item) => (
            <li key={item.id} className="py-2 flex justify-between">
              <span>
                {item.image} {item.name} × {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toLocaleString()} VND</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t font-bold flex justify-between">
          <span>Total</span>
          <span>{totalPrice.toLocaleString()} VND</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="your name"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="your email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Delivery Address
          </label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            placeholder="your address"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
          >
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
