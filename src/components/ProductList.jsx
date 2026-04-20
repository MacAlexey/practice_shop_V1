import { useCart } from "../context/CartContext";

const PRODUCTS = [
  { id: 1, name: "Laptop Pro", price: 75000, image: "💻" },
  { id: 2, name: "Smartphone X", price: 45000, image: "📱" },
  { id: 3, name: "Headphones", price: 8500, image: "🎧" },
  { id: 4, name: "Keyboard", price: 5200, image: "⌨️" },
  { id: 5, name: "Mouse", price: 3100, image: "🖱️" },
  { id: 6, name: "Monitor", price: 32000, image: "🖥️" },
];

export default function ProductList() {
  const { addToCart } = useCart();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-3"
          >
            <span className="text-5xl">{product.image}</span>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-500">{product.price.toLocaleString()} VND</p>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
