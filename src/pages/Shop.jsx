import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const categoryId = searchParams.get("category") || null;
  const [products, setProducts] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ sort, page: 0, categoryId }).then(({ products, nextPage }) => {
      setProducts(products);
      setNextPage(nextPage);
      setLoading(false);
    });
  }, [sort, categoryId]);

  async function loadMore() {
    const { products: more, nextPage: newNextPage } = await getProducts({ sort, page: nextPage, categoryId });
    setProducts((prev) => [...prev, ...more]);
    setNextPage(newNextPage);
  }

  // Client-side text match on top of the fetched page — Firestore doesn't
  // do full-text search on the free tier, so this filters what's already loaded.
  const visible = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg">Shop</h1>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {nextPage !== null && !q && (
        <button onClick={loadMore} className="mt-6 mx-auto block bg-primary text-white px-6 py-2 rounded-full text-sm">
          Load more
        </button>
      )}
    </div>
  );
}
