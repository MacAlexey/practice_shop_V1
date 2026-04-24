import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 9;

export default function ProductList({ products = [] }) {
  const { addToCart } = useCart();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentItems = products.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [products]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((product) => (
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

      {products.length === 0 && (
        <p className="text-center text-gray-400 mt-10">No products found</p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
