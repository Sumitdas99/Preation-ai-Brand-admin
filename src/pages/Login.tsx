import { useState, useEffect } from "react";
import { Shield, Info, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toastSuccess, toastError } from "@/utils/toast";
import { loginSuccess, setLoading } from "@/context/slice/authSlice";
import { login as loginApi, initiateGoogleSSO, initiateMicrosoftSSO } from "@/api/auth";
import type { UserRole } from "@/context/slice/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Import useLocation
  const dispatch = useDispatch();

  // Check for error passed from SSO callback via navigation state
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);

      // Optional: Clear state so refresh doesn't show error again? 
      // Actually good to keep it until user interacts.

      // Also show toast for visibility
      if (location.state.fromSSO) {
        toastError(location.state.error, "Login blocked");
      }

      // Clean up history state to prevent error persisting on reload?
      // navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const authUrl = await initiateGoogleSSO();
      window.location.href = authUrl;
    } catch (error: any) {
      toastError(error.message || "Failed to initiate Google login");
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      const authUrl = await initiateMicrosoftSSO();
      window.location.href = authUrl;
    } catch (error: any) {
      toastError(error.message || "Failed to initiate Microsoft login");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      toastError("Please enter both email and password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toastError("Please enter a valid email address", "Invalid email");
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      // Call login API
      const response = await loginApi({ email: email.toLowerCase().trim(), password }, dispatch);

      // Check for New Password Challenge
      if (response.challenge_name === "NEW_PASSWORD_REQUIRED") {
        navigate("/force-change-password", {
          state: {
            session: response.session,
            email: response.email
          }
        });
        return;
      }

      // Map backend response to frontend User interface
      const user = {
        id: response.user_id,
        email: response.email,
        name: response.display_name || `${response.firstName} ${response.lastName}`,
        role: response.role as UserRole,
        workspaceId: response.workspace_id,
        workspaceName: response.brand_name,
        firstName: response.firstName,
        lastName: response.lastName,
        display_name: response.display_name,
        brand_id: response.brand_id,
        brandId: response.brand_id, // Map for components that expect camelCase
        brand_name: response.brand_name,
        brandName: response.brand_name, // Map for components that expect camelCase
      };

      // Store token and user in Redux (which persists to localStorage via redux-persist)
      dispatch(loginSuccess({
        user,
        token: response.access_token,
      }));

      // Also store token in localStorage for immediate access
      localStorage.setItem("auth_token", response.access_token);

      toastSuccess(`Welcome back, ${user.name}!`);

      // Navigate based on role
      if (response.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      // Handle error - error message is already extracted in the API function
      let errorMessage = err.message || "Login failed. Please check your credentials and try again.";
      const lowerError = errorMessage.toLowerCase();

      // Backend returns 403 for Super Admin on regular login → redirect to super-admin login
      if (err.response?.status === 403 && (lowerError.includes("super admin") || lowerError.includes("super admin login"))) {
        toastError("Super Admins must sign in on the Super Admin login page.", "Use Super Admin login");
        navigate("/super-admin/login", { replace: true });
        return;
      }

      // Map strict access control errors to friendly messages
      if (lowerError.includes("pending approval") || lowerError.includes("pending verification")) {
        errorMessage = "Your account is pending approval. A Super Admin must approve your access before you can log in.";
      } else if (lowerError.includes("rejected")) {
        errorMessage = "Your registration request was rejected. Please contact support for more information.";
      } else if (lowerError.includes("disabled") || lowerError.includes("deactivated") || lowerError.includes("inactive")) {
        errorMessage = "Your account has been disabled. Please contact support.";
      } else if (lowerError.includes("invalid email or password")) {
        errorMessage = "Invalid email or password.";
      }

      setError(errorMessage);

      toastError(errorMessage, "Login failed");
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Praetion AI</h1>
          <p className="mt-2 text-muted-foreground">Compliance Platform</p>
        </div>

        {/* Login Card */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="sso">SSO</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                      {(error.includes("rejected") || error.includes("disabled")) && (
                        <div className="mt-2">
                          <a href="#" className="font-medium underline hover:text-red-800">
                            Contact Support
                          </a>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null); // Clear error when user types
                      }}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null); // Clear error when user types
                        }}
                        disabled={isLoading}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary"
                    disabled={isLoading}
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

              <TabsContent value="sso" className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleMicrosoftLogin} disabled={isLoading}>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Sign in with Microsoft
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>


        
      </div>
    </div>
  );
}
