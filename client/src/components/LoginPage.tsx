import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface LoginPageProps {
  onDemoLogin: () => void;
}

export function LoginPage({ onDemoLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.name}!`);
      // Reload to pick up the auth cookie
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    },
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-4">
        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Sustech ERP</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to access your business dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="password" className="data-[state=active]:bg-primary">
                  Email & Password
                </TabsTrigger>
                <TabsTrigger value="oauth" className="data-[state=active]:bg-primary">
                  OAuth / Demo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="space-y-4 mt-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        data-testid="login-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        data-testid="login-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="login-submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="oauth" className="space-y-4 mt-4">
                <Button
                  onClick={() => { window.location.href = getLoginUrl(); }}
                  size="lg"
                  className="w-full"
                  variant="outline"
                  data-testid="oauth-login"
                >
                  Sign in with OAuth
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or</span>
                  </div>
                </div>
                <Button
                  onClick={onDemoLogin}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  data-testid="demo-login"
                >
                  Demo Mode (Admin Access)
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Demo mode gives you full admin access to explore the system
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-slate-500 mt-4">
          Sustech Operations & Growth KPI Dashboard
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
