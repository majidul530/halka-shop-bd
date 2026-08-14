import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    // Single-field orderBy, no where — no composite index needed.
    getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(300))).then((snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    const t = o.createdAt?.toMillis?.();
    if (!t) return false;
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime() + 86400000) return false;
    return o.status !== "Cancelled";
  });

  const revenue = filtered.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = filtered.length ? Math.round(revenue / filtered.length) : 0;

  const productCounts = {};
  filtered.forEach((o) => {
    o.items?.forEach((item) => {
      productCounts[item.name] = (productCounts[item.name] || 0) + item.qty;
    });
  });
  const bestSellers = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Reports</h1>
      <p className="text-xs text-slate-500 mb-4">Based on the last 300 orders (free-tier friendly — no scheduled aggregation).</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded p-2 text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded p-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-card p-4"><p className="text-xs text-slate-500">Revenue</p><p className="text-xl font-bold">৳{revenue}</p></div>
        <div className="bg-white border rounded-card p-4"><p className="text-xs text-slate-500">Orders</p><p className="text-xl font-bold">{filtered.length}</p></div>
        <div className="bg-white border rounded-card p-4"><p className="text-xs text-slate-500">Avg Order Value</p><p className="text-xl font-bold">৳{avgOrderValue}</p></div>
      </div>

      <div className="bg-white border rounded-card p-4">
        <h2 className="font-bold text-sm mb-2">Best Sellers</h2>
        {bestSellers.length === 0 ? (
          <p className="text-slate-400 text-sm">No data in this range.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {bestSellers.map(([name, qty]) => (
              <li key={name} className="flex justify-between"><span>{name}</span><span className="font-medium">{qty} sold</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
