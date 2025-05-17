
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useState, useEffect } from "react";

type RouteGuardProps = {
  children: ReactNode;
};

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading, authReady } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  useEffect(() => {
    // Only determine redirect after auth is ready and not loading
    if (authReady && !isLoading) {
      // Add a delay to prevent immediate redirects that could cause loops
      const timer = setTimeout(() => {
        setShouldRedirect(!user);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, authReady]);
  
  // Don't make any decisions until auth is ready
  if (!authReady || isLoading) {
    // Display a loading spinner while auth state is being determined
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  console.log("RouteGuard: Auth ready, user state:", !!user, "shouldRedirect:", shouldRedirect);
  
  // Only redirect when we're sure we should
  if (shouldRedirect) {
    console.log("RouteGuard: Redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
