import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // For each user, pull their order count/spend. Equality-only where, no
    // composite index needed. Capped per-user to keep read volume sane.
    const enriched = await Promise.all(
      users.map(async (u) => {
        const orderSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", u.id)));
        const orders = orderSnap.docs.map((d) => d.data());
        const totalSpent = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
        return { ...u, orderCount: orders.length, totalSpent };
      })
    );
    setCustomers(enriched);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleBlock(customer) {
    await updateDoc(doc(db, "users", customer.id), { blocked: !customer.blocked });
    load();
  }

  const visible = customers.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-bold text-lg">Customers</h1>
        <input placeholder="Search name/phone/email" value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Orders</th>
                <th className="p-3">Spent</th><th className="p-3">Status</th><th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name || "-"}<br /><span className="text-xs text-slate-400">{c.email}</span></td>
                  <td className="p-3">{c.phone || "-"}</td>
                  <td className="p-3">{c.orderCount}</td>
                  <td className="p-3">৳{c.totalSpent}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${c.blocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {c.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleBlock(c)} className="text-xs text-primary underline">
                      {c.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
