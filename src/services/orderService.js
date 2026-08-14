import {
  collection, doc, runTransaction, serverTimestamp, addDoc,
  query, where, getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { validateCoupon } from "./couponService";
import { calculateShipping } from "./shippingService";

/**
 * Places an order without a Cloud Function.
 *
 * IMPORTANT (free-tier limitation, be upfront with the team about this):
 * Real e-commerce systems verify price/stock/coupon server-side so a
 * tampered client request can't create a cheap order. Without Cloud
 * Functions, we approximate that by:
 *   1. Re-reading each product's CURRENT price/stock from Firestore here
 *      (ignoring whatever price the cart UI displayed), and
 *   2. Doing the stock decrement + order creation inside a single
 *      Firestore transaction, so two customers can't both buy the last
 *      unit and stock can't go negative.
 * This is best-effort, not a full trust boundary — a sufficiently
 * determined attacker with Firestore access could still craft a bad
 * write. Closing that gap fully requires Cloud Functions (Blaze plan).
 */
export async function placeOrder({ userId, cartItems, address, paymentMethod, couponCode }) {
  if (!cartItems.length) throw new Error("Cart is empty");

  return runTransaction(db, async (tx) => {
    let subtotal = 0;
    const verifiedItems = [];
    const productRefs = [];

    // Step 1: re-read live product data, never trust cart-stored price.
    for (const item of cartItems) {
      const pRef = doc(db, "products", item.productId);
      const pSnap = await tx.get(pRef);
      if (!pSnap.exists() || !pSnap.data().active) {
        throw new Error(`Product unavailable: ${item.name}`);
      }
      const product = pSnap.data();

      let stock = product.stock;
      let price = product.salePrice ?? product.price;
      let variant = null;
      if (item.variantId) {
        variant = (product.variants || []).find((v) => v.id === item.variantId);
        if (!variant) throw new Error(`Variant unavailable: ${item.name}`);
        stock = variant.stock;
        price = variant.price;
      }

      if (stock < item.qty) {
        throw new Error(`Not enough stock for ${item.name} (only ${stock} left)`);
      }

      subtotal += price * item.qty;
      verifiedItems.push({ ...item, price, verifiedStock: stock, productRef: pRef, product, variant });
      productRefs.push(pRef);
    }

    // Step 2: coupon (re-validated against live rules, not client-supplied discount)
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await validateCoupon(couponCode, subtotal, userId);
      discount = coupon.discountAmount;
    }

    // Step 3: shipping (admin-configured table, not client input)
    const shippingCharge = await calculateShipping(address, subtotal);

    const total = Math.max(subtotal - discount + shippingCharge, 0);

    // Step 4: create the order doc
    const orderRef = doc(collection(db, "orders"));
    tx.set(orderRef, {
      userId,
      items: verifiedItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        image: i.image,
        price: i.price,
        qty: i.qty,
      })),
      address,
      subtotal,
      discount,
      couponCode: coupon?.code || null,
      shippingCharge,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "COD" : "Pending",
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    // Step 5: decrement stock inside the same transaction
    for (const i of verifiedItems) {
      if (i.variantId) {
        const newVariants = i.product.variants.map((v) =>
          v.id === i.variantId ? { ...v, stock: v.stock - i.qty } : v
        );
        tx.update(i.productRef, { variants: newVariants });
      } else {
        tx.update(i.productRef, { stock: i.verifiedStock - i.qty });
      }
    }

    return { orderId: orderRef.id, total };
  });
}

export async function getCustomerOrders(userId) {
  // Equality-only filter (no orderBy in the Firestore call) so this doesn't
  // need a composite index — sorted client-side instead. See productService.js
  // for the same pattern with more detail.
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  orders.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return orders;
}

export async function submitManualPayment({ orderId, userId, method, transactionId, amount }) {
  return addDoc(collection(db, "payments"), {
    orderId, userId, method, transactionId, amount,
    status: "Pending",
    createdAt: serverTimestamp(),
  });
}
