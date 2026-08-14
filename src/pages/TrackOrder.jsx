import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const STATUS_STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(id) {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const snap = await getDoc(doc(db, "orders", id));
      if (!snap.exists()) {
        setError("Order not found.");
        setOrder(null);
      } else {
        setOrder({ id: snap.id, ...snap.data() });
      }
    } catch {
      setError("You don't have permission to view this order. Please log in with the account used to place it.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("orderId")) lookup(searchParams.get("orderId"));
  }, [searchParams]);

  const isTerminalBad = order && ["Cancelled", "Returned", "Refunded"].includes(order.status);
  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg mb-4">Track Order</h1>
      <div className="flex gap-2 mb-4">
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Enter order ID" className="border rounded p-2.5 text-sm flex-1" />
        <button onClick={() => lookup(orderId)} className="bg-primary text-white px-4 rounded text-sm">{loading ? "..." : "Track"}</button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {order && (
        <div className="bg-white border rounded-card p-4">
          <p className="text-sm text-slate-500">Order ID: {order.id}</p>
          <p className="font-bold mt-1">৳{order.total}</p>

          {isTerminalBad ? (
            <p className="mt-4 text-red-500 font-medium">{order.status}</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? "bg-primary" : "bg-slate-200"}`} />
                  <span className={`text-sm ${i <= currentStepIndex ? "font-medium" : "text-slate-400"}`}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
