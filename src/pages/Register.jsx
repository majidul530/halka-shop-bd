import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerCustomer } from "../firebase/auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await registerCustomer(form);
      navigate("/account");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use" ? "This email is already registered." : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="font-bold text-lg mb-4">Create Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required placeholder="Full name" className="border rounded p-2.5 text-sm" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input required type="email" placeholder="Email" className="border rounded p-2.5 text-sm" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input placeholder="Phone" className="border rounded p-2.5 text-sm" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <input required type="password" placeholder="Password" className="border rounded p-2.5 text-sm" value={form.password} onChange={(e) => update("password", e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
      </p>
    </div>
  );
}
