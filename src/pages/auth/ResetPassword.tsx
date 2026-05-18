import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess } from "@/utils/toast";
import { resetPasswordWithOtp } from "@/api/auth";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const otp = location.state?.otp; // In real flow, verify token/otp again or rely on session
    const superAdmin = location.state?.superAdmin;

    // Redirect if missing context
    useEffect(() => {
        if (!email || !otp) {
            navigate(superAdmin ? "/super-admin/forgot-password" : "/forgot-password");
        }
    }, [email, otp, superAdmin, navigate]);

    // Password validation rules
    const checks = {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const allChecksPassed = Object.values(checks).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!allChecksPassed) {
            setError("Please meet all password requirements");
            return;
        }

        setIsLoading(true);

        try {
            // Call API to reset password
            await resetPasswordWithOtp(email, otp, password);

            toastSuccess("Your password has been reset successfully. Please login.", "Password Updated");

            // Navigate to Login (super admin flow goes to super admin login)
            navigate(superAdmin ? "/super-admin/login" : "/login");

        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
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
                    <p className="mt-2 text-muted-foreground">Compliance Platform</p>
                </div>

                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Create new password</CardTitle>
                        <CardDescription>
                            Set a new secure password for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Rules Indicators */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Requirement label="8+ chars" met={checks.minLength} />
                                    <Requirement label="Uppercase" met={checks.hasUpper} />
                                    <Requirement label="Number" met={checks.hasNumber} />
                                    <Requirement label="Special char" met={checks.hasSpecial} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
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
                                disabled={isLoading || !allChecksPassed}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to={superAdmin ? "/super-admin/login" : "/login"}
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => {
                                    if (isLoading) e.preventDefault();
                                }}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Requirement({ label, met }: { label: string; met: boolean }) {
    return (
        <div className={`flex items-center text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}>
            {met ? (
                <Check className="mr-1 h-3 w-3" />
            ) : (
                <div className="mr-1 h-1 w-1 rounded-full bg-muted-foreground/50" />
            )}
            {label}
        </div>
    );
}
