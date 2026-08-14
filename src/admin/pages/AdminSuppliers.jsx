import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Pencil, Trash2 } from "lucide-react";

const empty = { name: "", contact: "", phone: "", email: "", address: "", notes: "" };

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, "suppliers"));
    setSuppliers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(s) {
    setForm({ ...empty, ...s });
    setEditingId(s.id);
  }

  function cancelEdit() {
    setForm(empty);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, "suppliers", editingId), form);
    } else {
      await addDoc(collection(db, "suppliers"), { ...form, createdAt: serverTimestamp() });
    }
    cancelEdit();
    load();
  }

  async function handleDelete(id) {
    if (!confirm("এই সাপ্লায়ার মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "suppliers", id));
    load();
  }

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Suppliers</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-card p-4 mb-6 flex flex-col gap-3 max-w-lg">
        <p className="font-medium text-sm">{editingId ? "Edit Supplier" : "Add Supplier"}</p>
        <input required placeholder="Supplier name" className="border rounded p-2.5 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input placeholder="Contact person" className="border rounded p-2.5 text-sm" value={form.contact} onChange={(e) => update("contact", e.target.value)} />
        <input placeholder="Phone" className="border rounded p-2.5 text-sm" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <input placeholder="Email" className="border rounded p-2.5 text-sm" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <textarea placeholder="Address" className="border rounded p-2.5 text-sm" value={form.address} onChange={(e) => update("address", e.target.value)} />
        <textarea placeholder="Notes" className="border rounded p-2.5 text-sm" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        <div className="flex gap-2">
          <button type="submit" className="bg-primary text-white rounded-full py-2 px-4 text-sm">{editingId ? "Update" : "Add"}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="border rounded-full py-2 px-4 text-sm">Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white border rounded-card p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-slate-500">{s.phone} · {s.email}</p>
              </div>
              <button onClick={() => startEdit(s)}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(s.id)}><Trash2 size={16} className="text-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
