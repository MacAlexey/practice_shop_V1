import ProductList from "../components/ProductList";
import SearchBar from "../components/SearchBar";
import { PRODUCTS } from "../data/products";
import { useProductFilter } from "../hooks/useProductFilter";

export default function ShopPage() {
  const { filtered, searchQuery, setSearchQuery, sortBy, setSortBy } =
    useProductFilter(PRODUCTS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SearchBar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        sortBy={sortBy}
        onSort={setSortBy}
      />
      <ProductList products={filtered} />
    </div>
  );
}
