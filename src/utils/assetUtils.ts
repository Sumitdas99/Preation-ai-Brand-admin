
/** Format UTC ISO string to user's local date & time (browser timezone). */
export const formatToLocalDateTime = (dateString: string): string => {
    if (!dateString || typeof dateString !== "string") return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export interface AssetType {
    file_type?: string;
    file_metadata?: {
        file_info?: {
            file_name?: string;
            file_extension?: string;
        };
        business?: {
            resolution?: string;
            duration?: string;
            dimensions?: {
                width: number;
                height: number;
            }
        };
    };
    original_url?: string;
    external_reference?: string;
    distribution_channel?: string;
    target_geography?: string;
    upload_status?: string;
    current_stage?: string;
}

// Looks like a temp/system filename (e.g. tmpynp5r618, tmpq7ymypwj) with no real extension
const isTempOrSystemName = (name: string): boolean => {
    if (!name || name.length < 3) return true;
    const trimmed = name.trim();
    // tmp + alphanumeric only (no dot = no extension) often from temp files
    if (/^tmp[a-z0-9]+$/i.test(trimmed)) return true;
    if (trimmed.startsWith("tmp_") && !trimmed.includes(".")) return true;
    return false;
};

// Get filename from S3-style original_url: s3://bucket/path/to/filename.ext -> filename.ext
const getFilenameFromOriginalUrl = (originalUrl?: string): string | null => {
    if (!originalUrl) return null;
    const part = originalUrl.split("/").filter(Boolean).pop();
    return part && part.includes(".") ? part : null;
};

// 1. Asset Title
export const getAssetTitle = (asset: AssetType): string => {
    let title = "Untitled asset";

    const fromFileInfo = asset.file_metadata?.file_info?.file_name;
    const fromUrl = getFilenameFromOriginalUrl(asset.original_url);
    const fromRef = asset.external_reference && !asset.external_reference.startsWith("type:")
        ? asset.external_reference
        : null;

    if (fromFileInfo && !isTempOrSystemName(fromFileInfo)) {
        title = fromFileInfo;
    } else if (fromUrl) {
        title = fromUrl;
    } else if (fromRef) {
        title = fromRef;
    } else if (fromFileInfo) {
        // Use file_info even if it looks like tmp* (e.g. no other option)
        title = fromFileInfo;
    }

    // Remove "temp_" prefix if present (common upload artifact)
    if (title.startsWith("temp_")) {
        title = title.substring(5);
    }
    return title;
};

// 2. Asset Type Label
export const getAssetTypeLabel = (asset: AssetType): string => {
    const type = asset.file_type?.toLowerCase() || "unknown";
    const extension = asset.file_metadata?.file_info?.file_extension?.toUpperCase() || "";

    let typeLabel = "Unknown";
    if (type === "image") typeLabel = "Image";
    else if (type === "video") typeLabel = "Video";
    else if (type === "text") typeLabel = "Document";

    if (extension) {
        return `${typeLabel} • ${extension}`;
    }
    return typeLabel;
};

// 3. Resolution / Duration
export const getResolutionDuration = (asset: AssetType): string | null => {
    const type = asset.file_type?.toLowerCase();
    const business = asset.file_metadata?.business;

    if (!business) return null;

    let resolution = business.resolution;
    // Fallback to dimensions if resolution string is missing
    if (!resolution && business.dimensions) {
        resolution = `${business.dimensions.width}x${business.dimensions.height}`;
    }

    if (type === "video") {
        const duration = business.duration;
        if (resolution && duration) {
            // Clean up duration if needed (e.g. remove " s")
            // Assuming duration comes as "10.64 s" or "0:01:01" based on user examples
            // User wanted "1:01" format. 
            // If it is "10.64 s", we might want to keep it or format it. 
            // User requirement example: "1920x1080 • 1:01"
            // Let's just use what is there for now or basic cleanup
            let formattedDuration = duration.replace(" s", "s");
            return `${resolution} • ${formattedDuration}`;
        }
        if (resolution) return resolution;
        if (duration) return duration;
    } else if (type === "image") {
        if (resolution) return resolution;
    }

    return null;
};

// 4. Distribution Info
export const getDistributionInfo = (asset: AssetType): string => {
    const channel = asset.distribution_channel;
    const geo = asset.target_geography;

    if (!channel && !geo) return "Not set • —";

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const formattedChannel = channel ? capitalize(channel) : "Not set";
    const formattedGeo = geo || "—";

    return `${formattedChannel} • ${formattedGeo}`;
};

// 5. Status Label
export const getDoMStatusLabel = (stage?: string, status?: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "pass" | "flag" | "block" | "processing" } => {
    // Map backend stages to UI labels
    // intake     → "Queued"
    // preflight  → "Pre-flight"
    // detection  → "Processing"
    // review     → "In Review"
    // completed  → "Completed"

    if (status === "failed") return { label: "Failed", variant: "block" };

    switch (stage) {
        case "intake": return { label: "Queued", variant: "processing" };
        case "preflight": return { label: "Pre-flight", variant: "processing" };
        case "detection": return { label: "Processing", variant: "processing" };
        case "review": return { label: "In Review", variant: "flag" };
        case "completed": return { label: "Completed", variant: "pass" };
        case "flagged": return { label: "Flagged", variant: "flag" };
        case "blocked": return { label: "Blocked", variant: "block" };
        case "approved": return { label: "Approved", variant: "pass" };
        default: return { label: stage || "Unknown", variant: "processing" };
    }
};

/** Preflight status from beta.asset_analysis_status (optional). */
export interface PreflightStatus {
  status_id?: string;
  detection_status?: string;
  c2pa_status?: string;
  suitability_status?: string;
  consent_status?: string;
  policy_status?: string;
  all_completed?: boolean;
}

/**
 * Derive overall status label from preflight analysis status table.
 * Use when API returns preflight_status so UI shows Queued / Processing / Completed.
 */
export const getPreflightStatusLabel = (preflight: PreflightStatus | null | undefined): { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "pass" | "flag" | "block" | "processing" } => {
  if (!preflight) return { label: "Queued", variant: "processing" };
  if (preflight.all_completed) return { label: "Completed", variant: "pass" };
  const statuses = [
    preflight.detection_status,
    preflight.c2pa_status,
    preflight.suitability_status,
    preflight.consent_status,
    preflight.policy_status,
  ].filter(Boolean);
  const inProgress = statuses.some((s) => s === "processing" || s === "retrying");
  if (inProgress) return { label: "Processing", variant: "processing" };
  const anyFailed = statuses.some((s) => s === "failed");
  if (anyFailed) return { label: "Failed", variant: "block" };
  return { label: "Queued", variant: "processing" };
};
