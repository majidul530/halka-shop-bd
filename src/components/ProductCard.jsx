import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const { productIds, toggle } = useWishlist();
  const navigate = useNavigate();
  const isWishlisted = productIds.includes(product.id);
  const price = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  async function handleWishlist(e) {
    e.preventDefault();
    const ok = await toggle(product.id);
    if (!ok) navigate("/login");
  }

  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-card border border-slate-200 overflow-hidden block shadow-sm active:scale-[0.98] transition-transform">
      <div className="relative aspect-square bg-surface">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
        )}
        <button className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm" aria-label="Wishlist" onClick={handleWishlist}>
          <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"} />
        </button>
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-primary">৳{price}</span>
          {hasDiscount && <span className="text-xs text-slate-400 line-through">৳{product.price}</span>}
        </div>
      </div>
    </Link>
  );
}
