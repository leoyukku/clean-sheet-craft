
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Auth() {
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  const { user, signIn, signUp, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [authInProgress, setAuthInProgress] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // Only redirect when we have a user AND we're not currently loading
    // This prevents premature redirects during auth state resolution
    if (user && !isLoading && !isRedirecting) {
      console.log("Auth page redirecting to:", from);
      setIsRedirecting(true);
    }
  }, [user, isLoading, from, isRedirecting]);

  // If redirecting to dashboard, do it properly with a delay to ensure state is stable
  if (isRedirecting) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authInProgress) return;
    
    setAuthInProgress(true);
    
    try {
      if (activeTab === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } finally {
      setAuthInProgress(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container">
          <h1 className="text-xl font-medium">YourApp</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input 
                      id="signin-password" 
                      type="password" 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
                    disabled={isLoading || authInProgress}
                  >
                    {isLoading || authInProgress ? "Signing In..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>Fill out the form below to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="Create a password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
                    disabled={isLoading || authInProgress}
                  >
                    {isLoading || authInProgress ? "Signing Up..." : "Sign Up"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
