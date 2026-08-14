import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function registerCustomer({ name, email, password, phone }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Create the matching /users/{uid} profile document.
  // Firestore rules restrict this write to request.auth.uid === uid only.
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    phone: phone || "",
    blocked: false,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export function loginCustomer(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  // First-time Google sign-in: ensure a /users profile exists.
  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      name: cred.user.displayName || "",
      email: cred.user.email || "",
      blocked: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cred.user;
}

export function logout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
