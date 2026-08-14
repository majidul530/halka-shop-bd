import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer } from "../../firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await loginCustomer(email, password);
      // Confirm this account actually has an /admins/{uid} doc before
      // routing into the panel. Firestore rules enforce this too — this
      // is just a fast UX check.
      const snap = await getDoc(doc(db, "admins", cred.user.uid));
      if (!snap.exists()) {
        setError("This account does not have admin access.");
        await auth.signOut();
        return;
      }
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-card p-6 w-full max-w-sm">
        <h1 className="font-bold text-lg mb-4">Admin Login</h1>
        <div className="flex flex-col gap-3">
          <input required type="email" placeholder="Admin email" className="border rounded p-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" className="border rounded p-2.5 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
