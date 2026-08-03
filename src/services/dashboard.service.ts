import {
  collection,
  query,
  where,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  Timestamp,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalOffers: number;
  totalTasks: number;
  totalRewardsDistributed: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  totalTransactions: number;
}

/**
 * Every number here comes from a real Firestore aggregation query
 * (`getCountFromServer` / `getAggregateFromServer` with `sum()`) — these
 * run server-side and return a single number without downloading every
 * document, so the dashboard stays fast and cheap even as the platform
 * grows, and there is no cached/mock figure anywhere in this file.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const usersCol = collection(db, "users");
  const gamesCol = collection(db, "games");
  const offersCol = collection(db, "offers");
  const withdrawalsCol = collection(db, "withdrawals");
  const transactionsCol = collection(db, "transactions");

  const [
    totalUsersSnap,
    activeUsersSnap,
    totalGamesSnap,
    totalOffersSnap,
    totalTasksSnap,
    rewardsSumSnap,
    pendingWithdrawalsSnap,
    completedWithdrawalsSnap,
    totalTransactionsSnap,
  ] = await Promise.all([
    getCountFromServer(usersCol),
    getCountFromServer(query(usersCol, where("status", "==", "active"))),
    getCountFromServer(gamesCol),
    getCountFromServer(query(offersCol, where("type", "==", "offer"))),
    getCountFromServer(query(offersCol, where("type", "==", "task"))),
    getAggregateFromServer(
      query(transactionsCol, where("amount", ">", 0)),
      { total: sum("amount") }
    ),
    getCountFromServer(query(withdrawalsCol, where("status", "==", "pending"))),
    getCountFromServer(query(withdrawalsCol, where("status", "==", "approved"))),
    getCountFromServer(transactionsCol),
  ]);

  return {
    totalUsers: totalUsersSnap.data().count,
    activeUsers: activeUsersSnap.data().count,
    totalGames: totalGamesSnap.data().count,
    totalOffers: totalOffersSnap.data().count,
    totalTasks: totalTasksSnap.data().count,
    totalRewardsDistributed: rewardsSumSnap.data().total ?? 0,
    pendingWithdrawals: pendingWithdrawalsSnap.data().count,
    completedWithdrawals: completedWithdrawalsSnap.data().count,
    totalTransactions: totalTransactionsSnap.data().count,
  };
}

export interface DailySignups {
  date: string;
  count: number;
}

/**
 * Real signups-per-day for the last 7 days, computed from actual `users`
 * docs (not synthesized). Reads at most a week of new users, which stays
 * cheap regardless of total platform size since it's bounded by a
 * createdAt range, not a full collection scan.
 */
export async function fetchSignupsLast7Days(): Promise<DailySignups[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "users"),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  snap.docs.forEach((doc) => {
    const createdAt = doc.data().createdAt as Timestamp | undefined;
    if (!createdAt) return;
    const key = createdAt.toDate().toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  });

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export interface TransactionTypeBreakdown {
  type: string;
  count: number;
}

/**
 * Real breakdown of the most recent 200 transactions by type, giving a
 * representative snapshot of reward activity without scanning the full
 * (potentially huge) transactions collection.
 */
export async function fetchRecentTransactionTypeBreakdown(): Promise<TransactionTypeBreakdown[]> {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);

  const counts = new Map<string, number>();
  snap.docs.forEach((doc) => {
    const type = doc.data().type as string;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
}
