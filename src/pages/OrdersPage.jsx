import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { getOrders } from "../api/orders";
import { createPaymentSession, getInvoice } from "../api/payments";
import { createReport } from "../api/reports";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [couponCodes, setCouponCodes] = useState({});
  const location = useLocation();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      const guestOrders = JSON.parse(
        localStorage.getItem("guestOrders") || "[]"
      );
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
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io("http://localhost:3001", { auth: { token } });
    socket.on("order:paid", ({ orderId }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, paymentStatus: "paid" } : o
        )
      );
    });
    return () => socket.disconnect();
  }, [user]);

  async function handleSubmitReport(e) {
    e.preventDefault();
    try {
      await createReport({
        orderId: reportModal,
        reason: reportReason,
        description: reportDescription,
      });
      toast.success("Report submitted");
      setReportModal(null);
      setReportReason("");
      setReportDescription("");
    } catch (err) {
      toast.error(err.message || "Failed to submit report");
    }
  }

  async function handleDownloadInvoice(orderId) {
    try {
      const { url } = await getInvoice(orderId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err.message || "Failed to get invoice");
    }
  }

  async function handlePayNow(orderId) {
    try {
      const { url } = await createPaymentSession(orderId, couponCodes[orderId]);
      window.location.href = url;
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    }
  }

  if (loading)
    return <p className="text-center py-8 text-gray-400">Loading...</p>;
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
            const isExpired =
              order.expiresAt && new Date() > new Date(order.expiresAt);
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
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-blue-100 text-blue-700"
                            : isExpired
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? "Paid"
                          : isExpired
                            ? "Expired"
                            : "Unpaid"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">👤 {order.name}</p>
                <p className="text-sm text-gray-600 mb-1">✉️ {order.email}</p>
                <p className="text-sm text-gray-600 mb-3">📍 {order.address}</p>
                <ul className="text-sm divide-y">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="py-1 flex justify-between"
                    >
                      <span>
                        {item.image} {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-500">
                        {formatPrice(
                          (item.priceSnapshot ?? item.price) * item.quantity
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t font-bold text-right">
                  {formatPrice(order.totalPrice)}
                </div>
                {canPay && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">Promo Code </label>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={couponCodes[order.id] || ""}
                        onChange={(e) =>
                          setCouponCodes((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handlePayNow(order.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
                {order.paymentStatus === "paid" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition"
                    >
                      Download Invoice
                    </button>
                    <button
                      onClick={() => setReportModal(order.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm transition"
                    >
                      Report
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {reportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">
              Report Order #{reportModal}
            </h2>
            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select reason</option>
                <option value="not_received">Item not received</option>
                <option value="wrong_item">Wrong item</option>
                <option value="damaged">Item damaged</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="border rounded-lg px-3 py-2 text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReportModal(null);
                    setReportReason("");
                    setReportDescription("");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
