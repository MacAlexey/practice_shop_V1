import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";

export default function ProductList({ searchQuery = '', sortBy = 'default' }) {
  const { addToCart } = useCart();

  const filtered = PRODUCTS
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-3"
          >
            <span className="text-5xl">{product.image}</span>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-500">
              {product.price.toLocaleString()} VND
            </p>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No products found</p>
      )}
    </div>
  );
}
