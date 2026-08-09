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
import type { Game } from "../types/models";

export async function fetchAllGames(): Promise<Game[]> {
  const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Game);
}

export interface GameFormInput {
  name: string;
  description: string;
  imageURL: string;
  gameURL: string;
  deepLinkURL: string;
  category: string;
  reward: number;
  status: "active" | "inactive";
  isFeatured: boolean;
}

export async function createGame(
  input: GameFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await addDoc(collection(db, "games"), {
      name: input.name.trim(),
      description: input.description.trim(),
      imageURL: input.imageURL.trim(),
      gameURL: input.gameURL.trim(),
      deepLinkURL: input.deepLinkURL.trim() || null,
      category: input.category.trim(),
      reward: input.reward,
      status: input.status,
      isFeatured: input.isFeatured,
      playCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateGame(
  gameId: string,
  input: GameFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = {
      name: input.name.trim(),
      description: input.description.trim(),
      imageURL: input.imageURL.trim(),
      gameURL: input.gameURL.trim(),
      deepLinkURL: input.deepLinkURL.trim() || null,
      category: input.category.trim(),
      reward: input.reward,
      status: input.status,
      isFeatured: input.isFeatured,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "games", gameId), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteGame(
  gameId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "games", gameId));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleGameStatus(
  gameId: string,
  currentStatus: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "games", gameId), {
      status: currentStatus === "active" ? "inactive" : "active",
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
