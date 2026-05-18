import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastInfo } from "@/utils/toast";
import { sendForgotPasswordOtp } from "@/api/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isSuperAdmin = location.pathname.startsWith("/super-admin");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            // Call API to send OTP
            await sendForgotPasswordOtp(email);

            toastInfo("If an account exists, you will receive a code shortly.", "OTP Sent");

            // Navigate to OTP verification screen, passing email and superAdmin for back/success links
            navigate("/verify-otp", { state: { email, superAdmin: isSuperAdmin } });

        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
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
                    <p className="mt-2 text-muted-foreground">{isSuperAdmin ? "Super Admin" : "Compliance Platform"}</p>
                </div>

                {/* Forgot Password Card */}
                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Reset your password</CardTitle>
                        <CardDescription>
                            Enter your registered work email to receive a one-time password (OTP)
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
                                <Label htmlFor="email">Work Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to={isSuperAdmin ? "/super-admin/login" : "/login"}
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
