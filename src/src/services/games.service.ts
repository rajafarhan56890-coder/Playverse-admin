import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Game, GameEngine } from "../types/models";

const GAMES_COLLECTION = "games";

/**
 * Fetch all games from Firebase.
 *
 * Important:
 * Firestore document ID is added to the returned Game object
 * so Edit / Delete / Toggle actions can target the correct document.
 */
export async function fetchAllGames(): Promise<Game[]> {
  const q = query(
    collection(db, GAMES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Game[];
}

export interface GameFormInput {
  name: string;
  description: string;
  imageURL: string;
  engine: GameEngine;
  category: string;
  totalLevels: number;
  coinsPerLevel: number;
  gameURL: string;
  deepLinkURL: string;
  status: "active" | "inactive";
  isFeatured: boolean;
}

/**
 * Create a new game in the existing Firebase games collection.
 */
export async function createGame(
  input: GameFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await addDoc(collection(db, GAMES_COLLECTION), {
      name: input.name.trim(),
      description: input.description.trim(),
      imageURL: input.imageURL.trim(),
      engine: input.engine,
      category: input.category.trim(),
      totalLevels: Number(input.totalLevels),
      coinsPerLevel: Number(input.coinsPerLevel),
      gameURL: input.gameURL.trim() || null,
      deepLinkURL: input.deepLinkURL.trim() || null,
      status: input.status,
      isFeatured: Boolean(input.isFeatured),
      playCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Create game error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not create game.",
    };
  }
}

/**
 * Update an existing game.
 */
export async function updateGame(
  gameId: string,
  input: GameFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is missing.",
      };
    }

    const gameRef = doc(db, GAMES_COLLECTION, gameId);

    await updateDoc(gameRef, {
      name: input.name.trim(),
      description: input.description.trim(),
      imageURL: input.imageURL.trim(),
      engine: input.engine,
      category: input.category.trim(),
      totalLevels: Number(input.totalLevels),
      coinsPerLevel: Number(input.coinsPerLevel),
      gameURL: input.gameURL.trim() || null,
      deepLinkURL: input.deepLinkURL.trim() || null,
      status: input.status,
      isFeatured: Boolean(input.isFeatured),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update game error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not update game.",
    };
  }
}

/**
 * Delete an existing game.
 */
export async function deleteGame(
  gameId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is missing.",
      };
    }

    await deleteDoc(doc(db, GAMES_COLLECTION, gameId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete game error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not delete game.",
    };
  }
}

/**
 * Toggle a game's active/inactive status.
 */
export async function toggleGameStatus(
  gameId: string,
  currentStatus: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is missing.",
      };
    }

    const newStatus =
      currentStatus === "active" ? "inactive" : "active";

    await updateDoc(doc(db, GAMES_COLLECTION, gameId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Toggle game status error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not update game status.",
    };
  }
}
