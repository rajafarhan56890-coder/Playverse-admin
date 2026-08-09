import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function AppRouter() {
  const init = useAdminAuthStore((state) => state.init);
  const isLoading = useAdminAuthStore((state) => state.isLoading);
  const user = useAdminAuthStore((state) => state.user);
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route path="users" element={<UsersListPage />} />
          <Route path="users/:uid" element={<UserDetailPage />} />

          <Route path="games" element={<GamesListPage />} />
          <Route path="games/new" element={<GameFormPage />} />

          <Route
            path="games/:gameId/edit"
            element={<GameFormPage />}
          />

          <Route
            path="games-management"
            element={<GamesManagementPage />}
          />

          <Route
            path="payment-methods"
            element={<PaymentMethodsPage />}
          />

          <Route
            path="settings"
            element={<AdminSettingsPage />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
