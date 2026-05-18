import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Play, ChevronLeft, ChevronRight, AlertTriangle, Send, FileCheck, Loader2, FileImage, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { selectUserRole } from "@/context/slice/authSlice";
import { getAsset, getAssetPreviewUrl, getAssetAnalysisStatus } from "@/api/assets";
import { getAssetTitle } from "@/utils/assetUtils";

export default function AssetReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userRole = useSelector(selectUserRole);
  const [detectionOpen, setDetectionOpen] = useState(true);
  const [suitabilityOpen, setSuitabilityOpen] = useState(true);
  const [policyOpen, setPolicyOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isForcePassDialogOpen, setIsForcePassDialogOpen] = useState(false);
  const [forcePassComment, setForcePassComment] = useState("");
  const [assetData, setAssetData] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch asset data and preview URL on component mount
  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) {
        setError("Asset ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch asset data
        const response = await getAsset(id);
        setAssetData(response);

        // Hit asset_analysis_status API (response not shown in UI)
        getAssetAnalysisStatus(id);

        // Fetch presigned preview URL if asset has original_url
        if (response?.original_url) {
          try {
            const previewResponse = await getAssetPreviewUrl(id);
            setPreviewUrl(previewResponse.preview_url);
          } catch (previewErr: any) {
            // If preview URL fails, log but don't fail the whole page
            console.warn("Failed to get preview URL:", previewErr);
            // Fallback: try to construct URL from original_url
            // This is a fallback in case presigned URL endpoint is not available
            if (response.original_url.startsWith("http://") || response.original_url.startsWith("https://")) {
              setPreviewUrl(response.original_url);
            }
          }
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch asset. Please try again.";
        setError(errorMessage);
        toastError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  // Format UTC ISO string to user's local date & time (browser timezone)
  const formatToLocalDateTime = (dateString: string): string => {
    if (!dateString || typeof dateString !== "string") return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  // Extract asset information (all timestamps shown in user's local time)
  const assetName = assetData ? getAssetTitle(assetData) : "Loading...";
  const uploadedAtLocal = assetData?.created_at ? formatToLocalDateTime(assetData.created_at) : "";
  const preflight = assetData?.preflight_status;
  const preflightStartedLocal = preflight?.preflight_started_at ? formatToLocalDateTime(preflight.preflight_started_at) : "";
  const preflightCompletedLocal = preflight?.preflight_completed_at ? formatToLocalDateTime(preflight.preflight_completed_at) : "";
  const fileType = assetData?.file_type?.toLowerCase() || "";

  // Extract synthetic score from metadata
  const syntheticScore = assetData?.file_metadata?.synthetic_confidence ||
    assetData?.file_metadata?.synthetic ||
    assetData?.file_metadata?.detection?.synthetic_confidence ||
    null;

  // Extract C2PA status
  const c2paStatus = assetData?.file_metadata?.c2pa?.present ||
    assetData?.file_metadata?.c2pa_status === "present" ||
    assetData?.file_metadata?.c2pa?.valid ||
    null;

  // Mock violations - would come from API in real implementation
  const violations = [
    syntheticScore && syntheticScore > 50 ? `Missing AI disclosure (${Math.round(syntheticScore)}% synthetic confidence)` : null,
  ].filter(Boolean) as string[];

  // Mock: would come from API - for now, allow submission if no critical violations
  const preFlightPassed = violations.length === 0 || (syntheticScore !== null && syntheticScore < 50);

  const handleGenerateDisclosure = () => {
    navigate(`/disclosure/${id}`);
  };

  const handleMarkReviewed = () => {
    toastSuccess("Asset has been marked as reviewed and approved.", "Marked as Reviewed");
  };

  const handleSendToLegal = () => {
    toastInfo("Asset forwarded to legal team for review.", "Sent to Legal");
  };

  const handlePreFlightCheck = () => {
    navigate(`/preflight/${id}`);
  };

  const handleSubmitForApproval = () => {
    // Submit asset to compliance review queue
    // This would trigger:
    // 1. Update asset status in Postgres
    // 2. Move asset to compliance review queue
    // 3. Send email notification to approver
    // 4. Send Slack notification to approver
    // 5. Update dashboard for approver
    
    toastSuccess("Asset has been moved to compliance review queue. Approver will be notified via email and Slack.", "Submitted for Approval");
    setIsSubmitDialogOpen(false);
    // Navigate back to assets list after submission
    setTimeout(() => {
      navigate("/assets");
    }, 1500);
  };

  const handleForcePass = () => {
    if (!forcePassComment.trim()) {
      toastError("Please provide a comment for forcing pass.", "Comment Required");
      return;
    }
    toastSuccess("Asset has been force-passed with your comment for legal review.", "Force Pass Submitted");
    setIsForcePassDialogOpen(false);
    setForcePassComment("");
  };

  const isReviewer = userRole === "CONTENT_REVIEWER" || userRole === "BRAND_ADMIN";
  const isApprover = userRole === "LEGAL_APPROVER" || userRole === "BRAND_ADMIN";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/assets")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Asset Review</h1>
            <p className="text-sm text-muted-foreground">
              {assetName} • {uploadedAtLocal ? `Uploaded ${uploadedAtLocal}` : ""}
            </p>
            {(preflightStartedLocal || preflightCompletedLocal) && (
              <p className="text-xs text-muted-foreground mt-1">
                {preflightStartedLocal && `Preflight started ${preflightStartedLocal}`}
                {preflightStartedLocal && preflightCompletedLocal && " • "}
                {preflightCompletedLocal && `Preflight completed ${preflightCompletedLocal}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Preview */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <Card className="flex-1 flex flex-col card-shadow">
            {/* Preview Area with Violation Markers */}
            <div className="relative flex-1 bg-muted rounded-t-lg flex items-center justify-center min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading asset...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : previewUrl && fileType === "image" ? (
                <>
                  <img
                    src={previewUrl}
                    alt={assetName}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.parentElement?.querySelector(".fallback-preview");
                      if (fallback) {
                        (fallback as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                  <div className="fallback-preview absolute inset-0 flex items-center justify-center" style={{ display: "none" }}>
                    <div className="text-center">
                      <FileImage className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Unable to load image preview</p>
                    </div>
                  </div>
                </>
              ) : previewUrl && fileType === "video" ? (
                <>
                  <video
                    src={previewUrl}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    controls
                    onError={(e) => {
                      // Fallback if video fails to load
                      const target = e.target as HTMLVideoElement;
                      target.style.display = "none";
                      const fallback = target.parentElement?.querySelector(".fallback-preview");
                      if (fallback) {
                        (fallback as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                  <div className="fallback-preview absolute inset-0 flex items-center justify-center" style={{ display: "none" }}>
                    <div className="text-center">
                      <FileVideo className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Unable to load video preview</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="text-6xl">🎬</div>
                  <p className="text-sm text-muted-foreground">
                    {previewUrl ? "Preview not available" : "No preview URL available"}
                  </p>
                </div>
              )}
              
              {/* Violation Markers - Only show if violations exist */}
              {violations.length > 0 && (
                <>
                  <div className="absolute top-20 left-20 border-2 border-danger rounded w-32 h-24 animate-pulse"></div>
                  <div className="absolute bottom-32 right-24 border-2 border-warning rounded w-24 h-16"></div>
                </>
              )}
              
              {/* Frame indicator - Only show for videos */}
              {/* {fileType === "video" && (
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1 rounded-md text-sm font-medium">
                  Frame 245 / 1200
                </div>
              )} */}
            </div>

            {/* Video Controls - Only show for videos */}
            {fileType === "video" && (
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Play
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Violations Warning */}
          <Card className="mt-4 bg-warning-light border-warning card-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />

          <div className="flex-1">
            <h3 className="font-semibold text-warning-foreground mb-2  text-black">
              Violations Detected
            </h3>

            {/* Violations list - text forced to black */}
            <ul className="space-y-1 text-sm text-black">
              {violations.length > 0 ? (
                violations.map((violation, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{violation}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No violations detected</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>

          {/* Bottom Action Buttons - Role Based */}
          <div className="flex gap-3 mt-4">
            {isReviewer && (
              <>
                <Button variant="outline" size="lg" className="ml-auto">
                  Save Draft
                </Button>
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handlePreFlightCheck}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Re-run Pre-Flight
                </Button>
                <Button 
                  size="lg" 
                  className="bg-success hover:bg-success/90" 
                  onClick={() => setIsSubmitDialogOpen(true)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              </>
            )}
            {isApprover && !isReviewer && (
              <>
                <Button variant="outline" size="lg">
                  Request Changes
                </Button>
                <Button size="lg" className="bg-primary hover:bg-primary/90 ml-auto" onClick={() => navigate(`/preflight/${id}`)}>
                  Review Evidence Pack
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - Detection Panels */}
        <div className="w-[400px] border-l border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Detection Results */}
            <Collapsible open={detectionOpen} onOpenChange={setDetectionOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Detection Results
                      <span className="text-muted-foreground text-sm">
                        {detectionOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {/* Synthetic Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Synthetic Content</span>
                        <Badge variant={syntheticScore && syntheticScore > 50 ? "destructive" : "default"} className="ml-auto">
                          {syntheticScore !== null ? `${Math.round(syntheticScore)}%` : "—"}
                        </Badge>
                      </div>
                      {syntheticScore !== null && (
                        <Progress 
                          value={syntheticScore} 
                          className="h-2"
                        />
                      )}
                    </div>

                    <Separator />

                    {/* C2PA Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">C2PA Status</span>
                      <Badge className={c2paStatus ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                        {c2paStatus === null ? "—" : c2paStatus ? "Valid" : "Missing"}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Face/Voice Present */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Face/Voice Present</span>
                      <Badge className="bg-warning text-warning-foreground">
                        {assetData?.file_metadata?.face_detected || assetData?.file_metadata?.voice_detected ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Brand Suitability */}
            <Collapsible open={suitabilityOpen} onOpenChange={setSuitabilityOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Brand Suitability
                      <span className="text-muted-foreground text-sm">
                        {suitabilityOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {/* Alcohol */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🍺</span>
                          <span className="text-sm font-medium">Alcohol</span>
                        </div>
                        <Badge variant="destructive">62%</Badge>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>

                    <Separator />

                    {/* Minors */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="text-sm font-medium">Minors</span>
                        </div>
                        <Badge className="bg-success text-success-foreground">3%</Badge>
                      </div>
                      <Progress value={3} className="h-2" />
                    </div>

                    <Separator />

                    {/* Violence */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚔️</span>
                          <span className="text-sm font-medium">Violence</span>
                        </div>
                        <Badge className="bg-success text-success-foreground">0%</Badge>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Policy Compliance */}
            {/* <Collapsible open={policyOpen} onOpenChange={setPolicyOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Policy Compliance
                      <span className="text-muted-foreground text-sm">
                        {policyOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">EU Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-danger"></div>
                        <span className="text-sm text-muted-foreground">Red</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">US Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-warning"></div>
                        <span className="text-sm text-muted-foreground">Yellow</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">APAC Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success"></div>
                        <span className="text-sm text-muted-foreground">Green</span>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible> */}

            {/* Required Actions */}
            <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Required Actions
                      <span className="text-muted-foreground text-sm">
                        {actionsOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    {isReviewer && (
                      <>
                        <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li>1. Add AI disclosure to video</li>
                          <li>2. Review alcohol content</li>
                          <li>3. Attach model consent</li>
                        </ol>

                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setIsForcePassDialogOpen(true)}
                        >
                          Force Pass with Commentary
                        </Button>
                      </>
                    )}
                    {isReviewer && (
                      <>
                        <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li>1. Add AI disclosure to video</li>
                          <li>2. Review alcohol content</li>
                          <li>3. Attach model consent</li>
                        </ol>

                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleGenerateDisclosure}
                        >
                          Generate Disclosure
                        </Button>

                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleMarkReviewed}
                        >
                          Mark as Reviewed
                        </Button>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Submit for Approval Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Legal Approval</DialogTitle>
            <DialogDescription>
              This will move the asset to the compliance review queue and notify the approver via email and Slack.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">What happens next:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Asset moves to compliance review queue</li>
                <li>Email notification sent to approver</li>
                <li>Slack notification sent to approver</li>
                <li>Asset status updated to "Pending Approval"</li>
              </ul>
            </div>
            {violations.length > 0 && (
              <div className="p-3 bg-warning-light border border-warning rounded-lg">
                <p className="text-sm font-medium text-warning-foreground mb-1">
                  ⚠️ Violations Detected
                </p>
                <p className="text-xs text-warning-foreground">
                  This asset has {violations.length} violation(s). The approver will review these during the approval process.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForApproval} className="bg-success hover:bg-success/90">
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Pass Dialog */}
      <Dialog open={isForcePassDialogOpen} onOpenChange={setIsForcePassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Pass with Commentary</DialogTitle>
            <DialogDescription>
              Force pass this asset with a comment for legal review. This will bypass automatic checks.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment for Legal Review *</Label>
              <Textarea
                id="comment"
                placeholder="Explain why this asset should be force-passed despite violations..."
                value={forcePassComment}
                onChange={(e) => setForcePassComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This comment will be visible to the legal approver.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForcePassDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleForcePass}>
              Force Pass & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
