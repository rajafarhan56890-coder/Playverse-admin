import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  fetchUserWallet,
  fetchUserTransactions,
  setUserStatus,
  adjustUserBalance,
} from "../../services/users.service";
import type { UserProfile, Wallet, Transaction } from "../../types/models";

export default function UserDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function loadAll() {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileResult, walletResult, txResult] = await Promise.all([
        fetchUserProfile(uid),
        fetchUserWallet(uid),
        fetchUserTransactions(uid),
      ]);
      if (!profileResult) {
        setError("User not found.");
        return;
      }
      setProfile(profileResult);
      setWallet(walletResult);
      setTransactions(txResult);
    } catch (err) {
      setError((err as Error).message || "Could not load user.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function handleToggleStatus() {
    if (!profile) return;
    const nextStatus = profile.status === "active" ? "blocked" : "active";
    if (
      !window.confirm(
        `${nextStatus === "blocked" ? "Block" : "Unblock"} ${profile.name || profile.email}?`
      )
    ) {
      return;
    }
    setIsTogglingStatus(true);
    const result = await setUserStatus(profile.uid, nextStatus);
    setIsTogglingStatus(false);
    if (result.success) {
      setProfile({ ...profile, status: nextStatus });
    } else {
      alert(result.error ?? "Could not update status.");
    }
  }

  async function handleAdjustBalance(e: FormEvent) {
    e.preventDefault();
    setAdjustMessage(null);
    const amount = Number(adjustAmount);

    if (!amount || Number.isNaN(amount)) {
      setAdjustMessage({ text: "Enter a valid non-zero amount.", isError: true });
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustMessage({ text: "A reason is required.", isError: true });
      return;
    }
    if (!uid) return;

    setIsAdjusting(true);
    const result = await adjustUserBalance(uid, amount, adjustReason);
    setIsAdjusting(false);

    if (result.success) {
      setAdjustMessage({ text: "Balance updated.", isError: false });
      setAdjustAmount("");
      setAdjustReason("");
      loadAll();
    } else {
      setAdjustMessage({ text: result.error ?? "Could not adjust balance.", isError: true });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div>
        <button onClick={() => navigate("/dashboard/users")} className="text-pv-primary text-sm mb-4">
          ← Back to users
        </button>
        <p className="text-red-400">{error ?? "User not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/dashboard/users")} className="text-pv-primary text-sm mb-4">
        ← Back to users
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-pv-text">
            {profile.name || "Unnamed user"}
          </h1>
          <p className="text-pv-textSecondary text-sm">{profile.email}</p>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={isTogglingStatus}
          className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 ${
            profile.status === "active"
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-pv-success/20 text-pv-success hover:bg-pv-success/30"
          }`}
        >
          {isTogglingStatus ? "Working…" : profile.status === "active" ? "Block user" : "Unblock user"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
            <h2 className="text-sm font-medium text-pv-textSecondary mb-3">Profile</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-pv-textMuted">UID</dt>
              <dd className="text-pv-text font-mono text-xs">{profile.uid}</dd>
              <dt className="text-pv-textMuted">Phone</dt>
              <dd className="text-pv-text">{profile.phone || "—"}</dd>
              <dt className="text-pv-textMuted">Level</dt>
              <dd className="text-pv-text">{profile.level}</dd>
              <dt className="text-pv-textMuted">Referral code</dt>
              <dd className="text-pv-text">{profile.referralCode}</dd>
              <dt className="text-pv-textMuted">Referred by</dt>
              <dd className="text-pv-text font-mono text-xs">{profile.referredBy || "—"}</dd>
              <dt className="text-pv-textMuted">Joined</dt>
              <dd className="text-pv-text">{profile.createdAt?.toDate?.().toLocaleString() ?? "—"}</dd>
            </dl>
          </section>

          <section className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
            <h2 className="text-sm font-medium text-pv-textSecondary mb-3">Transaction history</h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-pv-elevated">
                  <tr className="text-left text-pv-textMuted border-b border-pv-border">
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Balance after</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-pv-border last:border-0">
                      <td className="py-2 text-pv-text">{tx.type.replace(/_/g, " ")}</td>
                      <td className={`py-2 font-mono ${tx.amount >= 0 ? "text-pv-success" : "text-red-400"}`}>
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-2 text-pv-textSecondary font-mono">{tx.balanceAfter.toLocaleString()}</td>
                      <td className="py-2 text-pv-textMuted">
                        {tx.createdAt?.toDate?.().toLocaleDateString() ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-pv-textMuted">
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
            <h2 className="text-sm font-medium text-pv-textSecondary mb-3">Wallet</h2>
            {wallet ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-pv-textMuted">Coins</dt>
                  <dd className="text-pv-coin font-mono">{wallet.coins.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-pv-textMuted">Pending withdrawal</dt>
                  <dd className="text-pv-text font-mono">{wallet.pendingWithdrawal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-pv-textMuted">Total earned</dt>
                  <dd className="text-pv-text font-mono">{wallet.totalEarned.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-pv-textMuted">Total withdrawn</dt>
                  <dd className="text-pv-text font-mono">{wallet.totalWithdrawn.toLocaleString()}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-pv-textMuted text-sm">No wallet found.</p>
            )}
          </section>

          <section className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
            <h2 className="text-sm font-medium text-pv-textSecondary mb-3">Adjust balance</h2>
            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="block text-xs text-pv-textSecondary mb-1">
                  Amount (negative to deduct)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 100 or -50"
                  className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
                  disabled={isAdjusting}
                />
              </div>
              <div>
                <label className="block text-xs text-pv-textSecondary mb-1">Reason (required)</label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
                  disabled={isAdjusting}
                />
              </div>
              {adjustMessage && (
                <p className={`text-xs ${adjustMessage.isError ? "text-red-400" : "text-pv-success"}`}>
                  {adjustMessage.text}
                </p>
              )}
              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full rounded-full bg-pv-primary text-pv-bg font-medium py-2 text-sm hover:bg-pv-primaryPressed disabled:opacity-60"
              >
                {isAdjusting ? "Applying…" : "Apply adjustment"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
