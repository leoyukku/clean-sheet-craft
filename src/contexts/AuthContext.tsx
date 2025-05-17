import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authReady: boolean; // New state to track when auth is fully initialized
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // Track when auth is ready
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state listener...");
    let authStateInitialized = false;
    
    // Set up auth state listener FIRST to catch all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've received at least one auth state event
        if (!authStateInitialized) {
          authStateInitialized = true;
          // Small delay to ensure state settles
          setTimeout(() => {
            setIsLoading(false);
            setAuthReady(true);
          }, 500);
        } else {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we haven't received an auth state event after 1 second,
      // consider auth initialized anyway to prevent a stuck loading state
      setTimeout(() => {
        if (!authStateInitialized) {
          console.log("Auth state initialization timeout - setting ready");
          authStateInitialized = true;
          setIsLoading(false);
          setAuthReady(true);
        }
      }, 1000);
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
        setIsLoading(false); // Reset loading state on error
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
        // Auth state listener will handle the state update
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading state on error
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
        setIsLoading(false); // Reset loading only on error
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
        // Auth state listener will handle the isLoading state
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading only on error
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
      // Auth state listener will handle the isLoading state and user state reset
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
    <AuthContext.Provider value={{ session, user, isLoading, authReady, signIn, signUp, signOut }}>
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
