import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi } from "@/api/admin";

export default function AcceptInvitation() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid invitation link. Token is missing.");
        }
    }, [token]);

    const handleAccept = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            await adminApi.acceptInvitation(token);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to accept invitation. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md animate-scale-in">
                    <Card className="card-shadow-lg border-green-500/20">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-display">Invitation Accepted!</CardTitle>
                            <CardDescription>
                                You have successfully joined the workspace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-muted-foreground">
                                Please log in with your email and the temporary password provided in your invitation email.
                            </p>
                            <Button
                                className="w-full bg-gradient-primary"
                                onClick={() => navigate("/login")}
                            >
                                Proceed to Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

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

                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Join Workspace</CardTitle>
                        <CardDescription>
                            You have been invited to collaborate on Praetion AI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                By clicking below, you accept the invitation to join the workspace and agree to our terms of service.
                            </p>

                            <Button
                                onClick={handleAccept}
                                className="w-full bg-gradient-primary"
                                disabled={isLoading || !token}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "Accept Invitation"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
