
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

// Define clear auth states for our state machine
type AuthState = 
  | "INITIALIZING" // Initial loading state
  | "AUTHENTICATED" // User is logged in
  | "UNAUTHENTICATED" // User is not logged in
  | "REDIRECTING"; // Currently handling a redirect

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("INITIALIZING");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirects based on auth state
  useEffect(() => {
    // Only handle redirects after auth is ready and not in initialization state
    if (!authReady || authState === "INITIALIZING" || authState === "REDIRECTING") {
      return;
    }

    console.log("AuthContext: Current auth state:", authState, "at path:", location.pathname);
    
    // Handle authentication-based redirects
    if (authState === "AUTHENTICATED") {
      // If user is authenticated and on auth page, redirect to dashboard
      if (location.pathname === "/auth") {
        console.log("AuthContext: Authenticated user on /auth, redirecting to dashboard");
        setAuthState("REDIRECTING");
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } else if (authState === "UNAUTHENTICATED") {
      // If user is not authenticated and on a protected page, redirect to auth
      if (location.pathname.startsWith("/dashboard")) {
        console.log("AuthContext: Unauthenticated user on protected route, redirecting to auth");
        setAuthState("REDIRECTING");
        navigate("/auth", { state: { from: location }, replace: true });
      }
    }
  }, [authState, authReady, location.pathname, navigate, location]);

  // Update auth state when user changes
  useEffect(() => {
    if (authReady) {
      setAuthState(user ? "AUTHENTICATED" : "UNAUTHENTICATED");
    }
  }, [user, authReady]);

  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setAuthState("AUTHENTICATED");
        } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          setAuthState("UNAUTHENTICATED");
        }
        
        // Set auth as ready and loading as false immediately after first auth event
        setIsLoading(false);
        setAuthReady(true);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set auth as ready and loading false after initial session check
      setIsLoading(false);
      setAuthReady(true);
      setAuthState(session ? "AUTHENTICATED" : "UNAUTHENTICATED");
    }).catch(error => {
      console.error("Error checking session:", error);
      setIsLoading(false);
      setAuthReady(true);
      setAuthState("UNAUTHENTICATED");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
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
  };

  const signUp = async (email: string, password: string) => {
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
  };

  const signOut = async () => {
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
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      authReady, 
      authState, 
      signIn, 
      signUp, 
      signOut 
    }}>
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
