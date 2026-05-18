import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  Shield,
  User,
  Mail,
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "@/utils/toast";
import type { BrandAdminRequest } from "@/types/brand-admin-request";

interface BrandAdminRequestReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: BrandAdminRequest;
  onRequestUpdate: (request: BrandAdminRequest) => void;
}

export function BrandAdminRequestReviewDrawer({
  open,
  onOpenChange,
  request,
  onRequestUpdate,
}: BrandAdminRequestReviewDrawerProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updatedRequest: BrandAdminRequest = {
      ...request,
      status: "approved",
      approvedBy: "Super Admin", // In production, get from auth context
      approvedAt: new Date(),
    };
    
    onRequestUpdate(updatedRequest);
    setShowApproveDialog(false);
    setIsProcessing(false);
    
    toastSuccess(`Brand Admin access approved for ${request.brandName}. Approval confirmation email has been sent.`, "Brand Admin Approved");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toastError("Please provide a reason for rejection.", "Rejection Reason Required");
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updatedRequest: BrandAdminRequest = {
      ...request,
      status: "rejected",
      rejectedBy: "Super Admin", // In production, get from auth context
      rejectedAt: new Date(),
      rejectionReason: rejectionReason.trim(),
    };
    
    onRequestUpdate(updatedRequest);
    setShowRejectDialog(false);
    setRejectionReason("");
    setIsProcessing(false);
    
    toastError(`Brand Admin request for ${request.brandName} has been rejected.`, "Request Rejected");
  };

  const isPending = request.status === "pending";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">Brand Admin Request Review</SheetTitle>
            <SheetDescription>
              Review registration details and consent acknowledgements before approval
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {request.status === "pending" && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              )}
              {request.status === "approved" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
              {request.status === "rejected" && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}
            </div>

            <Separator />

            {/* A. Brand Admin Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Brand Admin Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="mt-1 font-medium">{request.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Work Email</Label>
                  <p className="mt-1 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {request.workEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Organization / Brand Name</Label>
                  <p className="mt-1 font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {request.organizationName}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Signup Date</Label>
                  <p className="mt-1 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(request.signupDate)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* B. Consent & Compliance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Consent & Compliance
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Terms & Conditions</p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">AI / Compliance Consent</p>
                    <p className="text-sm text-muted-foreground">Acknowledged</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Consent timestamp: {formatDate(request.consentTimestamp)}
              </div>
            </div>

            <Separator />

            {/* C. Security Notice */}
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-1">Security Notice</p>
                  <p className="text-sm text-amber-800">
                    This account will remain inactive until approved. Approval will grant Brand Admin
                    access to create workspaces and manage users.
                  </p>
                </div>
              </div>
            </div>

            {/* Approval History (if not pending) */}
            {request.status === "approved" && request.approvedBy && request.approvedAt && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Approval History
                  </h3>
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm">
                      <span className="font-medium">Approved by:</span> {request.approvedBy}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Approved at:</span> {formatDate(request.approvedAt)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {request.status === "rejected" && request.rejectedBy && request.rejectedAt && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Rejection History
                  </h3>
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm">
                      <span className="font-medium">Rejected by:</span> {request.rejectedBy}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Rejected at:</span> {formatDate(request.rejectedAt)}
                    </p>
                    {request.rejectionReason && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-1">Reason:</p>
                        <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Audit Notice */}
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" />
                All approval actions are recorded in the Audit Log
              </p>
            </div>

            {/* Action Buttons */}
            {isPending && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="destructive"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Brand Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve Brand Admin access for{" "}
              <span className="font-semibold">{request.brandName}</span>?
              <br />
              <br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Activate the Brand Admin account</li>
                <li>Send an approval confirmation email</li>
                <li>Grant access to create workspaces and manage users</li>
                <li>Record this action in the Audit Log</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-primary"
            >
              {isProcessing ? "Processing..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Brand Admin Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the Brand Admin request for{" "}
              <span className="font-semibold">{request.brandName}</span>?
              <br />
              <br />
              Please provide a reason for rejection (required):
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="sr-only">
              Rejection Reason
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
              disabled={isProcessing}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              onClick={() => setRejectionReason("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Processing..." : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


