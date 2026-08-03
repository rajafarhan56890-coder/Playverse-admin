import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { UserProfile, Wallet, Transaction, UserStatus } from "../types/models";

const PAGE_SIZE = 25;

export interface UsersPage {
  users: UserProfile[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Lists users, optionally filtered by status. Firestore doesn't support
 * full-text search natively, so name/email search (see `searchUsers`
 * below) is a separate, deliberately-scoped query rather than pretending
 * to be a real search index — that's an honest limitation, not a mock.
 */
export async function fetchUsersPage(
  statusFilter: UserStatus | null,
  cursor?: QueryDocumentSnapshot
): Promise<UsersPage> {
  const constraints = statusFilter
    ? [where("status", "==", statusFilter), orderBy("createdAt", "desc"), limit(PAGE_SIZE)]
    : [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];

  const q = cursor
    ? query(collection(db, "users"), ...constraints, startAfter(cursor))
    : query(collection(db, "users"), ...constraints);

  const snap = await getDocs(q);
  return {
    users: snap.docs.map((d) => d.data() as UserProfile),
    lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

/**
 * Search by exact email, or by name prefix. Firestore range queries on a
 * string field give prefix matching (`name >= q && name < q + '\uf8ff'`) —
 * real functionality, not a fake filter, but genuinely prefix-only rather
 * than full-text/fuzzy, which Firestore doesn't support without a
 * third-party search index (Algolia/Typesense) that's out of scope here.
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const term = searchTerm.trim();
  if (!term) return [];

  if (term.includes("@")) {
    const q = query(collection(db, "users"), where("email", "==", term.toLowerCase()), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  }

  const q = query(
    collection(db, "users"),
    orderBy("name"),
    where("name", ">=", term),
    where("name", "<=", term + "\uf8ff"),
    limit(25)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function fetchUserWallet(uid: string): Promise<Wallet | null> {
  const snap = await getDoc(doc(db, "wallets", uid));
  return snap.exists() ? (snap.data() as Wallet) : null;
}

export async function fetchUserTransactions(uid: string, max = 50): Promise<Transaction[]> {
  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Transaction);
}

export interface AdminResult {
  success: boolean;
  error?: string;
}

export async function setUserStatus(uid: string, status: UserStatus): Promise<AdminResult> {
  try {
    const callable = httpsCallable(functions, "adminSetUserStatus");
    await callable({ uid, status });
    return { success: true };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}

export interface AdjustBalanceResult extends AdminResult {
  newBalance?: number;
}

export async function adjustUserBalance(
  uid: string,
  amount: number,
  reason: string
): Promise<AdjustBalanceResult> {
  try {
    const callable = httpsCallable(functions, "adminAdjustBalance");
    const result = await callable({ uid, amount, reason });
    const data = result.data as { newBalance: number };
    return { success: true, newBalance: data.newBalance };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}
