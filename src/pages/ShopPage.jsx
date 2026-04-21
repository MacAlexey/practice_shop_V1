import { useState } from "react";
import ProductList from "../components/ProductList";
import SearchBar from "../components/SearchBar";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SearchBar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        sortBy={sortBy}
        onSort={setSortBy}
      />
      <ProductList searchQuery={searchQuery} sortBy={sortBy} />
    </div>
  );
}
