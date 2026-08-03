import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchDashboardStats,
  fetchSignupsLast7Days,
  fetchRecentTransactionTypeBreakdown,
  type DashboardStats,
  type DailySignups,
  type TransactionTypeBreakdown,
} from "../services/dashboard.service";
import StatCard from "../components/common/StatCard";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [signups, setSignups] = useState<DailySignups[]>([]);
  const [txBreakdown, setTxBreakdown] = useState<TransactionTypeBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [statsResult, signupsResult, breakdownResult] = await Promise.all([
          fetchDashboardStats(),
          fetchSignupsLast7Days(),
          fetchRecentTransactionTypeBreakdown(),
        ]);
        if (cancelled) return;
        setStats(statsResult);
        setSignups(signupsResult);
        setTxBreakdown(breakdownResult);
      } catch (err) {
        if (!cancelled) setError((err as Error).message || "Could not load dashboard stats.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-red-400">{error ?? "Could not load dashboard."}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-pv-text mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Active users" value={stats.activeUsers} accent="success" />
        <StatCard label="Total games" value={stats.totalGames} />
        <StatCard label="Total offers" value={stats.totalOffers} />
        <StatCard label="Total tasks" value={stats.totalTasks} />
        <StatCard label="Rewards distributed" value={stats.totalRewardsDistributed} accent="coin" />
        <StatCard label="Pending withdrawals" value={stats.pendingWithdrawals} accent="warning" />
        <StatCard label="Completed withdrawals" value={stats.completedWithdrawals} accent="success" />
        <StatCard label="Total transactions" value={stats.totalTransactions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
          <h2 className="text-sm font-medium text-pv-textSecondary mb-4">
            New signups — last 7 days
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={signups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2447" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#A79FCB", fontSize: 11 }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fill: "#A79FCB", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#181129", border: "1px solid #2C2447", borderRadius: 8 }}
                labelStyle={{ color: "#F3F1FF" }}
              />
              <Line type="monotone" dataKey="count" stroke="#7B5CFF" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
          <h2 className="text-sm font-medium text-pv-textSecondary mb-4">
            Recent transactions by type (last 200)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={txBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2447" />
              <XAxis dataKey="type" tick={{ fill: "#A79FCB", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#A79FCB", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#181129", border: "1px solid #2C2447", borderRadius: 8 }}
                labelStyle={{ color: "#F3F1FF" }}
              />
              <Bar dataKey="count" fill="#FFB020" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
