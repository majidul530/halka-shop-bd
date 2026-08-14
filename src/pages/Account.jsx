import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../services/orderService";
import { logout } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Package, Clock, Wallet, ChevronRight, LogOut, Heart, MapPin } from "lucide-react";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
  Returned: "bg-red-100 text-red-600",
  Refunded: "bg-slate-200 text-slate-500",
};

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getCustomerOrders(user.uid).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0);
  const pending = orders.filter((o) => !["Delivered", "Cancelled", "Returned"].includes(o.status)).length;
  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="pb-10">
      {/* Profile header */}
      <div className="bg-primary text-white px-4 pt-6 pb-8 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {initial}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.displayName || "Customer"}</p>
            <p className="text-sm text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stat cards, overlapping the header like a card row */}
      <div className="grid grid-cols-3 gap-2 px-4 -mt-5">
        <div className="bg-white rounded-card p-3 text-center shadow-sm">
          <Package size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{orders.length}</p>
          <p className="text-[11px] text-slate-500">Orders</p>
        </div>
        <div className="bg-white rounded-card p-3 text-center shadow-sm">
          <Clock size={16} className="mx-auto text-secondary mb-1" />
          <p className="text-lg font-bold">{pending}</p>
          <p className="text-[11px] text-slate-500">Pending</p>
        </div>
        <div className="bg-white rounded-card p-3 text-center shadow-sm">
          <Wallet size={16} className="mx-auto text-green-600 mb-1" />
          <p className="text-lg font-bold">৳{totalSpent}</p>
          <p className="text-[11px] text-slate-500">Spent</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 px-4 mt-4">
        <Link to="/wishlist" className="flex-1 bg-white border rounded-card p-3 flex items-center gap-2 text-sm font-medium">
          <Heart size={16} className="text-red-500" /> Wishlist
        </Link>
        <Link to="/track-order" className="flex-1 bg-white border rounded-card p-3 flex items-center gap-2 text-sm font-medium">
          <MapPin size={16} className="text-primary" /> Track Order
        </Link>
      </div>

      {/* Order history */}
      <div className="px-4 mt-6">
        <h2 className="font-bold mb-3">Order History</h2>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-card animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">এখনো কোনো অর্ডার নেই।</p>
            <Link to="/shop" className="text-primary text-sm font-medium mt-2 inline-block">কেনাকাটা শুরু করুন →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((o) => (
              <Link key={o.id} to={`/track-order?orderId=${o.id}`} className="bg-white border rounded-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 truncate">{o.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{o.createdAt?.toDate?.().toLocaleDateString?.() || ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">৳{o.total}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] || "bg-slate-100 text-slate-500"}`}>
                    {o.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="mx-4 mt-8 flex items-center gap-2 text-red-500 text-sm font-medium">
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}
