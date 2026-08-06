import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
import { mapFunctionsError } from "../utils/functionsError";
import type { Game, UserGameProgress } from "../types/models";
import type { ClaimResult } from "./wallet.service";

export function subscribeToActiveGames(
  callback: (games: Game[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "games"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as Game)),
    (error) => onError?.(error)
  );
}

// Get game by ID
export async function getGameById(gameId: string): Promise<Game | null> {
  try {
    const gameDoc = await getDoc(doc(db, "games", gameId));
    return gameDoc.exists() ? (gameDoc.data() as Game) : null;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
}

// Get user's progress for a specific game
export async function getUserGameProgress(
  uid: string,
  gameId: string
): Promise<UserGameProgress | null> {
  try {
    const progressDoc = await getDoc(
      doc(db, `users/${uid}/gameProgress`, gameId)
    );
    return progressDoc.exists() ? (progressDoc.data() as UserGameProgress) : null;
  } catch (error) {
    console.error("Error fetching game progress:", error);
    return null;
  }
}

// Complete a level and claim coins
export async function completeLevelAndClaimCoins(
  gameId: string,
  level: number
): Promise<ClaimResult> {
  try {
    const callable = httpsCallable(functions, "completeLevelAndClaimCoins");
    const result = await callable({ gameId, level });
    const data = result.data as { amountCredited: number; success: boolean };
    return { success: data.success, amountCredited: data.amountCredited };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}

// Complete entire game
export async function completeGame(gameId: string): Promise<ClaimResult> {
  try {
    const callable = httpsCallable(functions, "completeGame");
    const result = await callable({ gameId });
    const data = result.data as { amountCredited: number };
    return { success: true, amountCredited: data.amountCredited };
  } catch (error) {
    return { success: false, error: mapFunctionsError(error) };
  }
}
