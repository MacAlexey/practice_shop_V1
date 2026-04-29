import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function Cart({ onCheckout }) {
  const { cart, removeFromCart, changeQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
        <p className="text-4xl mb-2">🛒</p>
        <p>Cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      <ul className="divide-y">
        {cart.map((item) => (
          <li key={item.productId} className={`py-3 flex items-center gap-3 ${item.unavailable ? "opacity-50" : ""}`}>
            <span className="text-2xl">{item.image}</span>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              {item.unavailable
                ? <p className="text-xs text-red-500 font-medium">Unavailable</p>
                : <p className="text-sm text-gray-500">{formatPrice(item.priceSnapshot)}</p>
              }
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeQuantity(item.productId, -1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >
                −
              </button>
              <span className="w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => changeQuantity(item.productId, 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="font-bold text-lg">Total: {formatPrice(totalPrice)}</span>
        <button
          onClick={onCheckout}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
