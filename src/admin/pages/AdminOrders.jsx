import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  async function load() {
    setLoading(true);
    // Single-field orderBy with no `where` clause — doesn't need a composite index.
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(orderId, status) {
    await updateDoc(doc(db, "orders", orderId), { status });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-bold text-lg">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-400">No orders found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((o) => (
            <div key={o.id} className="bg-white border rounded-card p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium">{o.address?.fullName} — {o.address?.phone}</p>
                  <p className="text-xs text-slate-500">{o.id}</p>
                  <p className="text-xs text-slate-500">{o.createdAt?.toDate?.().toLocaleString?.() || ""}</p>
                </div>
                <p className="font-bold text-primary">৳{o.total}</p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className={`text-xs px-2 py-0.5 rounded ml-auto ${o.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {o.paymentMethod} · {o.paymentStatus}
                </span>
              </div>

              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="text-xs text-primary mt-2"
              >
                {expanded === o.id ? "Hide details" : "View details"}
              </button>

              {expanded === o.id && (
                <div className="mt-2 border-t pt-2 text-sm">
                  <p className="text-xs text-slate-500 mb-1">Items</p>
                  {o.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span>{item.name} × {item.qty}</span>
                      <span>৳{item.price * item.qty}</span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500 mt-2">Address</p>
                  <p className="text-xs">{o.address?.fullAddress}, {o.address?.upazila}, {o.address?.district}, {o.address?.division}</p>
                  {o.address?.note && <p className="text-xs text-slate-500 mt-1">Note: {o.address.note}</p>}
                  <div className="flex justify-between text-xs mt-2 pt-2 border-t">
                    <span>Subtotal</span><span>৳{o.subtotal}</span>
                  </div>
                  {o.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Discount {o.couponCode ? `(${o.couponCode})` : ""}</span><span>-৳{o.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>Shipping</span><span>৳{o.shippingCharge}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold mt-1">
                    <span>Total</span><span>৳{o.total}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
