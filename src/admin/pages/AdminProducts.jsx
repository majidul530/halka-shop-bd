import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { deleteProduct, updateProduct } from "../../services/productService";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Copy } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(p) {
    await updateProduct(p.id, { active: !p.active });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product permanently?")) return;
    await deleteProduct(id);
    load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg">Products</h1>
        <Link to="/admin/products/new" className="bg-primary text-white px-4 py-2 rounded-full text-sm">+ Add Product</Link>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="bg-white border rounded-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">৳{p.salePrice ?? p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(p)} className={`px-2 py-0.5 rounded text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/admin/products/${p.id}`}><Pencil size={16} /></Link>
                    <button onClick={() => handleDelete(p.id)}><Trash2 size={16} className="text-red-500" /></button>
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
