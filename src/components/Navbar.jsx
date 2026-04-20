import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartDropdown from "./CartDropdown";

export default function Navbar() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Lazada from Temu
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/orders"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Orders
          </Link>

          {/* Cart Button*/}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              <span className="text-2xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {open && <CartDropdown onClose={() => setOpen(false)} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
