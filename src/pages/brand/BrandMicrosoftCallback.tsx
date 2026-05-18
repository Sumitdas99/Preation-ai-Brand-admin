import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { handleMicrosoftCallback } from "@/api/brand";
import { toastSuccess, toastError } from "@/utils/toast";
import { selectUserRole } from "@/context/slice/authSlice";

export default function BrandMicrosoftCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userRole = useSelector(selectUserRole);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state"); // This currently contains the workspace_id
            const error = searchParams.get("error");
            const errorDescription = searchParams.get("error_description");

            // Check if there's a return URL stored (e.g., from Upload page)
            const returnUrl = localStorage.getItem("sharepoint_return_url");
            const openWatchModal = localStorage.getItem("sharepoint_open_watch_modal");
            
            // Determine default redirect path based on user role
            // Content Reviewers go to settings with integrations tab, others go to dashboard/settings
            const defaultRedirectPath = userRole === "CONTENT_REVIEWER" ? "/brands/settings?tab=integrations" : "/brands/settings";
            
            // Use return URL if available, otherwise use default
            // If returning to upload page, add query parameter to open appropriate modal
            let redirectPath = returnUrl || defaultRedirectPath;
            if (returnUrl === "/upload") {
                if (openWatchModal === "true") {
                    redirectPath = "/upload?openSharePointWatchFolder=true";
                }
            }

            if (error) {
                console.error("Microsoft OAuth Error:", error, errorDescription);
                toastError(errorDescription || error || "SharePoint connection failed", "Connection Failed");
                // Clear return URL and flags on error
                if (returnUrl) localStorage.removeItem("sharepoint_return_url");
                if (openWatchModal) localStorage.removeItem("sharepoint_open_watch_modal");
                navigate(redirectPath);
                return;
            }

            if (!code || !state) {
                toastError("Missing authorization information (code or state)");
                // Clear return URL and flags on error
                if (returnUrl) localStorage.removeItem("sharepoint_return_url");
                if (openWatchModal) localStorage.removeItem("sharepoint_open_watch_modal");
                navigate(redirectPath);
                return;
            }

            try {
                // The redirect_uri must match EXACTLY what was used to generate the auth URL
                const redirectUri = window.location.origin + "/brands/microsoft/callback";

                await handleMicrosoftCallback(state, code, redirectUri);

                toastSuccess("SharePoint connected successfully");
            } catch (err: any) {
                console.error("Brand Microsoft Callback Error:", err);
                toastError(err.message || "Failed to complete SharePoint connection", "Connection Failed");
            } finally {
                // Clear return URL and flags after processing
                if (returnUrl) localStorage.removeItem("sharepoint_return_url");
                if (openWatchModal) localStorage.removeItem("sharepoint_open_watch_modal");
                // Navigate to return URL if available, otherwise use default
                navigate(redirectPath);
            }
        };

        processCallback();
    }, [searchParams, navigate, userRole]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <h2 className="mt-4 text-lg font-medium">Connecting SharePoint...</h2>
                <p className="text-muted-foreground">Please wait while we complete the integration.</p>
            </div>
        </div>
    );
}
