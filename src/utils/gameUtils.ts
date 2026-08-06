// Game-related utilities for coin calculations, level completion, and progress

import type { Game, GameLevel, UserGameProgress } from "../types/models";

/**
 * Calculate coins earned for completing a specific level
 */
export const calculateLevelCoins = (game: Game, level: number): number => {
  const task = game.tasks[0]; // Assuming first task for now
  if (!task) return 0;

  const levelData = task.levels.find((l) => l.level === level);
  return levelData?.coinsReward || 0;
};

/**
 * Calculate total coins earned from completing multiple levels
 */
export const calculateTotalCoins = (
  game: Game,
  completedLevels: number[]
): number => {
  return completedLevels.reduce((total, level) => {
    return total + calculateLevelCoins(game, level);
  }, 0);
};

/**
 * Get next available level to play
 */
export const getNextLevel = (progress: UserGameProgress | null): number => {
  if (!progress || progress.completedLevels.length === 0) return 1;
  
  const completed = new Set(progress.completedLevels);
  for (let i = 1; i <= 100; i++) {
    if (!completed.has(i)) return i;
  }
  return 100; // All levels completed
};

/**
 * Calculate progress percentage
 */
export const getProgressPercentage = (
  progress: UserGameProgress | null,
  totalLevels: number = 100
): number => {
  if (!progress) return 0;
  return Math.round((progress.completedLevels.length / totalLevels) * 100);
};

/**
 * Validate if user can complete a level
 */
export const canCompleteLevelAgain = (
  progress: UserGameProgress | null,
  level: number
): boolean => {
  // Users can play levels multiple times after completing them once
  if (!progress) return true; // First time playing
  return progress.completedLevels.includes(level);
};

/**
 * Format coins display (with currency symbol)
 */
export const formatCoins = (coins: number, currencySymbol: string = "PKR"): string => {
  if (coins >= 1000000) return `${(coins / 1000000).toFixed(2)}M ${currencySymbol}`;
  if (coins >= 1000) return `${(coins / 1000).toFixed(2)}K ${currencySymbol}`;
  return `${coins} ${currencySymbol}`;
};

/**
 * Convert coins to real currency
 */
export const convertCoinsToRupees = (coins: number, rate: number): number => {
  return Math.floor(coins * rate);
};

/**
 * Get level difficulty based on progress
 */
export const getLevelDifficulty = (level: number): "easy" | "medium" | "hard" => {
  if (level <= 33) return "easy";
  if (level <= 66) return "medium";
  return "hard";
};

/**
 * Calculate bonus coins for speed/performance
 */
export const calculateBonusCoins = (
  baseCoins: number,
  timeSpentSeconds: number,
  expectedTimeSeconds: number
): number => {
  if (timeSpentSeconds <= expectedTimeSeconds * 0.5) {
    return Math.floor(baseCoins * 0.5); // 50% bonus
  }
  if (timeSpentSeconds <= expectedTimeSeconds) {
    return Math.floor(baseCoins * 0.25); // 25% bonus
  }
  return 0; // No bonus
};

/**
 * Get level unlocking information
 */
export const getLevelUnlockInfo = (
  level: number,
  completedLevels: number[]
): { isUnlocked: boolean; requiredCompletions: number } => {
  const completed = completedLevels.length;
  
  return {
    isUnlocked: level <= Math.min(completed + 1, 100), // One level ahead or completed
    requiredCompletions: Math.max(0, level - 1 - completed),
  };
};

/**
 * Get achievement/milestone for level completion
 */
export const getMilestone = (levelsCompleted: number): string | null => {
  if (levelsCompleted === 1) return "First Step";
  if (levelsCompleted === 10) return "Getting Started";
  if (levelsCompleted === 25) return "Quarter Way";
  if (levelsCompleted === 50) return "Halfway There";
  if (levelsCompleted === 75) return "Almost Done";
  if (levelsCompleted === 100) return "Level Master";
  return null;
};

/**
 * Calculate estimated earnings from remaining levels
 */
export const estimateRemainingEarnings = (
  game: Game,
  completedLevels: number[]
): number => {
  const task = game.tasks[0];
  if (!task) return 0;

  const completed = new Set(completedLevels);
  let totalRemaining = 0;

  for (let i = 1; i <= task.totalLevels; i++) {
    if (!completed.has(i)) {
      const levelData = task.levels.find((l) => l.level === i);
      totalRemaining += levelData?.coinsReward || 0;
    }
  }

  return totalRemaining;
};

/**
 * Get time-based bonus multiplier
 */
export const getTimeBasedBonus = (
  lastCompletionTime: Date | null
): { multiplier: number; reason: string } => {
  if (!lastCompletionTime) {
    return { multiplier: 1.0, reason: "No bonus" };
  }

  const now = new Date();
  const hoursSincePlay = (now.getTime() - lastCompletionTime.getTime()) / (1000 * 60 * 60);

  if (hoursSincePlay >= 24) {
    return { multiplier: 1.5, reason: "Daily comeback bonus!" };
  }
  if (hoursSincePlay >= 12) {
    return { multiplier: 1.2, reason: "Consecutive play bonus" };
  }

  return { multiplier: 1.0, reason: "No bonus" };
};
