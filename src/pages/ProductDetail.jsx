import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../services/productService";
import { getApprovedReviews, canReviewProduct, submitReview } from "../services/reviewService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { Heart, Star } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { productIds, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p?.variants?.length) setVariant(p.variants[0]);
      setLoading(false);
      if (p) {
        getApprovedReviews(p.id).then(setReviews);
        if (user) canReviewProduct(user.uid, p.id).then(setCanReview);
      }
    });
  }, [slug, user]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-slate-400">Product not found.</div>;

  const price = variant?.price ?? product.salePrice ?? product.price;
  const stock = variant?.stock ?? product.stock;
  const isWishlisted = productIds.includes(product.id);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  function handleAddToCart() {
    addItem(product, variant, qty);
  }

  function handleBuyNow() {
    addItem(product, variant, qty);
    navigate("/checkout");
  }

  async function handleWishlist() {
    const ok = await toggle(product.id);
    if (!ok) navigate("/login");
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await submitReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || "Customer",
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewSubmitted(true);
      setCanReview(false);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="relative aspect-square bg-slate-100 rounded-card overflow-hidden mb-2">
        {product.images?.[activeImage] && (
          <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
        )}
        <button onClick={handleWishlist} className="absolute top-3 right-3 bg-white/90 rounded-full p-2" aria-label="Wishlist">
          <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {product.images?.map((img, i) => (
          <button key={i} onClick={() => setActiveImage(i)} className={`w-14 h-14 shrink-0 rounded overflow-hidden border ${i === activeImage ? "border-primary" : "border-slate-200"}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <h1 className="font-bold text-lg">{product.name}</h1>
      {avgRating && (
        <div className="flex items-center gap-1 mt-1">
          <Star size={14} className="fill-secondary text-secondary" />
          <span className="text-sm font-medium">{avgRating}</span>
          <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-1">SKU: {variant?.sku || product.sku}</p>
      <p className="text-2xl font-bold text-primary mt-2">৳{price}</p>
      <p className={`text-sm mt-1 ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
        {stock > 0 ? `In stock (${stock})` : "Out of stock"}
      </p>

      {product.variants?.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Options</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                className={`px-3 py-1.5 rounded-full text-sm border ${variant?.id === v.id ? "bg-primary text-white border-primary" : "border-slate-300"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center border rounded-full">
          <button className="px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
          <span className="px-3">{qty}</span>
          <button className="px-3 py-1" onClick={() => setQty((q) => Math.min(stock, q + 1))}>+</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-bold mb-2">Description</h2>
        <p className="text-sm text-slate-600 whitespace-pre-line">{product.fullDescription || product.shortDescription}</p>
      </div>

      <div className="mt-8">
        <h2 className="font-bold mb-3">Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-secondary text-secondary" : "text-slate-300"} />
                  ))}
                  <span className="text-xs font-medium ml-1">{r.userName}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {canReview && !reviewSubmitted && (
          <form onSubmit={handleReviewSubmit} className="mt-4 border rounded-card p-3 flex flex-col gap-2">
            <p className="text-sm font-medium">Write a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}>
                  <Star size={20} className={n <= reviewForm.rating ? "fill-secondary text-secondary" : "text-slate-300"} />
                </button>
              ))}
            </div>
            <textarea required placeholder="Your experience..." className="border rounded p-2 text-sm" value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} />
            <button type="submit" disabled={reviewSubmitting} className="bg-primary text-white rounded-full py-2 text-sm font-medium self-start px-4 disabled:opacity-50">
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
        {reviewSubmitted && <p className="text-green-600 text-sm mt-3">ধন্যবাদ! আপনার রিভিউ অনুমোদনের অপেক্ষায় আছে।</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3">
        <button onClick={handleAddToCart} disabled={stock === 0} className="flex-1 border border-primary text-primary rounded-full py-2.5 text-sm font-medium disabled:opacity-40">
          Add to Cart
        </button>
        <button onClick={handleBuyNow} disabled={stock === 0} className="flex-1 bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-40">
          Buy Now
        </button>
      </div>
    </div>
  );
}
