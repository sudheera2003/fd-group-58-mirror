import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Wait till the auth check is done (prevent kicking out logged in users while loading)
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  // Redicrt to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //Redirect if role is not allowed
  if (!allowedRoles.includes(user.role)) {
    // Send them to their safe zone based on their actual role
    if (user.role === 'admin') return ;
    if (user.role === 'organizer') return ;
    return;
  }

  //Render the page (Outlet) if all checks pass
  return <Outlet />;
}