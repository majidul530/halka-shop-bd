import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function getApprovedReviews(productId) {
  // Equality-only filters, no orderBy — no composite index needed.
  const q = query(collection(db, "reviews"), where("productId", "==", productId), where("status", "==", "approved"));
  const snap = await getDocs(q);
  const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  reviews.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return reviews;
}

// Per the product spec, only a customer with a Delivered order containing
// this product may leave a review.
export async function canReviewProduct(userId, productId) {
  const q = query(collection(db, "orders"), where("userId", "==", userId), where("status", "==", "Delivered"));
  const snap = await getDocs(q);
  return snap.docs.some((d) => (d.data().items || []).some((item) => item.productId === productId));
}

export async function submitReview({ productId, userId, userName, rating, comment, image }) {
  return addDoc(collection(db, "reviews"), {
    productId, userId, userName, rating, comment, image: image || null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}
