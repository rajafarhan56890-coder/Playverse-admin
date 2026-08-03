import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { fetchUsersPage, searchUsers } from "../../services/users.service";
import type { UserProfile, UserStatus } from "../../types/models";

export default function UsersListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFirstPage() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUsersPage(statusFilter === "all" ? null : statusFilter);
      setUsers(result.users);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError((err as Error).message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsSearchMode(false);
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function loadMore() {
    if (!cursor || !hasMore) return;
    setIsLoading(true);
    try {
      const result = await fetchUsersPage(statusFilter === "all" ? null : statusFilter, cursor);
      setUsers((prev) => [...prev, ...result.users]);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      loadFirstPage();
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsSearchMode(true);
    try {
      const results = await searchUsers(searchTerm);
      setUsers(results);
      setHasMore(false);
    } catch (err) {
      setError((err as Error).message || "Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-pv-text mb-6">Users</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or exact email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary w-72"
          />
          <button
            type="submit"
            className="rounded-lg bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium hover:bg-pv-primaryPressed"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
          className="rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="bg-pv-elevated border border-pv-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-pv-textSecondary border-b border-pv-border">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.uid}
                onClick={() => navigate(`/dashboard/users/${user.uid}`)}
                className="border-b border-pv-border last:border-0 hover:bg-pv-elevated2 cursor-pointer"
              >
                <td className="px-4 py-3 text-pv-text">{user.name || "—"}</td>
                <td className="px-4 py-3 text-pv-textSecondary">{user.email}</td>
                <td className="px-4 py-3 text-pv-textSecondary">{user.level}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.status === "active"
                        ? "bg-pv-success/20 text-pv-success"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-pv-textSecondary">
                  {user.createdAt?.toDate?.().toLocaleDateString() ?? "—"}
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pv-textSecondary">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isLoading && <p className="text-pv-textSecondary text-sm mt-4">Loading…</p>}

      {!isSearchMode && hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="mt-4 rounded-lg border border-pv-border px-4 py-2 text-sm text-pv-text hover:bg-pv-elevated"
        >
          Load more
        </button>
      )}
    </div>
  );
}
