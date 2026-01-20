import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // wait for auth check
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  // if not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if logged in, but wrong role, redirect to their own home page
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/projects" replace />;
    return <Navigate to="/member/tasks" replace />;
  }

  return <Outlet />;
}