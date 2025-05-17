
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";

type RouteGuardProps = {
  children: ReactNode;
};

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Add a small delay before rendering to prevent flashing content
  // and allow auth state to stabilize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady || isLoading) {
    // Display a loading spinner while auth state is being determined
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  console.log("RouteGuard user state:", !!user);
  
  if (!user) {
    // Redirect to auth page if user is not logged in
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
