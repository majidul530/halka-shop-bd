import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Star, Trash2 } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "reviews"));
    setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await updateDoc(doc(db, "reviews", id), { status });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function handleDelete(id) {
    if (!confirm("এই রিভিউটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "reviews", id));
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const visible = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-bold text-lg">Reviews</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-400">No reviews here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => (
            <div key={r.id} className="bg-white border rounded-card p-4">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? "fill-secondary text-secondary" : "text-slate-300"} />
                ))}
                <span className={`ml-auto text-xs px-2 py-0.5 rounded ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "hidden" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm">{r.comment}</p>
              {r.image && <img src={r.image} alt="" className="w-16 h-16 rounded mt-2 object-cover" />}
              <div className="flex gap-3 mt-2 text-xs">
                {r.status !== "approved" && <button onClick={() => setStatus(r.id, "approved")} className="text-green-600 font-medium">Approve</button>}
                {r.status !== "hidden" && <button onClick={() => setStatus(r.id, "hidden")} className="text-yellow-600 font-medium">Hide</button>}
                <button onClick={() => handleDelete(r.id)} className="text-red-500 font-medium flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
