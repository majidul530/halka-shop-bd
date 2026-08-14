import {
  collection, query, where, limit,
  getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const PAGE_SIZE = 12;
const BATCH_SIZE = 100; // how many active products we pull per fetch before sorting client-side

// Fetch active products, optionally filtered by category, sorted/paginated
// in JavaScript rather than in the Firestore query itself.
//
// Why: combining `where` with `orderBy` on a different field requires a
// Firestore "composite index" to be created manually first — otherwise the
// query throws and silently returns nothing. To keep setup mobile-friendly
// (no console index management required), this only uses equality filters
// in the Firestore call and does sorting/paging after the fetch. Trade-off:
// this reads up to BATCH_SIZE docs even if you only show 12, which is fine
// for a small/medium catalog but should move back to server-side
// orderBy+cursor (with the index created) once the catalog grows large.
export async function getProducts({ categoryId = null, page = 0, sort = "newest" } = {}) {
  const clauses = [where("active", "==", true)];
  if (categoryId) clauses.push(where("categoryId", "==", categoryId));

  const q = query(collection(db, "products"), ...clauses, limit(BATCH_SIZE));
  const snap = await getDocs(q);
  let products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const sorters = {
    newest: (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
    priceLow: (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
    priceHigh: (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
  };
  products.sort(sorters[sort] || sorters.newest);

  const start = page * PAGE_SIZE;
  const pageItems = products.slice(start, start + PAGE_SIZE);

  return {
    products: pageItems,
    nextPage: start + PAGE_SIZE < products.length ? page + 1 : null,
  };
}

export async function getProductBySlug(slug) {
  const q = query(collection(db, "products"), where("slug", "==", slug), where("active", "==", true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getProductById(id) {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ---- Admin CRUD ----
export function createProduct(data) {
  return addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
}

export function updateProduct(id, data) {
  return updateDoc(doc(db, "products", id), data);
}

export function deleteProduct(id) {
  return deleteDoc(doc(db, "products", id));
}
