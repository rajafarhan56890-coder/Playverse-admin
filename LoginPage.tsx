import { useState, type FormEvent } from "react";
import { adminLogin } from "../services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    const result = await adminLogin(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
    // On success, AppRouter's auth listener redirects to /dashboard.
  }

  return (
    <div className="min-h-screen bg-pv-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-pv-primary flex items-center justify-center shadow-lg shadow-pv-primary/40 mb-3">
            <span className="text-pv-bg font-bold text-xl">PV</span>
          </div>
          <h1 className="text-2xl font-bold text-pv-text">PlayVerse Admin</h1>
          <p className="text-pv-textSecondary text-sm mt-1">
            Sign in with an authorized admin account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-pv-elevated border border-pv-border rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-pv-textSecondary mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2.5 text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary disabled:opacity-60"
              placeholder="admin@playverse.app"
            />
          </div>

          <div>
            <label className="block text-xs text-pv-textSecondary mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2.5 text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-pv-primary text-pv-bg font-medium py-2.5 hover:bg-pv-primaryPressed transition disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-pv-textMuted mt-6">
          Admin accounts are provisioned by a super admin. Contact your
          PlayVerse administrator if you need access.
        </p>
      </div>
    </div>
  );
}
