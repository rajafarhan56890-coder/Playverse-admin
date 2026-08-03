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
import { useAdminAuthStore } from "../store/adminAuthStore";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-pv-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Guards every dashboard route. Checks BOTH that a Firebase session exists
 * AND that the admin custom claim is present — a signed-in-but-not-admin
 * user is bounced to /login, never shown a flash of protected content.
 */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAdminAuthStore();

  if (isLoading) return <FullScreenLoader />;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
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

  if (isLoading) return <FullScreenLoader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user && isAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />
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
          <Route path="games/:gameId/edit" element={<GameFormPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
