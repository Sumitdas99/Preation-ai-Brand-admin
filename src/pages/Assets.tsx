import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Loader2, AlertCircle, Sparkles, ShieldCheck, FileCheck, FileVideo, FileImage, FileText, Users, Scale } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastError } from "@/utils/toast";
import { useAssetStatusWebSocket } from "@/hooks/useAssetStatusWebSocket";
import { useSelector } from "react-redux";
import { getAssets } from "@/api/assets";
import { selectAuthUser } from "@/context/slice/authSlice";
import {
  getAssetTitle,
  getAssetTypeLabel,
  getResolutionDuration,
  getDistributionInfo,
  getDoMStatusLabel,
  getPreflightStatusLabel,
  formatToLocalDateTime,
  AssetType as APIAssetType
} from "@/utils/assetUtils";

interface Asset {
  id: string;
  title: string;
  typeLabel: string;
  resolutionDuration: string | null;
  distributionInfo: string;
  statusLabel: string;
  statusVariant: "default" | "secondary" | "destructive" | "outline" | "pass" | "flag" | "block" | "processing";
  synthetic: number | string | null;
  suitability: string | null;
  c2pa: boolean | string | null;
  consent: string | null;
  policy: string | null;
  uploaded: string;
  thumbnail: JSX.Element;
}

// Helper function to get thumbnail icon based on file type
const getThumbnail = (fileType: string): JSX.Element => {
  if (fileType === "video") return <FileVideo className="h-7 w-7" />;
  if (fileType === "image") return <FileImage className="h-7 w-7" />;
  if (fileType === "text") return <FileText className="h-7 w-7" />;
  return <FileImage className="h-7 w-7" />;
};

// Removed mapStatus and getAssetName as they are replaced by utils

// Transform API asset to UI format (uses preflight_status from beta.asset_analysis_status when present)
const transformAsset = (apiAsset: any): Asset => {
  const preflight = apiAsset.preflight_status;

  // 1. Synthetic (Detection)
  const isDetectionDone = preflight?.detection_status === "completed";
  const syntheticScoreRaw = apiAsset.file_metadata?.synthetic_confidence ??
    apiAsset.file_metadata?.synthetic ??
    apiAsset.file_metadata?.detection?.synthetic_confidence;

  let synthetic: number | string | null = null;
  if (isDetectionDone) {
    if (syntheticScoreRaw != null) {
      synthetic = Math.round(syntheticScoreRaw);
    } else {
      synthetic = "Completed";
    }
  }

  // 2. C2PA
  const isC2paDone = preflight?.c2pa_status === "completed";
  const hasC2paResult = apiAsset.file_metadata?.c2pa != null || apiAsset.file_metadata?.c2pa_status != null;

  let c2paStatus: boolean | string | null = null;
  if (isC2paDone) {
    if (hasC2paResult) {
      c2paStatus = !!(apiAsset.file_metadata?.c2pa?.present || apiAsset.file_metadata?.c2pa_status === "present");
    } else {
      c2paStatus = "Completed";
    }
  }

  // 3. Suitability
  const isSuitabilityDone = preflight?.suitability_status === "completed";
  const suitabilityValue = apiAsset.file_metadata?.suitability?.status || apiAsset.file_metadata?.suitability;

  let suitability: string | null = null;
  if (isSuitabilityDone) {
    suitability = suitabilityValue || "Completed";
  }

  // 4. Consent
  const isConsentDone = preflight?.consent_status === "completed";
  const consentValue = apiAsset.file_metadata?.consent;
  const consent = (isConsentDone && (consentValue || "Completed")) ? (consentValue || "Completed") : null;

  // 5. Policy
  const isPolicyDone = preflight?.policy_status === "completed";
  const policyValue = apiAsset.file_metadata?.policy;
  const policy = (isPolicyDone && (policyValue || "Completed")) ? (policyValue || "Completed") : null;

  const statusInfo = preflight
    ? getPreflightStatusLabel(preflight)
    : getDoMStatusLabel(apiAsset.current_stage, apiAsset.upload_status);
  const typeLabel = getAssetTypeLabel(apiAsset);
  const resolutionDuration = getResolutionDuration(apiAsset);

  return {
    id: apiAsset.asset_id,
    title: getAssetTitle(apiAsset),
    typeLabel: typeLabel,
    resolutionDuration: resolutionDuration,
    distributionInfo: getDistributionInfo(apiAsset),
    statusLabel: statusInfo.label,
    statusVariant: statusInfo.variant,
    synthetic: synthetic,
    suitability: suitability,
    c2pa: c2paStatus,
    consent: consent,
    policy: policy,
    uploaded: formatToLocalDateTime(apiAsset.created_at),
    thumbnail: getThumbnail(apiAsset.file_type || "unknown"),
  };
};

const SEARCH_DEBOUNCE_MS = 400;

export default function Assets() {
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);

  // searchQuery: instant value bound to the input (drives client-side highlight)
  const [searchQuery, setSearchQuery] = useState("");
  // debouncedSearch: debounced value sent to the server
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: update debouncedSearch after user stops typing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
  };

  const fetchAssets = useCallback(async (
    pageNum: number,
    search: string,
    status: string,
    options?: { silent?: boolean }
  ) => {
    const silent = options?.silent === true;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    const skip = (pageNum - 1) * pageSize;
    try {
      const params: Record<string, unknown> = {
        skip,
        limit: pageSize,
      };
      if (user?.brand_id) {
        params.brand_id = user.brand_id;
      }
      // Send search to server when present
      if (search.trim()) {
        params.search = search.trim();
      }
      // Send status filter to server when present (UI variant)
      if (status && status !== "all") {
        params.status = status;
      }
      const response = await getAssets(params);
      const items = response?.items ?? response;
      const list = Array.isArray(items) ? items : [];
      const total = typeof response?.total === "number" ? response.total : list.length;
      setAssets(list.map(transformAsset));
      setTotalCount(total);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch assets. Please try again.";
      setError(errorMessage);
      if (!silent) {
        toastError(errorMessage);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [user?.brand_id]);

  // Fetch whenever page or debouncedSearch changes
  useEffect(() => {
    fetchAssets(page, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter, fetchAssets]);

  useAssetStatusWebSocket(() => {
    fetchAssets(page, debouncedSearch, statusFilter, { silent: true });
  });

  const hasProcessingAsset = assets.some((a) => a.statusVariant === "processing");
  useEffect(() => {
    if (!hasProcessingAsset) return;
    const pollIntervalMs = 5000;
    const id = setInterval(() => {
      fetchAssets(page, debouncedSearch, statusFilter, { silent: true });
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [hasProcessingAsset, page, debouncedSearch, statusFilter, fetchAssets]);

  // Reset page to 1 when status filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Client-side filter: instant feedback on current page while debounce is pending
  // Also applies status filter (status comes from preflight service, not the DB)
  const filteredAssets = assets.filter((asset) => {
    if (searchQuery.trim() && !asset.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && asset.statusVariant !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Recent Assets</h1>
          <p className=" text-[14px] text-muted-foreground">
            View and manage all uploaded assets
          </p>
        </div>
        {/* <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button> */}
      </div>
 
      {/* Search and Filters */}
      <Card className="card-shadow w-full min-w-0 overflow-hidden">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="flag">Flagged</SelectItem>
                <SelectItem value="block">Blocked</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Assets Grid */}
          {!isLoading && !error && (
            <>
              {filteredAssets.length === 0 ? (
                <div>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      {assets.length === 0 && !debouncedSearch && statusFilter === "all"
                        ? "No assets found. Upload your first asset to get started."
                        : debouncedSearch
                          ? `No assets found matching "${debouncedSearch}".`
                          : "No assets match your filters."}
                    </p>
                  </CardContent>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
                  {filteredAssets.map((asset) => (
                    <Card
                      key={asset.id}
                      className="group relative rounded-2xl border border-border bg-card p-5 w-full min-w-0 overflow-hidden
    transition-all duration-300 cursor-pointer
    hover:-translate-y-1
    hover:border-[#0B3C8A]/60
    hover:shadow-[0_12px_34px_-12px_rgba(11,60,138,0.45)]"
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-3xl shrink-0">
                          {asset.thumbnail}
                        </div>
 
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 text-xs font-medium rounded-full truncate shrink-0 max-w-[150px]
            ${asset.statusVariant === "pass"
                              ? "border-green-300 bg-green-50 text-green-700"
                              : asset.statusVariant === "flag"
                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                : asset.statusVariant === "block"
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-blue-300 bg-blue-50 text-blue-700"
                            }`}
                        >
                          {asset.statusVariant === "pass" ? "✓ " : ""}
                          {asset.statusVariant === "flag" ? "⟳ " : ""}
                          {asset.statusVariant === "block" ? "✕ " : ""}
                          {asset.statusLabel}
                        </Badge>
                      </div>
 
                      {/* Title & Metadata */}
                      <div className="mt-4 pb-3 border-b min-w-0">
                        <p className="font-semibold truncate w-full" title={asset.title}>{asset.title}</p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5 min-w-0">
                          <p className="truncate w-full">
                            {asset.typeLabel}
                            {asset.resolutionDuration && ` • ${asset.resolutionDuration}`}
                          </p>
                          <p className="truncate w-full">{asset.distributionInfo}</p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="mt-4 space-y-3">
                        {/* Synthetic */}
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Synthetic
                            </span>
                            <span className="font-medium">
                              {asset.synthetic !== null
                                ? (typeof asset.synthetic === 'number' ? `${asset.synthetic}%` : asset.synthetic)
                                : "—"}
                            </span>
                          </div>

                          {asset.synthetic !== null && typeof asset.synthetic === 'number' && (
                            <Progress value={asset.synthetic} className="h-1.5 rounded-full" />
                          )}
                        </div>

                        {/* C2PA */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> C2PA
                          </span>
                          <span
                            className={`font-medium ${asset.c2pa === false ? "text-red-600" : "text-green-600"
                              }`}
                          >
                            {asset.c2pa === null
                              ? "—"
                              : (typeof asset.c2pa === 'boolean'
                                ? (asset.c2pa ? "Present" : "Missing")
                                : asset.c2pa)
                            }
                          </span>
                        </div>

                        {/* Suitability */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <FileCheck className="w-4 h-4" /> Suitability
                          </span>
                          <span className="font-medium">{asset.suitability || "—"}</span>
                        </div>

                        {/* Consent */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> Consent
                          </span>
                          <span className="font-medium capitalize">{asset.consent || "—"}</span>
                        </div>

                        {/* Policy */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Policy
                          </span>
                          <span className="font-medium capitalize">{asset.policy || "—"}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <Button
                        variant="outline"
                        size="lg"
                        className="mt-5 w-full rounded-lg"
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        View Details →
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {!isLoading && !error && (
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="card-shadow">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading assets...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="card-shadow border-destructive">
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="ml-3">
              <p className="font-medium text-destructive">Failed to load assets</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
