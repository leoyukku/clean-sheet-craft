
import { ReactNode, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

type RouteGuardProps = {
  children: ReactNode;
};

// Memoize the component to prevent unnecessary re-renders
export const RouteGuard = memo(function RouteGuard({ children }: RouteGuardProps) {
  const { authState, authReady, isLoading, user } = useAuth();
  
  // Show loading spinner during initialization
  if (!authReady || isLoading || authState === "INITIALIZING") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  console.log("RouteGuard: Current auth state:", authState, "User:", user?.email);
  
  // Simple check - if not authenticated and state is stable, redirect
  if (authState === "STABLE" && !user) {
    console.log("RouteGuard: Redirecting unauthenticated user to auth page");
    return <Navigate to="/auth" replace />;
  }
  
  // Otherwise, render the children
  return <>{children}</>;
});
