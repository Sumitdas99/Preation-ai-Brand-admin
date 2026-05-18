import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess, toastError } from "@/utils/toast";
import { loginSuccess, setLoading } from "@/context/slice/authSlice";
import { loginSuperAdmin } from "@/api/auth";
import type { UserRole } from "@/context/slice/authSlice";

/**
 * Super Admin only login page. Email/password only (no SSO).
 * Uses dedicated super-admin login API; backend rejects non–Super Admin users.
 */
export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      toastError("Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toastError("Please enter a valid email address", "Invalid email");
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await loginSuperAdmin(
        { email: email.toLowerCase().trim(), password },
        dispatch
      );

      if (response.challenge_name === "NEW_PASSWORD_REQUIRED") {
        navigate("/force-change-password", {
          state: { session: response.session, email: response.email },
        });
        return;
      }

      const user = {
        id: response.user_id,
        email: response.email,
        name: response.display_name || `${response.firstName} ${response.lastName}`,
        role: (response.role === "super_admin" ? "SUPER_ADMIN" : response.role) as UserRole,
        workspaceId: response.workspace_id,
        workspaceName: response.brand_name,
        firstName: response.firstName,
        lastName: response.lastName,
        display_name: response.display_name,
        brand_id: response.brand_id,
        brandId: response.brand_id,
        brand_name: response.brand_name,
        brandName: response.brand_name,
      };

      dispatch(
        loginSuccess({
          user,
          token: response.access_token,
        })
      );
      localStorage.setItem("auth_token", response.access_token);

      toastSuccess(`Welcome back, ${user.name}!`);

      navigate("/super-admin");
    } catch (err: any) {
      const errorMessage =
        err.message ||
        "Login failed. Please check your credentials and try again.";
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
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Praetion AI</h1>
          <p className="mt-2 text-muted-foreground">Super Admin</p>
        </div>

        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Super Admin sign in</CardTitle>
            <CardDescription>
              Sign in with your Super Admin account (email and password only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sa-email">Email</Label>
                <Input
                  id="sa-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sa-password">Password</Label>
                  <Link
                    to="/super-admin/forgot-password"
                    className="text-sm text-primary hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="sa-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
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
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
