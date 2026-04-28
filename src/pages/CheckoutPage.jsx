import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders";
import { getProducts } from "../api/products";
import { formatPrice } from "../utils/format";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceChanges, setPriceChanges] = useState([]);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const changes = cart
          .filter((item) => {
            const current = products.find((p) => p.id === item.productId);
            return current && current.price !== item.priceSnapshot;
          })
          .map((item) => {
            const current = products.find((p) => p.id === item.productId);
            return { name: item.name, old: item.priceSnapshot, new: current.price };
          });
        setPriceChanges(changes);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const order = await createOrder({
        name: user ? user.name : form.name,
        email: user ? user.email : form.email,
        address: form.address,
        items: cart,
        totalPrice,
      });

      if (!user) {
        const saved = JSON.parse(localStorage.getItem("guestOrders") || "[]");
        localStorage.setItem("guestOrders", JSON.stringify([...saved, order]));
      }

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
            <li key={item.productId} className="py-2 flex justify-between">
              <span>
                {item.image} {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceSnapshot * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t font-bold flex justify-between">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {priceChanges.length > 0 && (
        <div className="mb-4 bg-orange-50 text-orange-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold mb-1">Price changed since you added to cart:</p>
          {priceChanges.map((c) => (
            <p key={c.name}>
              {c.name}: {formatPrice(c.old)} → {formatPrice(c.new)}
            </p>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 flex flex-col gap-4"
      >
        {user ? (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
            <p>
              <span className="font-medium text-gray-700">Name:</span>{" "}
              {user.name}
            </p>
            <p>
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {user.email}
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your name"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Your email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </>
        )}
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
            placeholder="Your address"
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
