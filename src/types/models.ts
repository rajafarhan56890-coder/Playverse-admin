// Mirrors 02-FIRESTORE-SCHEMA.md exactly.
// Keep this file identical across playverse-app, playverse-admin, and playverse-functions.

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

export interface GameLevel {
  level: number;
  requiredScore: number;
  coinsReward: number;
  description: string;
}

export interface GameTask {
  id: string;
  name: string;
  description: string;
  icon: string;
  totalLevels: number;
  totalCoins: number;
  difficulty: "easy" | "medium" | "hard";
  levels: GameLevel[];
  completedLevels: number; // User progress
  lastPlayedAt: Timestamp | null;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  gameURL: string;
  deepLinkURL: string | null;
  category: string;
  reward: number;
  totalCoins: number; // Total coins possible in this game
  status: "active" | "inactive";
  isFeatured: boolean;
  playCount: number;
  tasks: GameTask[]; // Array of tasks/levels in the game
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserGameProgress {
  uid: string;
  gameId: string;
  completedLevels: number[];
  totalCoinsEarned: number;
  lastPlayedAt: Timestamp;
  createdAt: Timestamp;
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
  tier2Uid: string | null; // the referrer's own referrer, if credited a tier-2 bonus
  tier2Bonus: number; // 0 if no tier-2 bonus was applied
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
  coinToCurrencyRate: number; // 1 coin = ? PKR (Admin configurable)
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  dailyRewardAmount: number;
  referralBonusReferrer: number;
  referralBonusReferred: number;
  referralTier2Bonus: number;
  gameRewardMultiplier: number; // Multiplier for game rewards
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
