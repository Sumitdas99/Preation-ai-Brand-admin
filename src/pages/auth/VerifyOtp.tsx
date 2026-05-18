import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { verifyForgotPasswordOtp, sendForgotPasswordOtp } from "@/api/auth";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState(30);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const superAdmin = location.state?.superAdmin;

    // Timer for resend button
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
        }
        return () => clearInterval(interval);
    }, [resendDisabled, timer]);

    // Redirect if no email (direct access prevention)
    useEffect(() => {
        if (!email) {
            navigate(superAdmin ? "/super-admin/forgot-password" : "/forgot-password");
        }
    }, [email, superAdmin, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // OTP Format validation (6 digits)
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(otp)) {
            setError("Please enter a valid 6-digit numeric code");
            return;
        }

        setIsLoading(true);

        try {
            // Call API to verify OTP
            await verifyForgotPasswordOtp(email, otp);

            toastSuccess("OTP verified successfully.", "Verified");

            // Navigate to Reset Password screen
            navigate("/reset-password", { state: { email, otp, superAdmin } });

        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendDisabled) return;

        setIsLoading(true);
        try {
            // Call API to resend OTP
            await sendForgotPasswordOtp(email);

            toastInfo("A new code has been sent to your email.", "OTP Resent");

            setResendDisabled(true);
            setTimer(30);

        } catch (err: any) {
            toastError("Failed to resend OTP.");
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
                    <p className="mt-2 text-muted-foreground">Compliance Platform</p>
                </div>

                {/* Verify OTP Card */}
                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Verify OTP</CardTitle>
                        <CardDescription>
                            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="123456"
                                    className="text-center text-2xl tracking-widest"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setOtp(val);
                                        setError(null);
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                    required
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    OTP expires in 5 minutes
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendDisabled || isLoading}
                                className={`text-sm font-medium transition-colors ${resendDisabled
                                    ? "text-muted-foreground cursor-not-allowed"
                                    : "text-primary hover:underline cursor-pointer"
                                    }`}
                            >
                                {resendDisabled
                                    ? `Resend OTP in ${timer}s`
                                    : "Resend OTP"}
                            </button>

                            <Link
                                to={superAdmin ? "/super-admin/forgot-password" : "/forgot-password"}
                                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
