import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/config";

export async function getWishlist(userId) {
  const snap = await getDoc(doc(db, "wishlists", userId));
  return snap.exists() ? snap.data().productIds || [] : [];
}

export async function addToWishlist(userId, productId) {
  await setDoc(doc(db, "wishlists", userId), { productIds: arrayUnion(productId) }, { merge: true });
}

export async function removeFromWishlist(userId, productId) {
  await setDoc(doc(db, "wishlists", userId), { productIds: arrayRemove(productId) }, { merge: true });
}
