import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Menu, User, X, Home, Store, LayoutGrid, Tag, Truck } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const menuLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/offers", label: "Offers", icon: Tag },
  { to: "/track-order", label: "Track Order", icon: Truck },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [site, setSite] = useState({ siteName: "", logo: "" });
  const { items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists()) setSite(snap.data());
    });
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  }

  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          {site.logo ? (
            <img src={site.logo} alt={site.siteName || "Logo"} className="h-8 max-w-[120px] object-contain" />
          ) : (
            <span className="font-extrabold text-xl text-primary tracking-tight">{site.siteName || "Shop"}</span>
          )}
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="প্রোডাক্ট খুঁজুন..."
            className="w-full bg-surface rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-400"><Search size={18} /></button>
        </form>

        <div className="ml-auto flex items-center gap-5">
          <Link to="/wishlist" aria-label="Wishlist" className="text-slate-600 hover:text-primary"><Heart size={22} /></Link>
          <Link to="/cart" className="relative text-slate-600 hover:text-primary" aria-label="Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to={user ? "/account" : "/login"} aria-label="Account" className="text-slate-600 hover:text-primary"><User size={22} /></Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3 relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="প্রোডাক্ট খুঁজুন..."
          className="w-full bg-surface rounded-full px-4 py-2.5 text-sm outline-none"
        />
        <button type="submit" className="absolute right-7 top-2 text-slate-400"><Search size={18} /></button>
      </form>

      <nav className="hidden md:flex gap-6 px-4 pb-3 text-sm font-medium text-slate-600">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <Link to="/categories" className="hover:text-primary">Categories</Link>
        <Link to="/offers" className="hover:text-primary">Offers</Link>
        <Link to="/track-order" className="hover:text-primary">Track Order</Link>
      </nav>

      {/* Mobile menu: bottom sheet instead of a top dropdown */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold">Menu</p>
              <button onClick={() => setMenuOpen(false)} aria-label="Close"><X size={22} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {menuLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 bg-surface rounded-card py-4 text-xs font-medium text-slate-700 active:bg-primary/10"
                >
                  <Icon size={22} className="text-primary" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
