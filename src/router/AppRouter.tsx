import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";

import UsersListPage from "../pages/users/UsersListPage";
import UserDetailPage from "../pages/users/UserDetailPage";

import GamesListPage from "../pages/games/GamesListPage";
import GameFormPage from "../pages/games/GameFormPage";

import GamesManagementPage from "../pages/admin/GamesManagementPage";
import PaymentMethodsPage from "../pages/admin/PaymentMethodsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

import { useAdminAuthStore } from "../store/adminAuthStore";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-pv-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAdminAuthStore();

  if (isLoading) return <FullScreenLoader />;

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function AppRouter() {
  const init = useAdminAuthStore((s) => s.init);
  const isLoading = useAdminAuthStore((s) => s.isLoading);
  const user = useAdminAuthStore((s) => s.user);
  const isAdmin = useAdminAuthStore((s) => s.isAdmin);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            user && isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardLayout />
            </RequireAdmin>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Users */}
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:uid" element={<UserDetailPage />} />

          {/* Existing Games */}
          <Route path="games" element={<GamesListPage />} />
          <Route path="games/new" element={<GameFormPage />} />
          <Route path="games/:gameId/edit" element={<GameFormPage />} />

          {/* New Admin Game Management */}
          <Route
            path="games-management"
            element={<GamesManagementPage />}
          />

          {/* Payment Methods */}
          <Route
            path="payment-methods"
            element={<PaymentMethodsPage />}
          />

          {/* App Settings / Coin Conversion */}
          <Route
            path="settings"
            element={<AdminSettingsPage />}
          />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
            
