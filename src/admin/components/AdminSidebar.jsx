import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, CreditCard, Tag, Star, Image, Truck, Building2, BarChart3, Shield, Bell, Settings, FileClock, Menu } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/shipping", label: "Shipping", icon: Truck },
  { to: "/admin/suppliers", label: "Suppliers", icon: Building2 },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/staff", label: "Staff & Roles", icon: Shield },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/logs", label: "Activity Logs", icon: FileClock },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="md:hidden fixed top-3 left-3 z-50 bg-white border rounded p-2" onClick={() => setOpen((v) => !v)}>
        <Menu size={20} />
      </button>
      <aside className={`bg-white border-r w-60 shrink-0 fixed md:static top-0 bottom-0 z-40 overflow-y-auto transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 font-bold text-primary">Admin Panel</div>
        <nav className="flex flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? "bg-primary/10 text-primary font-medium" : "text-slate-600"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
