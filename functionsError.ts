/**
 * Maps a Firebase Callable Functions error into friendly, user-facing copy.
 * Mirrors playverse-app/src/utils/functionsError.ts so error handling stays
 * consistent across both client projects. Used by every admin service that
 * calls a callable function (users, and future offers/withdrawals modules).
 */
export function mapFunctionsError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  const serverMessage = (error as { message?: string })?.message;

  switch (code) {
    case "already-exists":
      return serverMessage || "This action has already been completed.";
    case "failed-precondition":
      return serverMessage || "This action can't be completed right now.";
    case "not-found":
      return serverMessage || "The target of this action could not be found.";
    case "invalid-argument":
      return serverMessage || "Something about this request wasn't valid.";
    case "unauthenticated":
      return "Please log in again to continue.";
    case "permission-denied":
      return "You don't have permission to do that.";
    case "resource-exhausted":
      return "Too many requests. Please wait a moment and try again.";
    case "unavailable":
    case "deadline-exceeded":
      return "Network error. Check your connection and try again.";
    default:
      return serverMessage || "Something went wrong. Please try again.";
  }
}
