import { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { getProductById } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(productIds.map((id) => getProductById(id))).then((results) => {
      setProducts(results.filter(Boolean));
      setLoading(false);
    });
  }, [productIds]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (products.length === 0) return <div className="p-8 text-center text-slate-400">Your wishlist is empty.</div>;

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg mb-4">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
