import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings, AlertCircle } from "lucide-react";
import { getGoogleAuthUrl, getMicrosoftAuthUrl, updateBrand } from "@/api/brand";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSelector } from "react-redux";
import { selectUserRole } from "@/context/slice/authSlice";

interface IntegrationsTabProps {
    brandId: string;
    integrations: {
        google_drive_enabled: boolean;
        google_drive_connected: boolean;
        sharepoint_enabled: boolean;
        google_drive_connected_by_role?: string | null;
        google_drive_connected_by_user_id?: string | null;
    };
    onRefresh: () => void;
}

interface IntegrationCardProps {
    title: string;
    subtitle?: string;
    description: string;
    icon: string;
    isConnected: boolean; // Enables the "Active" badge
    hasCredentials?: boolean; // Determines if we show "Paused" instead of "Inactive"
    isComingSoon?: boolean;
    onToggle: () => void;
    isLoading?: boolean;
    disabled?: boolean; // Disable the toggle/connect button
}

function IntegrationCard({
    title,
    subtitle,
    description,
    icon,
    isConnected,
    hasCredentials = false,
    isComingSoon = false,
    onToggle,
    isLoading = false,
    disabled = false
}: IntegrationCardProps) {
    return (
        <div className={cn(
            "flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all",
            isComingSoon && "opacity-60 grayscale-[0.5]"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/20">
                        <img src={icon} alt={title} className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                </div>
                <div>
                    {!isComingSoon && (
                        isConnected ? (
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 hover:bg-green-50 hover:text-green-700">
                                active
                            </Badge>
                        ) : hasCredentials ? (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 hover:bg-yellow-50 hover:text-yellow-700">
                                paused
                            </Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-2 py-0.5">
                                Inactive
                            </span>
                        )
                    )}
                    {isComingSoon && (
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-2 py-0.5">
                            Inactive
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6 flex-grow">
                {description}
            </p>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                    {isComingSoon ? (
                        <Switch disabled checked={false} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={isConnected} // Display "ON" if enabled
                                onCheckedChange={onToggle}
                                disabled={isLoading || disabled}
                            />
                            <span className={cn("text-sm font-medium", isConnected ? "text-foreground" : "text-muted-foreground")}>
                                {isLoading ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" /> {hasCredentials ? "Updating..." : "Connecting..."}
                                    </span>
                                ) : (
                                    isConnected ? "Connected" : (hasCredentials ? "Paused" : "Disconnected")
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {isConnected && !isComingSoon && (
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                        <Settings className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function IntegrationsTab({ brandId, integrations, onRefresh }: IntegrationsTabProps) {
    const [isConnectingDrive, setIsConnectingDrive] = useState(false);
    const [isConnectingSharePoint, setIsConnectingSharePoint] = useState(false);
    const userRole = useSelector(selectUserRole);

    // Check if Brand Admin is trying to override Content Reviewer connection
    const isContentReviewerConnected = integrations.google_drive_connected &&
        integrations.google_drive_connected_by_role === "CONTENT_REVIEWER";
    const isBrandAdmin = userRole === "BRAND_ADMIN";
    const canConnect = !isContentReviewerConnected || !isBrandAdmin;

    const handleConnectGoogleDrive = async () => {
        // Prevent Brand Admin from connecting if Content Reviewer already connected
        if (isContentReviewerConnected && isBrandAdmin) {
            toastError("Google Drive integration is already enabled by a Content Reviewer. Please disconnect it first before connecting a new account.", "Cannot Connect");
            return;
        }

        setIsConnectingDrive(true);
        try {
            if (integrations.google_drive_connected) {
                // Already authenticated, just toggle enabled status
                const newStatus = !integrations.google_drive_enabled;

                // Using updateBrand API
                await updateBrand(brandId, {
                    google_drive_enabled: newStatus
                });

                toastSuccess(
                    newStatus
                        ? "Google Drive integration is now active."
                        : "Google Drive integration has been paused. No files will be synced.",
                    newStatus ? "Integration Resumed" : "Integration Paused"
                );

                // Refresh parent state to reflect change
                onRefresh();
            } else {
                // Not authenticated, start OAuth flow
                const redirectUri = window.location.origin + "/brands/google/callback";
                const response = await getGoogleAuthUrl(brandId, redirectUri);

                if (response && response.auth_url) {
                    window.location.href = response.auth_url;
                }
            }
        } catch (error: any) {
            toastError(error.message || "Failed to update Google Drive integration", "Action Failed");
        } finally {
            setIsConnectingDrive(false);
        }
    };

    const handleConnectSharePoint = async () => {
        setIsConnectingSharePoint(true);
        try {
            if (integrations.sharepoint_enabled) {
                // Toggle Off
                await updateBrand(brandId, {
                    sharepoint_enabled: !integrations.sharepoint_enabled
                });
                toastInfo("SharePoint integration has been paused.", "Integration Paused");
                onRefresh();
            } else {
                // Connect
                const redirectUri = window.location.origin + "/brands/microsoft/callback";
                const response = await getMicrosoftAuthUrl(brandId, redirectUri);

                if (response && response.auth_url) {
                    window.location.href = response.auth_url;
                }
            }
        } catch (error: any) {
            toastError(error.message || "Failed to connect SharePoint", "Action Failed");
        } finally {
            setIsConnectingSharePoint(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Warning for Brand Admin if Content Reviewer connected */}
            {isContentReviewerConnected && isBrandAdmin && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Google Drive Already Connected</AlertTitle>
                    <AlertDescription>
                        Google Drive integration is already enabled by a Content Reviewer.
                        You cannot override this connection. Please ask the Content Reviewer to disconnect it first.
                    </AlertDescription>
                </Alert>
            )}

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <IntegrationCard
                    title="Google Drive"
                    subtitle="Storage"
                    description="Automatically import assets from Google Drive folders"
                    icon="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                    isConnected={integrations.google_drive_enabled}
                    hasCredentials={integrations.google_drive_connected}
                    onToggle={handleConnectGoogleDrive}
                    isLoading={isConnectingDrive}
                    disabled={!canConnect && !integrations.google_drive_connected}
                />

                <IntegrationCard
                    title="SharePoint"
                    subtitle="Storage"
                    description="Connect to Microsoft SharePoint for asset monitoring"
                    icon="https://upload.wikimedia.org/wikipedia/commons/e/e1/Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg"
                    isConnected={integrations.sharepoint_enabled}
                    onToggle={handleConnectSharePoint}
                    isLoading={isConnectingSharePoint}
                />

                <IntegrationCard
                    title="Slack"
                    subtitle="Communication"
                    description="Receive notifications in Slack channels"
                    icon="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
                    isConnected={false}
                    isComingSoon={true}
                    onToggle={() => { }}
                />
            </div>

            {/* Instructions Section */}
            <div className="mt-12 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">Setup Instructions</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Follow these steps to connect your integrations
                </p>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            1
                        </div>
                        <div>
                            <h4 className="font-medium">Enable Integration</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Toggle the switch to enable the integration you want to use
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            2
                        </div>
                        <div>
                            <h4 className="font-medium">Authenticate</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                You will be redirected to the provider's login page to authorize access
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
