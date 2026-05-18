import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRightLeft, CheckCircle } from "lucide-react";
import { adminApi } from "@/api/admin";
import { toastSuccess, toastError } from "@/utils/toast";
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

export interface TransferBrandAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brandsList: any[];
    /** When set (e.g. from row 3-dot menu), brand is fixed and Brand dropdown is hidden. */
    initialBrandId?: string | null;
    initialBrandName?: string | null;
    onSuccess: () => void;
    onLoadingChange?: (loading: boolean) => void;
}

interface TransferFormErrors {
    brand?: string;
    currentAdmin?: string;
    email?: string;
}

/** Generate a random temporary password that satisfies Cognito (upper, lower, number, symbol). */
function generateTempPassword(length = 12) {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*";
    const all = upper + lower + digits + symbols;
    const pick = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
    let s = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
    for (let i = s.length; i < length; i++) s += pick(all);
    return s.split("").sort(() => Math.random() - 0.5).join("");
}

export function TransferBrandAdminDialog({
    open,
    onOpenChange,
    brandsList,
    initialBrandId,
    initialBrandName,
    onSuccess,
    onLoadingChange,
}: TransferBrandAdminDialogProps) {

    const [transferBrandId, setTransferBrandId] = useState("");
    const [currentBrandAdmin, setCurrentBrandAdmin] = useState<any>(null);
    const [transferToEmail, setTransferToEmail] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferSubmitLoading, setTransferSubmitLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const useInitialBrand = Boolean(initialBrandId);

    // Notify parent when submit loading state changes (for global loader)
    useEffect(() => {
        onLoadingChange?.(transferSubmitLoading);
    }, [transferSubmitLoading, onLoadingChange]);

    // When dialog opens with initialBrandId, set brand; when dialog closes, reset form
    useEffect(() => {
        if (!open) {
            setTransferBrandId("");
            setCurrentBrandAdmin(null);
            setTransferToEmail("");
            setShowValidation(false);
            setConfirmOpen(false);
            setTransferSuccess(false);
        } else if (initialBrandId) {
            setTransferBrandId(initialBrandId);
        }
    }, [open, initialBrandId]);

    // Fetch current brand admin when brand is selected
    useEffect(() => {
        if (!transferBrandId) {
            setCurrentBrandAdmin(null);
            return;
        }
        setTransferLoading(true);
        setCurrentBrandAdmin(null);
        adminApi
            .getBrandAdmin(transferBrandId)
            .then(setCurrentBrandAdmin)
            .catch(() => setCurrentBrandAdmin(null))
            .finally(() => setTransferLoading(false));
    }, [transferBrandId]);

    const validationErrors = useMemo<TransferFormErrors>(() => {
        const errors: TransferFormErrors = {};
        const email = transferToEmail.trim();
        const currentAdminEmail = (currentBrandAdmin?.email || "").trim().toLowerCase();

        if (!transferBrandId) {
            errors.brand = "Please select a brand.";
        }

        if (transferBrandId && !transferLoading && !currentBrandAdmin?.user_id) {
            errors.currentAdmin = "Selected brand has no current Brand Admin to transfer from.";
        }

        if (!email) {
            errors.email = "New Brand Admin email is required.";
        } else if (!emailRegex.test(email)) {
            errors.email = "Please enter a valid email address.";
        } else if (currentAdminEmail && email.toLowerCase() === currentAdminEmail) {
            errors.email = "New Brand Admin email must be different from current admin email.";
        }

        return errors;
    }, [transferBrandId, transferLoading, currentBrandAdmin, transferToEmail]);

    const hasValidationErrors = Object.keys(validationErrors).length > 0;

    const handleCloseAfterSuccess = () => {
        setTransferSuccess(false);
        onOpenChange(false);
    };

    const handleOpenConfirm = () => {
        setShowValidation(true);
        if (hasValidationErrors) return;
        setConfirmOpen(true);
    };

    const handleTransferBrandAdmin = async () => {
        const email = transferToEmail?.trim();
        if (!transferBrandId || !currentBrandAdmin?.user_id || !email) return;

        setTransferSubmitLoading(true);
        try {
            const newTemporaryPassword = generateTempPassword(12);
            await adminApi.transferBrandAdmin({
                brandId: transferBrandId,
                fromUserId: currentBrandAdmin.user_id,
                toUserEmail: email,
                newTemporaryPassword,
                toUserFirstName: undefined,
                toUserLastName: undefined,
            });

            setConfirmOpen(false);
            setTransferSuccess(true);
            onSuccess();

            toastSuccess("The new Brand Admin will receive an email with their login details (email and temporary password).", "Transfer complete");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const message = typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                    ? detail.map((d) => d.msg || d).join(", ")
                    : "Failed to transfer Brand Admin.";

            if (typeof message === "string") {
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes("existing user email")) {
                    setShowValidation(true);
                    setConfirmOpen(false);
                }
            }

            toastError(message);
        } finally {
            setTransferSubmitLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {transferSuccess ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Transfer complete
                                </>
                            ) : (
                                <>
                                    <ArrowRightLeft className="h-5 w-5" />
                                    Transfer Brand Admin
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {transferSuccess
                                ? "The new Brand Admin will receive an email with their login details (email and temporary password). They must change the password on first login."
                                : useInitialBrand
                                    ? "Assign a new Brand Admin for this brand. A temporary password will be set by the system; they must change it on first login."
                                    : "Change the brand's Brand Admin to a new email. A temporary password will be set by the system."}
                        </DialogDescription>
                    </DialogHeader>

                    {transferSuccess ? (
                        <div className="grid gap-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                An email has been sent to the new Brand Admin with their login details. The temporary password is not shown here for security.
                            </p>
                            <DialogFooter>
                                <Button onClick={handleCloseAfterSuccess}>Close</Button>
                            </DialogFooter>
                        </div>
                    ) : (
                    <>
                    <div className="grid gap-4 py-4">
                        {useInitialBrand ? (
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                                    {initialBrandName || "—"}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="transfer-brand">Brand</Label>
                                <Select value={transferBrandId} onValueChange={setTransferBrandId}>
                                    <SelectTrigger id="transfer-brand">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandsList.map((b) => (
                                            <SelectItem key={b.brand_id} value={b.brand_id}>
                                                {b.brand_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {showValidation && validationErrors.brand && (
                                    <p className="text-xs text-destructive">{validationErrors.brand}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Current Brand Admin</Label>
                            {transferLoading ? (
                                <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground border rounded-md px-3">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading...
                                </div>
                            ) : currentBrandAdmin ? (
                                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                                    {currentBrandAdmin.firstName} {currentBrandAdmin.lastName} ({currentBrandAdmin.email})
                                </div>
                            ) : transferBrandId ? (
                                <div className="rounded-md border px-3 py-2 text-sm text-yellow-600 bg-yellow-50">
                                    No Brand Admin assigned to this brand
                                </div>
                            ) : (
                                <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                                    {useInitialBrand ? "Loading..." : "Select a brand first"}
                                </div>
                            )}
                            {showValidation && validationErrors.currentAdmin && (
                                <p className="text-xs text-destructive">{validationErrors.currentAdmin}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transfer-email">New Brand Admin Email</Label>
                            <Input
                                id="transfer-email"
                                type="email"
                                placeholder="New email only (not an existing user)"
                                value={transferToEmail}
                                onChange={(e) => setTransferToEmail(e.target.value)}
                                disabled={!currentBrandAdmin}
                                className={showValidation && validationErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {showValidation && validationErrors.email && (
                                <p className="text-xs text-destructive">{validationErrors.email}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleOpenConfirm}
                            disabled={transferSubmitLoading || transferLoading}
                        >
                            Transfer Admin
                        </Button>
                    </DialogFooter>
                    </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Brand Admin Transfer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to transfer Brand Admin rights for this brand to <strong>{transferToEmail}</strong>?
                            <br /><br />
                            The current admin ({currentBrandAdmin?.email}) will lose admin access to this brand.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={transferSubmitLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleTransferBrandAdmin();
                            }}
                            disabled={transferSubmitLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {transferSubmitLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Transferring...
                              </>
                            ) : (
                              "Confirm Transfer"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
