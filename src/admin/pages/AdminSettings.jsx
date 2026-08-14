import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const empty = {
  siteName: "", logo: "", favicon: "", phone: "", email: "", address: "",
  facebook: "", instagram: "", youtube: "", telegram: "", whatsapp: "",
  bkashEnabled: true, bkashNumber: "", bkashInstructions: "",
  nagadEnabled: true, nagadNumber: "", nagadInstructions: "",
  metaTitle: "", metaDescription: "",
  maintenanceMode: false,
};

export default function AdminSettings() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists()) setForm({ ...empty, ...snap.data() });
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
    await setDoc(doc(db, "settings", "general"), form);
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="font-bold text-lg mb-4">Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">

        <div className="bg-white border rounded-card p-4 flex flex-col gap-3">
          <p className="font-medium text-sm">General</p>
          <input placeholder="Website name" className="border rounded p-2.5 text-sm" value={form.siteName} onChange={(e) => update("siteName", e.target.value)} />
          <input placeholder="Logo URL" className="border rounded p-2.5 text-sm" value={form.logo} onChange={(e) => update("logo", e.target.value)} />
          <input placeholder="Favicon URL" className="border rounded p-2.5 text-sm" value={form.favicon} onChange={(e) => update("favicon", e.target.value)} />
          <input placeholder="Phone" className="border rounded p-2.5 text-sm" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <input placeholder="Email" className="border rounded p-2.5 text-sm" value={form.email} onChange={(e) => update("email", e.target.value)} />
          <textarea placeholder="Address" className="border rounded p-2.5 text-sm" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="bg-white border rounded-card p-4 flex flex-col gap-3">
          <p className="font-medium text-sm">Social Links</p>
          <input placeholder="Facebook URL" className="border rounded p-2.5 text-sm" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
          <input placeholder="Instagram URL" className="border rounded p-2.5 text-sm" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
          <input placeholder="YouTube URL" className="border rounded p-2.5 text-sm" value={form.youtube} onChange={(e) => update("youtube", e.target.value)} />
          <input placeholder="Telegram URL" className="border rounded p-2.5 text-sm" value={form.telegram} onChange={(e) => update("telegram", e.target.value)} />
          <input placeholder="WhatsApp number (Support বাটনের জন্য, যেমন: 8801XXXXXXXXX)" className="border rounded p-2.5 text-sm" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
        </div>

        <div className="bg-white border rounded-card p-4 flex flex-col gap-3">
          <p className="font-medium text-sm">Payment Methods</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bkashEnabled} onChange={(e) => update("bkashEnabled", e.target.checked)} /> Enable bKash</label>
          <input placeholder="bKash number" className="border rounded p-2.5 text-sm" value={form.bkashNumber} onChange={(e) => update("bkashNumber", e.target.value)} />
          <input placeholder="bKash instructions" className="border rounded p-2.5 text-sm" value={form.bkashInstructions} onChange={(e) => update("bkashInstructions", e.target.value)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.nagadEnabled} onChange={(e) => update("nagadEnabled", e.target.checked)} /> Enable Nagad</label>
          <input placeholder="Nagad number" className="border rounded p-2.5 text-sm" value={form.nagadNumber} onChange={(e) => update("nagadNumber", e.target.value)} />
          <input placeholder="Nagad instructions" className="border rounded p-2.5 text-sm" value={form.nagadInstructions} onChange={(e) => update("nagadInstructions", e.target.value)} />
        </div>

        <div className="bg-white border rounded-card p-4 flex flex-col gap-3">
          <p className="font-medium text-sm">SEO</p>
          <input placeholder="Meta title" className="border rounded p-2.5 text-sm" value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
          <textarea placeholder="Meta description" className="border rounded p-2.5 text-sm" value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
        </div>

        <div className="bg-white border rounded-card p-4 flex flex-col gap-3">
          <p className="font-medium text-sm">Maintenance</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.maintenanceMode} onChange={(e) => update("maintenanceMode", e.target.checked)} /> Enable maintenance mode</label>
        </div>

        <button type="submit" disabled={saving} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <p className="text-green-600 text-sm">Saved!</p>}
      </form>
    </div>
  );
}
