import { create } from "zustand";
import type { User } from "firebase/auth";
import {
  subscribeToAdminAuthState,
  verifyCurrentUserIsAdmin,
} from "../services/auth.service";

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  init: () => () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAdmin: false,
  isLoading: true,

  init: () => {
    const unsubscribe = subscribeToAdminAuthState(async (user) => {
      if (!user) {
        set({ user: null, isAdmin: false, isLoading: false });
        return;
      }
      const isAdmin = await verifyCurrentUserIsAdmin(user);
      set({ user, isAdmin, isLoading: false });
    });
    return unsubscribe;
  },
}));
