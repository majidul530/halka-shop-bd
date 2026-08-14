import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

// NOTE (free-tier tradeoff): without Cloud Functions there's no scheduled
// job to pre-aggregate totals, so this dashboard reads recent orders
// directly and sums them client-side. Capped to the last 100 orders to
// keep Firestore read costs predictable — for a high-volume store this
// should move to a Cloud Function that maintains rolling counters.
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)));
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const todayOrders = orders.filter((o) => o.createdAt?.toDate() >= startOfToday);
      const totalSales = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
      const todaySales = todayOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

      const lowStockSnap = await getDocs(query(collection(db, "products"), where("active", "==", true), limit(50)));
      const lowStock = lowStockSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.stock <= (p.lowStockThreshold ?? 5));

      setStats({
        todaySales,
        totalSales,
        todayOrders: todayOrders.length,
        totalOrders: orders.length,
        pending: orders.filter((o) => o.status === "Pending").length,
        completed: orders.filter((o) => o.status === "Delivered").length,
        cancelled: orders.filter((o) => o.status === "Cancelled").length,
        lowStock,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-400">Loading dashboard...</p>;

  const cards = [
    { label: "Today's Sales", value: `৳${stats.todaySales}` },
    { label: "Total Sales (last 100)", value: `৳${stats.totalSales}` },
    { label: "Today's Orders", value: stats.todayOrders },
    { label: "Total Orders (last 100)", value: stats.totalOrders },
    { label: "Pending Orders", value: stats.pending },
    { label: "Completed Orders", value: stats.completed },
    { label: "Cancelled Orders", value: stats.cancelled },
    { label: "Low Stock Products", value: stats.lowStock.length },
  ];

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border rounded-card p-4">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="text-xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {stats.lowStock.length > 0 && (
        <div className="bg-white border rounded-card p-4">
          <h2 className="font-bold mb-2 text-sm">Low Stock Alert</h2>
          <ul className="text-sm flex flex-col gap-1">
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-red-500 font-medium">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
