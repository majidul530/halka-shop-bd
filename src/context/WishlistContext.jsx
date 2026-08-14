import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    if (user) getWishlist(user.uid).then(setProductIds);
    else setProductIds([]);
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) return false; // caller should redirect to login
    if (productIds.includes(productId)) {
      await removeFromWishlist(user.uid, productId);
      setProductIds((prev) => prev.filter((id) => id !== productId));
    } else {
      await addToWishlist(user.uid, productId);
      setProductIds((prev) => [...prev, productId]);
    }
    return true;
  }, [user, productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
