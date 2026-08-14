import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "categories"), where("active", "==", true))).then((snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setCategories(docs);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;
  if (categories.length === 0) return <div className="p-8 text-center text-slate-400">No categories yet.</div>;

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg mb-4">Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((c) => (
          <Link key={c.id} to={`/shop?category=${c.id}`} className="bg-white border rounded-card overflow-hidden">
            <div className="aspect-square bg-slate-100">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <p className="p-2 text-sm font-medium text-center">{c.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
