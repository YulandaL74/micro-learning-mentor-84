import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";

type PasswordStrength = "weak" | "medium" | "strong";

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const checkPasswordRequirements = (password: string): PasswordRequirements => ({
  minLength: password.length >= 12,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[^a-zA-Z0-9]/.test(password),
});

const isPasswordValid = (password: string): boolean => {
  const req = checkPasswordRequirements(password);
  return req.minLength && req.hasUppercase && req.hasLowercase && req.hasNumber && req.hasSpecial;
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (password.length === 0) return "weak";
  
  const req = checkPasswordRequirements(password);
  const metCount = Object.values(req).filter(Boolean).length;
  
  if (metCount <= 2) return "weak";
  if (metCount <= 4) return "medium";
  return "strong";
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrength = useMemo(() => calculatePasswordStrength(signupPassword), [signupPassword]);
  const passwordRequirements = useMemo(() => checkPasswordRequirements(signupPassword), [signupPassword]);
  const newPasswordStrength = useMemo(() => calculatePasswordStrength(newPassword), [newPassword]);
  const newPasswordRequirements = useMemo(() => checkPasswordRequirements(newPassword), [newPassword]);

  useEffect(() => {
    // Check if user is already logged in or in recovery mode
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for password recovery token in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setIsRecoveryMode(true);
      } else if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.session) {
        toast({
          title: "Success!",
          description: "Welcome back to Micro-Learning Mentor.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setShowResetForm(false);
        setResetEmail("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      toast({
        title: "Password requirements not met",
        description: "Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated!",
          description: "Your password has been successfully updated.",
        });
        setIsRecoveryMode(false);
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isPasswordValid(signupPassword)) {
      toast({
        title: "Password requirements not met",
        description: "Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please log in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to Micro-Learning Mentor. Let's start learning!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Micro-Learning Mentor</CardTitle>
          <CardDescription>
            {isRecoveryMode ? "Set your new password" : "Master professional skills in just 5 minutes daily"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecoveryMode ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={12}
                />
                {newPassword.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        newPasswordStrength === "weak" ? "bg-destructive" : 
                        newPasswordStrength === "medium" ? "bg-warning" : 
                        "bg-success"
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        newPasswordStrength === "medium" ? "bg-warning" : 
                        newPasswordStrength === "strong" ? "bg-success" : 
                        "bg-muted"
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        newPasswordStrength === "strong" ? "bg-success" : "bg-muted"
                      }`} />
                    </div>
                    <ul className="text-xs space-y-1 mt-2">
                      <li className={newPasswordRequirements.minLength ? "text-success" : "text-muted-foreground"}>
                        {newPasswordRequirements.minLength ? "✓" : "○"} At least 12 characters
                      </li>
                      <li className={newPasswordRequirements.hasUppercase ? "text-success" : "text-muted-foreground"}>
                        {newPasswordRequirements.hasUppercase ? "✓" : "○"} One uppercase letter
                      </li>
                      <li className={newPasswordRequirements.hasLowercase ? "text-success" : "text-muted-foreground"}>
                        {newPasswordRequirements.hasLowercase ? "✓" : "○"} One lowercase letter
                      </li>
                      <li className={newPasswordRequirements.hasNumber ? "text-success" : "text-muted-foreground"}>
                        {newPasswordRequirements.hasNumber ? "✓" : "○"} One number
                      </li>
                      <li className={newPasswordRequirements.hasSpecial ? "text-success" : "text-muted-foreground"}>
                        {newPasswordRequirements.hasSpecial ? "✓" : "○"} One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={12}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {showResetForm ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a link to reset your password
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowResetForm(false)}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-xs text-primary hover:underline"
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={12}
                  />
                  {signupPassword.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <div className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === "weak" ? "bg-destructive" : 
                          passwordStrength === "medium" ? "bg-warning" : 
                          "bg-success"
                        }`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === "medium" ? "bg-warning" : 
                          passwordStrength === "strong" ? "bg-success" : 
                          "bg-muted"
                        }`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength === "strong" ? "bg-success" : "bg-muted"
                        }`} />
                      </div>
                      <ul className="text-xs space-y-1 mt-2">
                        <li className={passwordRequirements.minLength ? "text-success" : "text-muted-foreground"}>
                          {passwordRequirements.minLength ? "✓" : "○"} At least 12 characters
                        </li>
                        <li className={passwordRequirements.hasUppercase ? "text-success" : "text-muted-foreground"}>
                          {passwordRequirements.hasUppercase ? "✓" : "○"} One uppercase letter
                        </li>
                        <li className={passwordRequirements.hasLowercase ? "text-success" : "text-muted-foreground"}>
                          {passwordRequirements.hasLowercase ? "✓" : "○"} One lowercase letter
                        </li>
                        <li className={passwordRequirements.hasNumber ? "text-success" : "text-muted-foreground"}>
                          {passwordRequirements.hasNumber ? "✓" : "○"} One number
                        </li>
                        <li className={passwordRequirements.hasSpecial ? "text-success" : "text-muted-foreground"}>
                          {passwordRequirements.hasSpecial ? "✓" : "○"} One special character
                        </li>
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
