// Mirrors playverse-app/src/types/models.ts and 02-FIRESTORE-SCHEMA.md.
// Keep identical across all three projects.
import type { Timestamp } from "firebase/firestore";

export type UserStatus = "active" | "blocked";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string | null;
  photoURL: string | null;
  referralCode: string;
  referredBy: string | null;
  level: number;
  status: UserStatus;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface Wallet {
  uid: string;
  coins: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: Timestamp;
}

export type TransactionType =
  | "daily_reward"
  | "game_reward"
  | "task_reward"
  | "referral_bonus"
  | "bonus_reward"
  | "withdrawal_hold"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "admin_adjustment";

export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  sourceId: string | null;
  description: string;
  createdAt: Timestamp;
  createdBy: "system" | "admin";
}

export type GameEngine = "flappy-birds" | "coin-clicker" | "color-match";

export interface Game {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  engine: GameEngine;
  category: string;
  totalLevels: number;
  coinsPerLevel: number;
  gameURL: string | null;
  deepLinkURL: string | null;
  status: "active" | "inactive";
  isFeatured: boolean;
  playCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserGameProgress {
  gameId: string;
  completedLevels: number[];
  lastCompletedLevel: number;
  totalCoinsEarned: number;
  updatedAt: Timestamp;
}

export type TaskType = "daily" | "weekly" | "special" | "social" | "app_engagement";

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageURL: string | null;
  reward: number;
  type: "task" | "offer";
  taskType: TaskType | null;
  status: "active" | "inactive";
  expiresAt: Timestamp | null;
  completionCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type WithdrawalStatus = "pending" | "approved" | "rejected";

export interface Withdrawal {
  id: string;
  uid: string;
  amount: number;
  payoutMethod: "easypaisa" | "jazzcash";
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  requestedAt: Timestamp;
  resolvedAt: Timestamp | null;
  resolvedBy: string | null;
  rejectionReason: string | null;
}

export interface Referral {
  id: string;
  referrerUid: string;
  referredUid: string;
  referrerBonus: number;
  referredBonus: number;
  tier2Uid: string | null;
  tier2Bonus: number;
  createdAt: Timestamp;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  photoURL: string | null;
  totalEarned: number;
  rank: number;
  updatedAt: Timestamp;
}

export interface GlobalSettings {
  appName: string;
  logoURL: string;
  primaryColor: string;
  secondaryColor: string;
  coinToCurrencyRate: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  dailyRewardAmount: number;
  referralBonusReferrer: number;
  referralBonusReferred: number;
  referralTier2Bonus: number;
  updatedAt: Timestamp;
}

export type AdminRole = "super_admin" | "admin";

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: Timestamp;
}
