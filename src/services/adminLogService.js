import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export async function logAdminAction(adminUid, action, target) {
  try {
    await addDoc(collection(db, "adminLogs"), {
      adminId: adminUid,
      action,
      target,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Logging failures shouldn't block the actual admin action.
  }
}
