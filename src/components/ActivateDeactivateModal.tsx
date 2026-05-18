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
import { toastError } from "@/utils/toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { adminApi } from "@/api/admin";

interface ActivateDeactivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // Using any to be flexible with backend response model
  action: "activate" | "deactivate";
  onConfirm?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function ActivateDeactivateModal({
  open,
  onOpenChange,
  user,
  action,
  onConfirm,
  onLoadingChange,
}: ActivateDeactivateModalProps) {
  const [loading, setLoading] = useState(false);
  const isActivate = action === "activate";

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent auto-close
    setLoading(true);
    onLoadingChange?.(true);
    try {
      await adminApi.updateUserStatus(user.user_id, isActivate);

      onOpenChange(false);
      if (onConfirm) onConfirm();

    } catch (error) {
      console.error("Action failed", error);
      toastError("Failed to update user status. Please try again.");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActivate ? "Activate User?" : "Deactivate User?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {isActivate ? "activate" : "deactivate"} the account for{" "}
            <span className="font-semibold">{user.name}</span> ({user.email})?
            <br />
            <br />
            {isActivate
              ? "This will restore access to the platform for this user."
              : "This will revoke access to the platform for this user. They will not be able to log in until reactivated."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={isActivate ? "bg-primary" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActivate ? "Activate" : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
