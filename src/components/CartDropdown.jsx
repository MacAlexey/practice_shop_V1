import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function CartDropdown({ onClose }) {
  const { cart, totalPrice, changeQuantity, removeFromCart } = useCart();

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border z-50">
      <div className="p-4">
        <h3 className="font-bold text-lg mb-3">Cart</h3>

        {cart.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Cart is empty</p>
        ) : (
          <>
            <ul className="divide-y max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <li key={item.productId} className={`py-2 flex items-center gap-2 ${item.unavailable ? "opacity-50" : ""}`}>
                  <span>{item.image}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.unavailable
                      ? <p className="text-xs text-red-500 font-medium">Unavailable</p>
                      : <p className="text-xs text-gray-400">{formatPrice(item.priceSnapshot)}</p>
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeQuantity(item.productId, -1)}
                      className="w-6 h-6 bg-gray-100 rounded-full text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item.productId, 1)}
                      className="w-6 h-6 bg-gray-100 rounded-full text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-bold">Total: {formatPrice(totalPrice)}</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
