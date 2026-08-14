import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Bell } from "lucide-react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "notifications"));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    setNotifications(docs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Notifications</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-slate-400">কোনো নোটিফিকেশন নেই।</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`bg-white border rounded-card p-3 flex items-start gap-3 ${!n.read ? "border-primary" : ""}`}>
              <Bell size={16} className={!n.read ? "text-primary" : "text-slate-300"} />
              <div>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-slate-400">{n.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
