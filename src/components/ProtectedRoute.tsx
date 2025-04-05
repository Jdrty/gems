import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

const ProtectedRoute = ({ children, allowGuest = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isGuestMode, loading: appLoading } = useApp();
  const loading = authLoading || appLoading;

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If guest mode is enabled and the route allows guests, or if the user is logged in
  if ((isGuestMode && allowGuest) || user || isGuestMode) {
    return <>{children}</>;
  }

  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
