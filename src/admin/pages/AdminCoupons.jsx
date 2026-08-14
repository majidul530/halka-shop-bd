import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { logAdminAction } from "../../services/adminLogService";
import { Pencil, Trash2 } from "lucide-react";

const empty = { code: "", type: "percentage", value: 0, minOrder: 0, maxDiscount: "", expiry: "", usageLimit: "", perUserLimit: "", active: true };

export default function AdminCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "coupons"));
    setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(c) {
    setForm({
      ...empty, ...c,
      expiry: c.expiry ? new Date(c.expiry.toMillis()).toISOString().slice(0, 10) : "",
    });
    setEditingId(c.id);
  }

  function cancelEdit() {
    setForm(empty);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      expiry: form.expiry ? Timestamp.fromDate(new Date(form.expiry)) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      usedCount: editingId ? form.usedCount ?? 0 : 0,
      active: form.active,
    };
    if (editingId) {
      await updateDoc(doc(db, "coupons", editingId), payload);
      await logAdminAction(user.uid, "coupon_edited", editingId);
    } else {
      const ref = await addDoc(collection(db, "coupons"), { ...payload, createdAt: serverTimestamp() });
      await logAdminAction(user.uid, "coupon_created", ref.id);
    }
    cancelEdit();
    load();
  }

  async function handleDelete(id) {
    if (!confirm("এই কুপনটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "coupons", id));
    await logAdminAction(user.uid, "coupon_deleted", id);
    load();
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Coupons</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-card p-4 mb-6 flex flex-col gap-3 max-w-lg">
        <p className="font-medium text-sm">{editingId ? "Edit Coupon" : "Add Coupon"}</p>
        <input required placeholder="Code (e.g. EID20)" className="border rounded p-2.5 text-sm" value={form.code} onChange={(e) => update("code", e.target.value)} />
        <select className="border rounded p-2.5 text-sm" value={form.type} onChange={(e) => update("type", e.target.value)}>
          <option value="percentage">Percentage discount</option>
          <option value="fixed">Fixed amount discount</option>
        </select>
        <input required type="number" placeholder={form.type === "percentage" ? "Discount %" : "Discount ৳"} className="border rounded p-2.5 text-sm" value={form.value} onChange={(e) => update("value", e.target.value)} />
        <input type="number" placeholder="Minimum order amount" className="border rounded p-2.5 text-sm" value={form.minOrder} onChange={(e) => update("minOrder", e.target.value)} />
        {form.type === "percentage" && (
          <input type="number" placeholder="Max discount cap (optional)" className="border rounded p-2.5 text-sm" value={form.maxDiscount} onChange={(e) => update("maxDiscount", e.target.value)} />
        )}
        <input type="date" placeholder="Expiry date" className="border rounded p-2.5 text-sm" value={form.expiry} onChange={(e) => update("expiry", e.target.value)} />
        <input type="number" placeholder="Total usage limit (optional)" className="border rounded p-2.5 text-sm" value={form.usageLimit} onChange={(e) => update("usageLimit", e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} /> Active
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary text-white rounded-full py-2 px-4 text-sm">{editingId ? "Update" : "Add"}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="border rounded-full py-2 px-4 text-sm">Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Used</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.code}</td>
                  <td className="p-3">{c.type === "percentage" ? `${c.value}%` : `৳${c.value}`}</td>
                  <td className="p-3">{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => startEdit(c)}><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id)}><Trash2 size={16} className="text-red-500" /></button>
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
