import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "adminLogs")).then((snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0));
      setLogs(docs.slice(0, 200));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Activity Logs</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-400">কোনো লগ নেই।</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-3">Admin</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">Time</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 text-xs">{l.adminId?.slice(0, 8)}...</td>
                  <td className="p-3">{l.action}</td>
                  <td className="p-3 text-xs">{l.target?.slice ? l.target.slice(0, 12) + "..." : l.target}</td>
                  <td className="p-3 text-xs">{l.timestamp?.toDate?.().toLocaleString?.() || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
