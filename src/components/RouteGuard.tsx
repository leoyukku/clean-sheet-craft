import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

type RouteGuardProps = {
  children: ReactNode;
};

export function RouteGuard({ children }: RouteGuardProps) {
  const { authState, authReady, isLoading } = useAuth();
  
  // Don't make any decisions until auth is ready
  if (!authReady || isLoading) {
    // Display a loading spinner while auth state is being determined
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  console.log("RouteGuard: Current auth state:", authState);
  
  // If not authenticated, redirect to auth page
  if (authState === "UNAUTHENTICATED") {
    return <Navigate to="/auth" replace />;
  }
  
  // Otherwise, render the children
  return <>{children}</>;
}
