import { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "../components/ProductCard";
import { Tag } from "lucide-react";

export default function Offers() {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Equality-only filter, no composite index needed; salePrice presence
      // checked client-side since Firestore can't query "field < otherField".
      const snap = await getDocs(query(collection(db, "products"), where("active", "==", true)));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(docs.filter((p) => p.salePrice && p.salePrice < p.price));

      const couponSnap = await getDocs(query(collection(db, "coupons"), where("active", "==", true)));
      setCoupons(couponSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg mb-4">Offers</h1>

      {coupons.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {coupons.map((c) => (
            <div key={c.id} className="bg-primary/10 border border-primary rounded-card p-3 flex items-center gap-3">
              <Tag className="text-primary" size={20} />
              <div>
                <p className="font-bold text-primary">{c.code}</p>
                <p className="text-xs text-slate-600">
                  {c.type === "percentage" ? `${c.value}% off` : `৳${c.value} off`}
                  {c.minOrder ? ` on orders above ৳${c.minOrder}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No discounted products right now.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
