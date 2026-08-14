import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This gate is a UX convenience only. The real enforcement is in
// firestore.rules (hasAdminRole checks) — even if someone bypasses this
// component, every admin read/write still gets rejected by Firestore.
export default function AdminRoute({ children, allow }) {
  const { user, adminRole, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !adminRole) return <Navigate to="/admin/login" replace />;
  if (allow && !allow.includes(adminRole)) return <Navigate to="/admin" replace />;
  return children;
}
