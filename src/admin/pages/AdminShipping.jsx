import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const empty = { insideCityAreas: "", insideCityCharge: 0, outsideCityCharge: 0, freeShippingThreshold: 0, codCharge: 0 };

export default function AdminShipping() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "shipping")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({ ...d, insideCityAreas: (d.insideCityAreas || []).join(", ") });
      }
      setLoading(false);
    });
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await setDoc(doc(db, "settings", "shipping"), {
      insideCityAreas: form.insideCityAreas.split(",").map((s) => s.trim()).filter(Boolean),
      insideCityCharge: Number(form.insideCityCharge) || 0,
      outsideCityCharge: Number(form.outsideCityCharge) || 0,
      freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
      codCharge: Number(form.codCharge) || 0,
    });
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Shipping Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-card p-4 flex flex-col gap-3 max-w-lg">
        <label className="text-sm font-medium">Inside-city districts (comma separated)</label>
        <input placeholder="e.g. Dhaka, Narayanganj" className="border rounded p-2.5 text-sm" value={form.insideCityAreas} onChange={(e) => update("insideCityAreas", e.target.value)} />

        <label className="text-sm font-medium">Inside-city delivery charge (৳)</label>
        <input type="number" className="border rounded p-2.5 text-sm" value={form.insideCityCharge} onChange={(e) => update("insideCityCharge", e.target.value)} />

        <label className="text-sm font-medium">Outside-city delivery charge (৳)</label>
        <input type="number" className="border rounded p-2.5 text-sm" value={form.outsideCityCharge} onChange={(e) => update("outsideCityCharge", e.target.value)} />

        <label className="text-sm font-medium">Free shipping threshold (৳, 0 = disabled)</label>
        <input type="number" className="border rounded p-2.5 text-sm" value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)} />

        <label className="text-sm font-medium">Cash on Delivery extra charge (৳, 0 = disabled)</label>
        <input type="number" className="border rounded p-2.5 text-sm" value={form.codCharge} onChange={(e) => update("codCharge", e.target.value)} />
        <p className="text-xs text-slate-500 -mt-2">কুরিয়ার সাধারণত COD অর্ডারে extra cash-collection fee নেয় — এখানে সেটা যোগ করলে COD সিলেক্ট করা কাস্টমারের total-এ এটা যোগ হবে।</p>

        <button type="submit" disabled={saving} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p className="text-green-600 text-sm">Saved!</p>}
      </form>
    </div>
  );
}
