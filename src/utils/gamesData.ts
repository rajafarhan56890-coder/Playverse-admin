// Predefined games data with tasks and levels
// Each game has 100 levels with progressive coin rewards
// Total coins per game: 1000 coins

import type { Game, GameTask, GameLevel } from "../types/models";

// Helper function to generate levels with coin distribution
const generateLevels = (totalLevels: number = 100, totalCoins: number = 1000): GameLevel[] => {
  const levels: GameLevel[] = [];
  const coinsPerLevel = Math.floor(totalCoins / totalLevels);
  const extraCoins = totalCoins % totalLevels;

  for (let i = 1; i <= totalLevels; i++) {
    // Coins increase progressively (more coins for higher levels)
    const baseCoins = coinsPerLevel + (i % 10 === 0 ? 10 : 0);
    const bonus = i > totalLevels - 10 ? (i - (totalLevels - 10)) * 5 : 0;
    const levelCoins = baseCoins + bonus + (i === totalLevels ? extraCoins : 0);

    levels.push({
      level: i,
      requiredScore: i * 100, // Score requirement increases per level
      coinsReward: Math.floor(levelCoins),
      description: `Level ${i} - Reach ${i * 100} score to earn ${Math.floor(levelCoins)} coins`,
    });
  }
  return levels;
};

// Helper to create a game task
const createGameTask = (
  id: string,
  name: string,
  description: string,
  icon: string,
  totalLevels: number = 100,
  totalCoins: number = 1000,
  difficulty: "easy" | "medium" | "hard" = "medium"
): GameTask => ({
  id,
  name,
  description,
  icon,
  totalLevels,
  totalCoins,
  difficulty,
  levels: generateLevels(totalLevels, totalCoins),
  completedLevels: 0,
  lastPlayedAt: null,
});

// Games Data
export const gamesData: Game[] = [
  {
    id: "game-001-flappy-bird",
    name: "Flappy Bird Classic",
    description: "Navigate through pipes and earn coins with each level! Tap to fly, avoid obstacles.",
    imageURL: "https://img.icons8.com/color/96/000000/bird.png",
    gameURL: "https://playverse-games.web.app/flappy-bird",
    deepLinkURL: null,
    category: "casual",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: true,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-001",
        "Main Challenge",
        "Complete 100 levels by navigating through increasingly difficult pipe patterns",
        "🎮",
        100,
        1000,
        "medium"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "game-002-tap-tap",
    name: "Tap Tap Coins",
    description: "Tap as fast as you can! Speed and accuracy earn you coins.",
    imageURL: "https://img.icons8.com/color/96/000000/hand-cursor.png",
    gameURL: "https://playverse-games.web.app/tap-tap",
    deepLinkURL: null,
    category: "casual",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: true,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-002",
        "Tapping Master",
        "Master the art of tapping - complete 100 levels with increasing tap requirements",
        "👆",
        100,
        1000,
        "easy"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "game-003-match-pairs",
    name: "Match Pairs",
    description: "Find matching pairs and complete levels to earn coins!",
    imageURL: "https://img.icons8.com/color/96/000000/puzzle.png",
    gameURL: "https://playverse-games.web.app/match-pairs",
    deepLinkURL: null,
    category: "puzzle",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: false,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-003",
        "Pair Master",
        "Match all pairs in 100 progressively complex levels",
        "🎨",
        100,
        1000,
        "medium"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "game-004-block-blast",
    name: "Block Blast",
    description: "Clear blocks and beat levels! Strategic gameplay for coin rewards.",
    imageURL: "https://img.icons8.com/color/96/000000/cube.png",
    gameURL: "https://playverse-games.web.app/block-blast",
    deepLinkURL: null,
    category: "puzzle",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: false,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-004",
        "Block Expert",
        "Clear all blocks in 100 challenging levels",
        "🧱",
        100,
        1000,
        "hard"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "game-005-color-rush",
    name: "Color Rush",
    description: "Match colors quickly before time runs out. Beat the clock!",
    imageURL: "https://img.icons8.com/color/96/000000/palette.png",
    gameURL: "https://playverse-games.web.app/color-rush",
    deepLinkURL: null,
    category: "casual",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: false,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-005",
        "Color Champion",
        "Complete 100 color matching challenges with increasing difficulty",
        "🌈",
        100,
        1000,
        "easy"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
  {
    id: "game-006-snake-game",
    name: "Snake Master",
    description: "Classic snake game with modern coin rewards! Grow your snake and earn!",
    imageURL: "https://img.icons8.com/color/96/000000/snake.png",
    gameURL: "https://playverse-games.web.app/snake-game",
    deepLinkURL: null,
    category: "classic",
    reward: 1000,
    totalCoins: 1000,
    status: "active",
    isFeatured: true,
    playCount: 0,
    tasks: [
      createGameTask(
        "task-006",
        "Snake Expert",
        "Grow your snake through 100 levels of increasing complexity",
        "🐍",
        100,
        1000,
        "medium"
      ),
    ],
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  },
];

// Export individual games for easy access
export const gamesMap = new Map(gamesData.map((game) => [game.id, game]));

// Get all featured games
export const getFeaturedGames = (): Game[] =>
  gamesData.filter((game) => game.isFeatured);

// Get games by category
export const getGamesByCategory = (category: string): Game[] =>
  gamesData.filter((game) => game.category === category);
