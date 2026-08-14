import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { logAdminAction } from "../../services/adminLogService";
import { Pencil, Trash2 } from "lucide-react";

const empty = { name: "", slug: "", image: "", description: "", parentId: "", sortOrder: 0, active: true };

export default function AdminCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "categories"));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setCategories(docs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(cat) {
    setForm({ ...empty, ...cat });
    setEditingId(cat.id);
  }

  function cancelEdit() {
    setForm(empty);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sortOrder: Number(form.sortOrder) || 0,
    };
    if (editingId) {
      await updateDoc(doc(db, "categories", editingId), payload);
      await logAdminAction(user.uid, "category_edited", editingId);
    } else {
      const ref = await addDoc(collection(db, "categories"), { ...payload, createdAt: serverTimestamp() });
      await logAdminAction(user.uid, "category_added", ref.id);
    }
    cancelEdit();
    load();
  }

  async function handleDelete(id) {
    if (!confirm("এই ক্যাটাগরিটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "categories", id));
    await logAdminAction(user.uid, "category_deleted", id);
    load();
  }

  async function toggleActive(cat) {
    await updateDoc(doc(db, "categories", cat.id), { active: !cat.active });
    load();
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Categories</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-card p-4 mb-6 flex flex-col gap-3 max-w-lg">
        <p className="font-medium text-sm">{editingId ? "Edit Category" : "Add Category"}</p>
        <input required placeholder="Name" className="border rounded p-2.5 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input placeholder="Slug (auto if empty)" className="border rounded p-2.5 text-sm" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        <input placeholder="Image URL" className="border rounded p-2.5 text-sm" value={form.image} onChange={(e) => update("image", e.target.value)} />
        <textarea placeholder="Description" className="border rounded p-2.5 text-sm" value={form.description} onChange={(e) => update("description", e.target.value)} />
        <select className="border rounded p-2.5 text-sm" value={form.parentId} onChange={(e) => update("parentId", e.target.value)}>
          <option value="">No parent (top-level)</option>
          {categories.filter((c) => c.id !== editingId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
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
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-3">Name</th><th className="p-3">Parent</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{categories.find((p) => p.id === c.parentId)?.name || "-"}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(c)} className={`px-2 py-0.5 rounded text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
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
