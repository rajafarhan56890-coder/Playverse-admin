import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type AuthError,
} from "firebase/auth";
import { auth } from "../config/firebase";

function mapAuthError(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Login failed. Please try again.";
  }
}

export interface AdminAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Logs in AND verifies the `admin` custom claim before considering the
 * login successful. A valid Firebase Auth account with the wrong claim
 * (e.g. a regular PlayVerse user typing their credentials into the admin
 * panel by mistake) is immediately signed back out — the dashboard must
 * never be reachable by a non-admin account, even transiently.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<AdminAuthResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

    // force-refresh the token so a claim granted moments ago (e.g. a brand
    // new admin) is picked up rather than a stale cached token.
    const tokenResult = await cred.user.getIdTokenResult(true);

    if (tokenResult.claims.admin !== true) {
      await signOut(auth);
      return {
        success: false,
        error: "This account does not have admin access.",
      };
    }

    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
}

export async function adminLogout(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAdminAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Re-checks the admin claim on the current session (used by the route guard). */
export async function verifyCurrentUserIsAdmin(user: User): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
}
