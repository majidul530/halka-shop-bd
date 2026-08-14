import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";

export async function validateCoupon(code, subtotal, userId) {
  const q = query(
    collection(db, "coupons"),
    where("code", "==", code.toUpperCase()),
    where("active", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Invalid or expired coupon");

  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };
  const now = Date.now();

  if (coupon.expiry && coupon.expiry.toMillis() < now) throw new Error("Coupon expired");
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new Error(`Minimum order ৳${coupon.minOrder} required for this coupon`);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  let discountAmount =
    coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  discountAmount = Math.min(discountAmount, subtotal);

  return { ...coupon, discountAmount };
}
