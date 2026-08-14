import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct, getProductById } from "../../services/productService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { X } from "lucide-react";

const empty = {
  name: "", slug: "", sku: "", categoryId: "", brand: "",
  shortDescription: "", fullDescription: "", images: [], price: 0, salePrice: "",
  stock: 0, lowStockThreshold: 5, weight: "", tags: "", featured: false,
  bestSeller: false, newArrival: false, active: true, variants: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "categories")).then((snap) =>
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    if (isEdit) getProductById(id).then((p) => p && setForm({ ...empty, ...p }));
  }, [id]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addImageUrl() {
    if (!imageUrlInput.trim()) return;
    update("images", [...form.images, imageUrlInput.trim()]);
    setImageUrlInput("");
  }

  function removeImage(index) {
    update("images", form.images.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
    };
    try {
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h1 className="font-bold text-lg mb-4">{isEdit ? "Edit Product" : "Add Product"}</h1>

      <div className="flex flex-col gap-3 bg-white border rounded-card p-4">
        <input required placeholder="Product name" className="border rounded p-2.5 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input placeholder="SKU" className="border rounded p-2.5 text-sm" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
        <select className="border rounded p-2.5 text-sm" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Brand" className="border rounded p-2.5 text-sm" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        <textarea placeholder="Short description" className="border rounded p-2.5 text-sm" value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
        <textarea placeholder="Full description" className="border rounded p-2.5 text-sm" rows={4} value={form.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <input required type="number" placeholder="Regular price" className="border rounded p-2.5 text-sm" value={form.price} onChange={(e) => update("price", e.target.value)} />
          <input type="number" placeholder="Sale price (optional)" className="border rounded p-2.5 text-sm" value={form.salePrice} onChange={(e) => update("salePrice", e.target.value)} />
          <input required type="number" placeholder="Stock" className="border rounded p-2.5 text-sm" value={form.stock} onChange={(e) => update("stock", e.target.value)} />
          <input type="number" placeholder="Low stock threshold" className="border rounded p-2.5 text-sm" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Images (URL)</p>
          <p className="text-xs text-slate-500 mb-2">
            আমরা Firebase Storage ব্যবহার করছি না (ফ্রি প্ল্যানে সেটা নেই), তাই ছবি প্রথমে{" "}
            <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-primary underline">imgbb.com</a>-এ (সম্পূর্ণ ফ্রি, লগইন ছাড়াই) আপলোড করে সেখান থেকে "Direct link" কপি করে নিচে বসান।
          </p>
          <div className="flex gap-2">
            <input placeholder="https://i.ibb.co/..." className="border rounded p-2.5 text-sm flex-1" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} />
            <button type="button" onClick={addImageUrl} className="bg-primary text-white rounded px-4 text-sm">Add</button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {form.images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-16 h-16 rounded object-cover border" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.bestSeller} onChange={(e) => update("bestSeller", e.target.checked)} /> Best seller</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.newArrival} onChange={(e) => update("newArrival", e.target.checked)} /> New arrival</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} /> Active</label>
        </div>

        <button type="submit" disabled={saving} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
