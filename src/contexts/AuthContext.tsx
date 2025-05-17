
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

// Define clear auth states for our state machine
type AuthState = 
  | "INITIALIZING" // Initial loading state
  | "AUTHENTICATED" // User is logged in
  | "UNAUTHENTICATED" // User is not logged in
  | "STABLE"; // Auth state is stable and decisions can be made

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authReady: boolean;
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider that manages auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("INITIALIZING");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use refs to track previous state without triggering re-renders
  const previousPathRef = useRef<string | null>(null);
  const redirectInProgressRef = useRef<boolean>(false);

  // Handle redirects based on auth state - debounced
  useEffect(() => {
    // Skip redirect logic during initialization
    if (!authReady || authState === "INITIALIZING") {
      return;
    }

    // Prevent handling redirects multiple times for the same path
    if (previousPathRef.current === location.pathname) {
      return;
    }
    previousPathRef.current = location.pathname;

    // Don't redirect if we're already in a redirect operation
    if (redirectInProgressRef.current) {
      return;
    }

    console.log("AuthContext: Current auth state:", authState, "at path:", location.pathname);
    
    // Only handle redirects after auth state is stable
    if (authState === "STABLE") {
      // If user is authenticated and on auth page, redirect to dashboard
      if (user && location.pathname === "/auth") {
        console.log("AuthContext: Authenticated user on /auth, redirecting to dashboard");
        redirectInProgressRef.current = true;
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        setTimeout(() => {
          redirectInProgressRef.current = false;
          navigate(from, { replace: true });
        }, 10);
      } 
      // If user is not authenticated and on a protected page, redirect to auth
      else if (!user && location.pathname.startsWith("/dashboard")) {
        console.log("AuthContext: Unauthenticated user on protected route, redirecting to auth");
        redirectInProgressRef.current = true;
        setTimeout(() => {
          redirectInProgressRef.current = false;
          navigate("/auth", { state: { from: location }, replace: true });
        }, 10);
      }
    }
  }, [authState, authReady, location.pathname, navigate, location, user]);

  // Set up auth state listeners once on component mount
  useEffect(() => {
    console.log("Setting up auth state listener...");
    let mounted = true;
    
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        if (!mounted) return;
        
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          setAuthState("AUTHENTICATED");
        } else {
          setSession(null);
          setUser(null);
          setAuthState("UNAUTHENTICATED");
        }
        
        // Mark auth as ready after processing auth event
        setIsLoading(false);
        setAuthReady(true);
        
        // Set stable state after a small delay to allow state to settle
        setTimeout(() => {
          if (mounted) {
            setAuthState("STABLE");
          }
        }, 50);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      
      console.log("Initial session check:", initialSession?.user?.email);
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        setAuthState("AUTHENTICATED");
      } else {
        setAuthState("UNAUTHENTICATED");
      }
      
      setIsLoading(false);
      setAuthReady(true);
      
      // Set stable state after a small delay to allow state to settle
      setTimeout(() => {
        if (mounted) {
          setAuthState("STABLE");
        }
      }, 50);
    }).catch(error => {
      if (!mounted) return;
      
      console.error("Error checking session:", error);
      setAuthState("UNAUTHENTICATED");
      setIsLoading(false);
      setAuthReady(true);
      
      // Set stable state after a small delay to allow state to settle
      setTimeout(() => {
        if (mounted) {
          setAuthState("STABLE");
        }
      }, 50);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Memoize auth methods to maintain reference equality between renders
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        // Auth state listener will handle the state updates
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
        // Auth state listener will handle the state updates
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      // Auth state listener will handle the state updates
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred signing out.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  // Creating a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    session, 
    user, 
    isLoading, 
    authReady, 
    authState, 
    signIn, 
    signUp, 
    signOut
  }), [session, user, isLoading, authReady, authState, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
