import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

function getInitialKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? `cart_${user.id}` : "cart_guest";
  } catch {
    return "cart_guest";
  }
}

export function CartProvider({ children }) {
  const [cartKey, setCartKey] = useState(getInitialKey);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(getInitialKey());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // Switch cart when user logs in or out
  function switchToUser(userId) {
    const key = userId ? `cart_${userId}` : "cart_guest";
    setCartKey(key);
    try {
      const saved = localStorage.getItem(key);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast.error("Item removed from cart");
  }

  function changeQuantity(productId, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        changeQuantity,
        clearCart,
        switchToUser,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
