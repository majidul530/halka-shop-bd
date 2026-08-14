import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { logAdminAction } from "../../services/adminLogService";
import { Pencil, Trash2 } from "lucide-react";

const empty = { title: "", subtitle: "", image: "", buttonText: "", buttonUrl: "", sortOrder: 0, active: true };

export default function AdminBanners() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "banners"));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setBanners(docs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(b) {
    setForm({ ...empty, ...b });
    setEditingId(b.id);
  }

  function cancelEdit() {
    setForm(empty);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    if (editingId) {
      await updateDoc(doc(db, "banners", editingId), payload);
      await logAdminAction(user.uid, "banner_edited", editingId);
    } else {
      const ref = await addDoc(collection(db, "banners"), { ...payload, createdAt: serverTimestamp() });
      await logAdminAction(user.uid, "banner_added", ref.id);
    }
    cancelEdit();
    load();
  }

  async function handleDelete(id) {
    if (!confirm("এই ব্যানারটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "banners", id));
    await logAdminAction(user.uid, "banner_deleted", id);
    load();
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Banners</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-card p-4 mb-6 flex flex-col gap-3 max-w-lg">
        <p className="font-medium text-sm">{editingId ? "Edit Banner" : "Add Banner"}</p>
        <input required placeholder="Image URL" className="border rounded p-2.5 text-sm" value={form.image} onChange={(e) => update("image", e.target.value)} />
        <input required placeholder="Title" className="border rounded p-2.5 text-sm" value={form.title} onChange={(e) => update("title", e.target.value)} />
        <input placeholder="Subtitle" className="border rounded p-2.5 text-sm" value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
        <input placeholder="Button text" className="border rounded p-2.5 text-sm" value={form.buttonText} onChange={(e) => update("buttonText", e.target.value)} />
        <input placeholder="Button URL (e.g. /shop)" className="border rounded p-2.5 text-sm" value={form.buttonUrl} onChange={(e) => update("buttonUrl", e.target.value)} />
        <input type="number" placeholder="Sort order" className="border rounded p-2.5 text-sm" value={form.sortOrder} onChange={(e) => update("sortOrder", e.target.value)} />
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
        <div className="flex flex-col gap-2">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border rounded-card p-3 flex items-center gap-3">
              <img src={b.image} alt="" className="w-20 h-12 rounded object-cover bg-slate-100" />
              <div className="flex-1">
                <p className="text-sm font-medium">{b.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${b.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                  {b.active ? "Active" : "Inactive"}
                </span>
              </div>
              <button onClick={() => startEdit(b)}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(b.id)}><Trash2 size={16} className="text-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
