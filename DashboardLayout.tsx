import { NavLink, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { adminLogout } from "../services/auth.service";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/dashboard/users", label: "Users" },
  { to: "/dashboard/games", label: "Games" },
];

/**
 * Full dashboard shell: sidebar nav + top bar with session info and
 * logout, content area rendered via <Outlet /> for each module route.
 * Offers/Withdrawals/Settings modules follow the same pattern established
 * here (see 04-ROADMAP.md) and can be added as additional NAV_ITEMS +
 * routes without touching this shell.
 */
export default function DashboardLayout() {
  const user = useAdminAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-pv-bg flex">
      <aside className="w-56 border-r border-pv-border flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="w-8 h-8 rounded-lg bg-pv-primary flex items-center justify-center">
            <span className="text-pv-bg font-bold text-xs">PV</span>
          </div>
          <span className="text-pv-text font-semibold">PlayVerse</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-pv-primary/15 text-pv-primary font-medium"
                    : "text-pv-textSecondary hover:bg-pv-elevated hover:text-pv-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-pv-border">
          <p className="text-xs text-pv-textMuted px-3 truncate">{user?.email}</p>
          <button
            onClick={adminLogout}
            className="mt-2 w-full text-left rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
