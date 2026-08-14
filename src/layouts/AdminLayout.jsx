import { Outlet } from "react-router-dom";
import AdminSidebar from "../admin/components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 md:ml-0 pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
