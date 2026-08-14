import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";

const STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  async function load() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc")));
    setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await updateDoc(doc(db, "payments", id), { status });
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));

    // If a manual bKash/Nagad payment is marked Paid, reflect it on the order too.
    if (status === "Paid") {
      const payment = payments.find((p) => p.id === id);
      if (payment?.orderId) {
        await updateDoc(doc(db, "orders", payment.orderId), { paymentStatus: "Paid" });
      }
    }
  }

  const visible = filter === "All" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-bold text-lg">Payments</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="All">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-400">No payment records.</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-3">Order</th><th className="p-3">Method</th><th className="p-3">Txn ID</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 text-xs">{p.orderId?.slice(0, 8)}...</td>
                  <td className="p-3">{p.method}</td>
                  <td className="p-3">{p.transactionId}</td>
                  <td className="p-3">৳{p.amount}</td>
                  <td className="p-3">
                    <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
