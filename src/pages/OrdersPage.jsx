import { useState, useEffect } from "react";
import { getOrders } from "../api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

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
          {orders.map((order) => (
            <li key={order.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">👤 {order.name}</p>
              <p className="text-sm text-gray-600 mb-1">✉️ {order.email}</p>
              <p className="text-sm text-gray-600 mb-3">📍 {order.address}</p>
              <ul className="text-sm divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="py-1 flex justify-between">
                    <span>
                      {item.image} {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-500">
                      {(item.price * item.quantity).toLocaleString()} VND
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t font-bold text-right">
                {order.total.toLocaleString()} VND
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
