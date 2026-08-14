import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Shipping config lives in a single settings doc so this is one read,
// not a query, keeping it cheap on the free tier.
export async function calculateShipping(address, subtotal) {
  const snap = await getDoc(doc(db, "settings", "shipping"));
  if (!snap.exists()) return 0;

  const cfg = snap.data();
  if (cfg.freeShippingThreshold && subtotal >= cfg.freeShippingThreshold) return 0;

  const insideCityAreas = cfg.insideCityAreas || []; // e.g. ["Dhaka"]
  const isInsideCity = insideCityAreas.includes(address?.district);

  return isInsideCity ? (cfg.insideCityCharge ?? 0) : (cfg.outsideCityCharge ?? 0);
}
