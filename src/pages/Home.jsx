import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "../components/ProductCard";
import { ChevronRight, Truck, ShieldCheck, Headphones } from "lucide-react";

// NOTE: Firestore queries below intentionally avoid combining `where` with
// `orderBy` on a different field — that combination needs a "composite
// index" to be created manually in the Firebase console first. We fetch
// with equality filters only and sort in JavaScript instead.
export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [siteName, setSiteName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const bannerSnap = await getDocs(
          query(collection(db, "banners"), where("active", "==", true), limit(10))
        );
        const bannerDocs = bannerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        bannerDocs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setBanners(bannerDocs.slice(0, 5));

        const catSnap = await getDocs(
          query(collection(db, "categories"), where("active", "==", true), limit(10))
        );
        const catDocs = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        catDocs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCategories(catDocs);

        const featSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true), where("featured", "==", true), limit(8))
        );
        setFeatured(featSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const newSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true), limit(30))
        );
        const newDocs = newSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        newDocs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setNewArrivals(newDocs.slice(0, 8));

        const generalSnap = await getDoc(doc(db, "settings", "general"));
        if (generalSnap.exists()) setSiteName(generalSnap.data().siteName || "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-40 bg-slate-200 rounded-card animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Hero: real banners if configured, otherwise a branded gradient fallback so the page never looks empty */}
      {banners.length > 0 ? (
        <div className="overflow-x-auto flex snap-x snap-mandatory gap-3 px-4 pt-4 pb-2">
          {banners.map((b) => (
            <a key={b.id} href={b.buttonUrl || "#"} className="snap-center shrink-0 w-[88%] rounded-card overflow-hidden relative shadow-sm">
              <img src={b.image} alt={b.title} className="w-full h-44 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-4 text-white">
                <p className="font-bold text-lg leading-tight">{b.title}</p>
                {b.subtitle && <p className="text-sm text-white/90">{b.subtitle}</p>}
                {b.buttonText && (
                  <span className="inline-block mt-2 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full w-fit">
                    {b.buttonText}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-4 rounded-card bg-gradient-to-br from-primary to-primary-dark text-white p-6 shadow-sm">
          <p className="text-xl font-extrabold leading-tight">{siteName || "স্বাগতম আমাদের শপে"}</p>
          <p className="text-sm text-white/90 mt-1">সেরা দামে সেরা পণ্য, ঘরে বসেই অর্ডার করুন</p>
          <Link to="/shop" className="inline-block mt-3 bg-white text-primary text-sm font-bold px-4 py-2 rounded-full">
            এখনই কেনাকাটা করুন
          </Link>
        </div>
      )}

      {/* Trust strip */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <Truck size={20} className="text-primary" />
          <p className="text-[11px] text-slate-500">দ্রুত ডেলিভারি</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={20} className="text-primary" />
          <p className="text-[11px] text-slate-500">নিরাপদ পেমেন্ট</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Headphones size={20} className="text-primary" />
          <p className="text-[11px] text-slate-500">কাস্টমার সাপোর্ট</p>
        </div>
      </div>

      {/* Category quick links */}
      {categories.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-bold">ক্যাটাগরি</h2>
            <Link to="/categories" className="text-xs text-primary font-medium flex items-center">সব দেখুন <ChevronRight size={14} /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1">
            {categories.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.id}`} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                <div className="w-16 h-16 rounded-full bg-surface border overflow-hidden flex items-center justify-center">
                  {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-primary">{c.name?.[0]}</span>}
                </div>
                <p className="text-[11px] text-center leading-tight line-clamp-2">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="px-4 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">ফিচার্ড প্রোডাক্ট</h2>
            <Link to="/shop" className="text-xs text-primary font-medium flex items-center">সব দেখুন <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="px-4 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">নতুন এসেছে</h2>
            <Link to="/shop" className="text-xs text-primary font-medium flex items-center">সব দেখুন <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {featured.length === 0 && newArrivals.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-slate-400 text-sm">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
          <p className="text-slate-400 text-xs mt-1">Admin Panel → Products থেকে যোগ করুন।</p>
        </div>
      )}
    </div>
  );
}
