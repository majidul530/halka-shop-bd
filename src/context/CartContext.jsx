import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_KEY = "guest_cart_v1";

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  // Load cart whenever auth state settles (guest -> localStorage, user -> Firestore)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (user) {
        const snap = await getDoc(doc(db, "carts", user.uid));
        if (!cancelled) setItems(snap.exists() ? snap.data().items || [] : []);
      } else {
        if (!cancelled) setItems(loadGuestCart());
      }
      if (!cancelled) setReady(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const persist = useCallback(async (next) => {
    setItems(next);
    if (user) {
      await setDoc(doc(db, "carts", user.uid), { items: next, updatedAt: Date.now() });
    } else {
      saveGuestCart(next);
    }
  }, [user]);

  function addItem(product, variant, qty = 1) {
    const key = variant ? `${product.id}_${variant.id}` : product.id;
    const existing = items.find((i) => i.key === key);
    let next;
    if (existing) {
      next = items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
    } else {
      next = [
        ...items,
        {
          key,
          productId: product.id,
          variantId: variant?.id || null,
          name: product.name,
          image: product.images?.[0] || "",
          price: variant?.price ?? product.salePrice ?? product.price,
          qty,
        },
      ];
    }
    persist(next);
  }

  function updateQty(key, qty) {
    if (qty <= 0) return removeItem(key);
    persist(items.map((i) => (i.key === key ? { ...i, qty } : i)));
  }

  function removeItem(key) {
    persist(items.filter((i) => i.key !== key));
  }

  function clearCart() {
    persist([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, ready, addItem, updateQty, removeItem, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
