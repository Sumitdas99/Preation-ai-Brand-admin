import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toastSuccess, toastError } from "@/utils/toast";
import { completeNewPasswordChallenge } from "@/api/auth";
import { loginSuccess, setLoading } from "@/context/slice/authSlice";
import type { UserRole } from "@/context/slice/authSlice";

export default function ForceChangePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { session, email } = location.state || {};

    useEffect(() => {
        if (!session || !email) {
            navigate("/login");
        }
    }, [session, email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Password strength check (optional but good)
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);

        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
            setError("Password must contain uppercase, lowercase, number and special character");
            return;
        }

        setIsLoading(true);
        dispatch(setLoading(true));

        try {
            const response = await completeNewPasswordChallenge({
                session,
                email,
                new_password: newPassword
            }, dispatch);

            // Login success logic (similar to Login.tsx)
            const user = {
                id: response.user_id,
                email: response.email,
                name: response.display_name || `${response.firstName} ${response.lastName}`,
                role: response.role as UserRole,
                workspaceId: response.brand_id,
                workspaceName: response.brand_name,
                firstName: response.firstName,
                lastName: response.lastName,
                display_name: response.display_name,
                brand_id: response.brand_id,
                brandId: response.brand_id, // Map for components that expect camelCase
                brand_name: response.brand_name,
                brandName: response.brand_name, // Map for components that expect camelCase
            };

            dispatch(loginSuccess({
                user,
                token: response.access_token,
            }));

            localStorage.setItem("auth_token", response.access_token);

            toastSuccess("Password changed successfully! You are now logged in.");

            if (response.role === "super_admin") {
                navigate("/super-admin");
            } else {
                navigate("/dashboard");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to set new password");
            toastError(err.message || "Failed to set new password");
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
                    <h1 className="mt-4 font-display text-3xl font-bold">Secure Your Account</h1>
                    <p className="mt-2 text-muted-foreground">Please set a new password to continue</p>
                </div>

                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            For your security, you must change your temporary password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Password must be at least 8 chars long and include uppercase, lowercase, number, and special character.
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    "Set Password & Login"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
