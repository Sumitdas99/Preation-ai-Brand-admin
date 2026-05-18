import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FolderOpen, Trash2 } from "lucide-react";
import { getGoogleAuthUrl, getMicrosoftAuthUrl, disconnectGoogleDrive, disconnectSharePoint, listWatchedFolders, removeWatchFolder } from "@/api/brand";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { cn } from "@/lib/utils";
import ApiClient from "@/api-client";
import { API_URL } from "@/environment";

interface WatchFolderItem {
  id: string;
  folder_id: string;
  folder_name: string | null;
  provider: string;
  is_active: boolean;
}

interface ContentReviewerIntegrationsProps {
  brandId: string;
}

interface IntegrationStatus {
  google_drive_enabled: boolean;
  google_drive_connected: boolean;
  google_drive_connected_by_role?: string | null;
  sharepoint_enabled: boolean;
  sharepoint_connected: boolean;
  sharepoint_connected_by_role?: string | null;
}

/** SharePoint logo as inline SVG (avoids external URL load issues) – Microsoft SharePoint teal + white S */
function SharePointIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#03787C" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif">
        S
      </text>
    </svg>
  );
}

function IntegrationCard({
  title,
  subtitle,
  description,
  icon,
  iconType,
  isConnected,
  onAction,
  isLoading = false,
  disabled = false,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  iconType?: "sharepoint";
  isConnected: boolean;
  onAction: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  actionLabel: string;
}) {
  return (
    <div className={cn(
      "flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/20">
            {iconType === "sharepoint" ? (
              <SharePointIcon className="h-8 w-8" />
            ) : (
              <img src={icon} alt={title} className="h-8 w-8 object-contain" />
            )}
          </div>
          <div>
            <h3 className="font-semibold leading-none tracking-tight text-lg">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        <div>
          {isConnected ? (
            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 hover:bg-green-50 hover:text-green-700">
              active
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              INACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 flex-grow">
        {description}
      </p>

      {/* Footer / Single Connect or Disconnect button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onAction}
          disabled={isLoading || disabled}
          variant={isConnected ? "outline" : "default"}
          size="sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> {isConnected ? "Disconnecting..." : "Connecting..."}
            </span>
          ) : (
            actionLabel
          )}
        </Button>
      </div>
    </div>
  );
}

export function ContentReviewerIntegrations({ brandId }: ContentReviewerIntegrationsProps) {
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [isConnectingSharePoint, setIsConnectingSharePoint] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    google_drive_enabled: false,
    google_drive_connected: false,
    sharepoint_enabled: false,
    sharepoint_connected: false,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [watchFolders, setWatchFolders] = useState<WatchFolderItem[]>([]);
  const [watchFoldersLoading, setWatchFoldersLoading] = useState(false);
  const [removingWatchId, setRemovingWatchId] = useState<string | null>(null);

  // Fetch integration status
  useEffect(() => {
    if (brandId) {
      fetchIntegrationStatus();
    }
  }, [brandId]);

  // Fetch watch folders for this brand
  const fetchWatchFolders = async () => {
    if (!brandId) return;
    setWatchFoldersLoading(true);
    try {
      const list = await listWatchedFolders(brandId);
      setWatchFolders(list as WatchFolderItem[]);
    } catch (err: any) {
      console.warn("Could not fetch watch folders:", err);
      setWatchFolders([]);
    } finally {
      setWatchFoldersLoading(false);
    }
  };

  useEffect(() => {
    if (brandId && !isLoadingStatus) {
      fetchWatchFolders();
    }
  }, [brandId, isLoadingStatus]);

  const fetchIntegrationStatus = async () => {
    if (!brandId) return;

    setIsLoadingStatus(true);
    try {
      // Call a lightweight endpoint to get just the integration status
      // We'll create this endpoint or use existing one
      const response = await ApiClient.get(
        `${API_URL}/brands/${brandId}/integrations/status`,
        {},
        null,
        null
      );
      setIntegrationStatus({
        google_drive_enabled: response.google_drive_enabled || false,
        google_drive_connected: response.google_drive_connected || false,
        google_drive_connected_by_role: response.google_drive_connected_by_role,
        sharepoint_enabled: response.sharepoint_enabled || false,
        sharepoint_connected: response.sharepoint_connected || false,
        sharepoint_connected_by_role: response.sharepoint_connected_by_role,
      });
    } catch (error: any) {
      // If endpoint doesn't exist, try to get minimal info from brand settings
      // For now, default to not connected
      console.warn("Could not fetch integration status:", error);
      setIntegrationStatus({
        google_drive_enabled: false,
        google_drive_connected: false,
        sharepoint_enabled: false,
        sharepoint_connected: false,
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleGoogleDriveAction = async () => {
    setIsConnectingDrive(true);
    try {
      if (integrationStatus.google_drive_connected) {
        await disconnectGoogleDrive(brandId);
        await fetchIntegrationStatus();
        await fetchWatchFolders();
        toastInfo("Google Drive has been disconnected and removed from this brand.", "Disconnected");
      } else {
        const redirectUri = window.location.origin + "/brands/google/callback";
        const response = await getGoogleAuthUrl(brandId, redirectUri);
        if (response?.auth_url) {
          window.location.href = response.auth_url;
        } else {
          toastError("Could not get Google Drive authorization URL.", "Action Failed");
        }
      }
    } catch (error: any) {
      toastError(error.message || "Failed to update Google Drive integration", "Action Failed");
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleSharePointAction = async () => {
    setIsConnectingSharePoint(true);
    try {
      if (integrationStatus.sharepoint_connected) {
        await disconnectSharePoint(brandId);
        await fetchIntegrationStatus();
        await fetchWatchFolders();
        toastInfo("SharePoint has been disconnected and removed from this brand.", "Disconnected");
      } else {
        const redirectUri = window.location.origin + "/brands/microsoft/callback";
        const response = await getMicrosoftAuthUrl(brandId, redirectUri);
        if (response?.auth_url) {
          window.location.href = response.auth_url;
        } else {
          toastError("Could not get SharePoint authorization URL.", "Action Failed");
        }
      }
    } catch (error: any) {
      toastError(error.message || "Failed to update SharePoint integration", "Action Failed");
    } finally {
      setIsConnectingSharePoint(false);
    }
  };

  const handleRemoveWatchFolder = async (watchId: string) => {
    setRemovingWatchId(watchId);
    try {
      await removeWatchFolder(brandId, watchId);
      await fetchWatchFolders();
      toastSuccess("The watch folder has been stopped and removed for this brand.", "Watch folder removed");
    } catch (err: any) {
      toastError(err.message || "Failed to remove watch folder", "Action Failed");
    } finally {
      setRemovingWatchId(null);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading integration status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Main Description */}
      <p className="text-sm text-muted-foreground">
        Connect your storage integrations to automatically import assets for compliance analysis.
      </p>

      {/* Integration Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Drive Integration Card */}
        <IntegrationCard
          title="Google Drive"
          subtitle="Storage"
          description="Automatically import assets from Google Drive folders for compliance analysis and pre-flight checks"
          icon="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
          isConnected={integrationStatus.google_drive_connected}
          onAction={handleGoogleDriveAction}
          isLoading={isConnectingDrive}
          actionLabel={integrationStatus.google_drive_connected ? "Disconnect" : "Connect"}
        />

        {/* SharePoint Integration Card */}
        <IntegrationCard
          title="SharePoint"
          subtitle="Storage"
          description="Connect to Microsoft SharePoint for asset monitoring and automatic import for compliance analysis"
          icon=""
          iconType="sharepoint"
          isConnected={integrationStatus.sharepoint_connected}
          onAction={handleSharePointAction}
          isLoading={isConnectingSharePoint}
          actionLabel={integrationStatus.sharepoint_connected ? "Disconnect" : "Connect"}
        />
      </div>

      {/* Watch folders for this brand */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Watch folders</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Folders being watched for automatic import. Remove a watch to stop syncing that folder for this brand.
        </p>
        {watchFoldersLoading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading watch folders...</span>
          </div>
        ) : watchFolders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 rounded-lg border border-dashed bg-muted/30 px-4">
            No watch folders set up for this brand. Configure watch folders from Upload Assets when Google Drive or SharePoint is connected.
          </p>
        ) : (
          <ul className="space-y-2">
            {watchFolders.map((w) => (
              <li
                key={w.id}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3",
                  removingWatchId === w.id && "opacity-60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {w.folder_name || w.folder_id || "Unnamed folder"}
                    </p>
                    <Badge variant="secondary" className="text-xs font-normal mt-1">
                      {w.provider === "google" ? "Google Drive" : "SharePoint"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveWatchFolder(w.id)}
                  disabled={removingWatchId !== null}
                >
                  {removingWatchId === w.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* How it works Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">How it works:</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              1
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Click the button above to connect or disconnect your storage account (Google Drive or SharePoint).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              2
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to the provider's login page to authorize access.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              3
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Once connected, you can import files directly from your storage when uploading assets.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              4
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Set up <strong>watch folders</strong> from Upload Assets to automatically import new files from a chosen folder. Manage or remove watch folders in the section above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
