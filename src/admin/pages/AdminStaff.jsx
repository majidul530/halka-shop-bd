import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";

const ROLES = ["superadmin", "product_manager", "order_manager", "support"];

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", role: "support" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "admins"));
    setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Creating a brand-new staff LOGIN (not just granting a role to an
  // existing account) needs its own Firebase Auth user. Since we have no
  // Cloud Function admin SDK, we do this with a throwaway secondary
  // Firebase app instance so it doesn't sign the current superadmin out.
  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const secondaryApp = initializeApp(auth.app.options, "staff-creator-" + Date.now());
      const { getAuth } = await import("firebase/auth");
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      await setDoc(doc(db, "admins", cred.user.uid), { role: form.role, email: form.email });
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);
      setForm({ email: "", password: "", role: "support" });
      load();
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে — নিচের লিস্টে UID দিয়ে role assign করুন।" : "স্টাফ তৈরি ব্যর্থ হয়েছে।");
    } finally {
      setCreating(false);
    }
  }

  async function updateRole(uid, role) {
    await setDoc(doc(db, "admins", uid), { role }, { merge: true });
    load();
  }

  async function removeStaff(uid) {
    if (!confirm("এই স্টাফের admin access বাতিল করতে চান?")) return;
    await deleteDoc(doc(db, "admins", uid));
    load();
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Staff & Roles</h1>

      <form onSubmit={handleCreate} className="bg-white border rounded-card p-4 mb-6 flex flex-col gap-3 max-w-lg">
        <p className="font-medium text-sm">Add New Staff (creates a login)</p>
        <input required type="email" placeholder="Staff email" className="border rounded p-2.5 text-sm" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input required type="password" placeholder="Temporary password (min 6 chars)" className="border rounded p-2.5 text-sm" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <select className="border rounded p-2.5 text-sm" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={creating} className="bg-primary text-white rounded-full py-2 px-4 text-sm disabled:opacity-50">
          {creating ? "Creating..." : "Create Staff"}
        </button>
      </form>

      <p className="text-xs text-slate-500 mb-2">
        চাইলে কাস্টমার হিসেবে আগে থেকেই রেজিস্টার করা কারো UID (Firebase Authentication থেকে) কপি করে নিচে সরাসরি role assign করতে পারেন।
      </p>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-3">UID</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Action</th></tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 text-xs">{s.id.slice(0, 10)}...</td>
                  <td className="p-3">{s.email || "-"}</td>
                  <td className="p-3">
                    <select value={s.role} onChange={(e) => updateRole(s.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => removeStaff(s.id)} className="text-red-500 text-xs">Remove</button>
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
