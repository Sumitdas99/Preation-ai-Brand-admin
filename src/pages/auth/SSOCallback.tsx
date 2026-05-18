import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { handleGoogleCallback, handleMicrosoftCallback } from "@/api/auth";
import { loginSuccess, logout } from "@/context/slice/authSlice";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import type { UserRole } from "@/context/slice/authSlice";

export default function SSOCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    console.log("SSOCallback component loaded!"); // Basic debug
    console.log("Current URL:", window.location.href);
    console.log("Search params:", searchParams.toString());

    useEffect(() => {
        console.log("useEffect triggered in SSOCallback");

        const processCallback = async () => {
            console.log("processCallback started");
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            // Determine provider from path or query param. 
            // Assuming route is /auth/:provider/callback or we check a stored provider
            // For now, let's try to detect or assume based on query params if possible, 
            // but standard OAuth2 just returns code.
            // We'll rely on the route definition to pass the provider, or parse window.location.pathname

            const path = window.location.pathname;
            let provider = "google";
            if (path.includes("microsoft")) {
                provider = "microsoft";
            }

            if (error) {
                toastError(error || "Authentication failed", "Login failed");
                navigate("/login");
                return;
            }

            if (!code) {
                toastError("No authorization code received");
                navigate("/login");
                return;
            }

            try {
                let response;
                if (provider === "microsoft") {
                    response = await handleMicrosoftCallback(code, dispatch);
                } else {
                    response = await handleGoogleCallback(code, dispatch);
                }

                console.log("SSO Response:", response); // Debug log

                // Map backend response to frontend User interface
                // OAuth response structure: { access_token, token_type, user_id, email, firstName, lastName, has_brand, message }

                // CHECK IF NEW USER (Registration Token Flow)
                if (response.is_new_user) {
                    console.log("New user detected (Registration Flow)");

                    // We need to store the REGISTRATION token, not the auth token
                    // We can use a query param or state to pass it to the create-brand page
                    // Or store it temporarily in sessionStorage/localStorage

                    localStorage.setItem("sso_registration_token", response.access_token);
                    localStorage.setItem("sso_user_email", response.email);
                    localStorage.setItem("sso_user_name", `${response.firstName} ${response.lastName}`);

                    toastInfo(response.message || "Please create your brand to complete setup.", "Almost there!");

                    // Redirect to brand creation page
                    navigate("/create-brand");
                    return;
                }

                const user = {
                    id: response.user_id,
                    email: response.email,
                    name: response.display_name || `${response.firstName || ""} ${response.lastName || ""}`.trim() || response.email,
                    role: (response.role ? response.role.toUpperCase() : "USER") as UserRole,
                    workspaceId: response.brand_id || null,
                    workspaceName: response.brand_name || null,
                    firstName: response.firstName || "",
                    lastName: response.lastName || "",
                    display_name: response.display_name || `${response.firstName || ""} ${response.lastName || ""}`.trim() || null,
                    brand_id: response.brand_id || null,
                    brandId: response.brand_id || null,
                    brand_name: response.brand_name || null,
                    brandName: response.brand_name || null,
                };

                // Store token and user in Redux (needed for brand creation page)
                dispatch(loginSuccess({
                    user,
                    token: response.access_token,
                }));

                // Also store token in localStorage
                localStorage.setItem("auth_token", response.access_token);

                // Check if user needs to create a brand (Legacy check - should be covered by is_new_user now)
                const hasBrand = response.has_brand === true || response.has_brand === "true";

                console.log("Checking has_brand:", response.has_brand, typeof response.has_brand, "Result:", hasBrand);

                if (!hasBrand && !response.is_new_user) {
                    // Fallback for edge cases where user exists but has no brand
                    console.log("User needs to create brand, redirecting to brand creation");
                    // We might need to handle this differently if they don't have a registration token
                    // But for now, let's assume they are logged in and can create brand via standard flow
                    toastInfo(response.message || "Please create your brand to complete setup.", "Welcome!");
                    navigate("/create-brand");
                    return;
                }

                // User has a brand, redirect to dashboard
                console.log("User has brand, redirecting to dashboard");
                toastSuccess(`Welcome back, ${user.name}!`);

                // Navigate based on role (if available)
                if (response.role === "super_admin") {
                    navigate("/super-admin");
                } else {
                    navigate("/dashboard");
                }

            } catch (err: unknown) {
                console.error("SSO Error:", err);

                const e = err as {
                    message?: string;
                    response?: { status?: number; data?: { detail?: string; message?: string } };
                };

                let errorMessage =
                    (typeof e?.response?.data?.detail === "string" && e.response.data.detail) ||
                    (typeof e?.response?.data?.message === "string" && e.response.data.message) ||
                    (typeof e?.message === "string" && e.message) ||
                    "Failed to complete authentication";

                const lowerError = errorMessage.toLowerCase();

                // Map errors
                if (lowerError.includes("pending approval") || lowerError.includes("pending verification")) {
                    errorMessage = "Your account is pending approval. A Super Admin must approve your access before you can log in.";
                } else if (lowerError.includes("rejected")) {
                    errorMessage = "Your registration request was rejected. Please contact support for more information.";
                } else if (lowerError.includes("disabled") || lowerError.includes("inactive")) {
                    errorMessage = "Your account has been disabled. Please contact support.";
                }

                // Clear any partial auth state
                localStorage.removeItem("auth_token");
                localStorage.removeItem("persist:root");
                dispatch(logout());

                // Show toast
                toastError(errorMessage, "Login failed");

                // Redirect to login (and pass error state if needed, though toast handles it)
                navigate("/login", {
                    state: {
                        error: errorMessage,
                        fromSSO: true
                    }
                });
            }
        };

        processCallback();
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <h2 className="mt-4 text-lg font-medium">Completing authentication...</h2>
                <p className="text-muted-foreground">Please wait while we log you in.</p>
            </div>
        </div>
    );
}
