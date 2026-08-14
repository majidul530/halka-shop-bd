import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginCustomer, loginWithGoogle } from "../firebase/auth";

export default function Login() {
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
      await loginCustomer(email, password);
      navigate("/account");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/account");
    } catch {
      setError("Google sign-in failed.");
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="font-bold text-lg mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input required type="email" placeholder="Email" className="border rounded p-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className="border rounded p-2.5 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-primary text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <button onClick={handleGoogle} className="w-full border rounded-full py-2.5 text-sm font-medium mt-3">
        Continue with Google
      </button>
      <p className="text-sm text-center mt-4">
        No account? <Link to="/register" className="text-primary font-medium">Register</Link>
      </p>
    </div>
  );
}
