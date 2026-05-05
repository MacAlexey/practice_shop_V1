import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { getOrders } from "../api/orders";
import { createPaymentSession } from "../api/payments";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      const guestOrders = JSON.parse(localStorage.getItem("guestOrders") || "[]");
      setOrders(guestOrders);
      setLoading(false);
      return;
    }

    getOrders()
      .then((data) => setOrders(data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      clearCart();
      toast.success("Payment successful!");
    }
    if (params.get("payment") === "cancelled") toast.error("Payment cancelled");
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3001");
    socket.on("order:paid", ({ orderId }) => {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, paymentStatus: "paid" } : o)
      );
    });
    return () => socket.disconnect();
  }, []);

  async function handlePayNow(orderId) {
    try {
      const { url } = await createPaymentSession(orderId);
      window.location.href = url;
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    }
  }

  if (loading) return <p className="text-center py-8 text-gray-400">Loading...</p>;
  if (error) return <p className="text-center py-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p className="text-4xl mb-2">📋</p>
          <p>No orders yet</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const isExpired = order.expiresAt && new Date() > new Date(order.expiresAt);
            const canPay = order.paymentStatus === "unpaid" && !isExpired;

            return (
              <li key={order.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                    {order.paymentStatus && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-blue-100 text-blue-700"
                          : isExpired
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.paymentStatus === "paid" ? "Paid" : isExpired ? "Expired" : "Unpaid"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">👤 {order.name}</p>
                <p className="text-sm text-gray-600 mb-1">✉️ {order.email}</p>
                <p className="text-sm text-gray-600 mb-3">📍 {order.address}</p>
                <ul className="text-sm divide-y">
                  {order.items.map((item) => (
                    <li key={item.productId} className="py-1 flex justify-between">
                      <span>{item.image} {item.name} × {item.quantity}</span>
                      <span className="text-gray-500">
                        {formatPrice((item.priceSnapshot ?? item.price) * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t font-bold text-right">
                  {formatPrice(order.totalPrice)}
                </div>
                {canPay && (
                  <button
                    onClick={() => handlePayNow(order.id)}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    Pay Now
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
