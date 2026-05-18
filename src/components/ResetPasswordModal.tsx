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
import { toastInfo } from "@/utils/toast";
import type { PlatformUser } from "@/types/platform-user";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser;
}

export function ResetPasswordModal({
  open,
  onOpenChange,
  user,
}: ResetPasswordModalProps) {

  const handleConfirm = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onOpenChange(false);

    toastInfo(`A password reset email has been sent to ${user.email}. The user will receive instructions to set a new password.`, "Password Reset Initiated");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Password?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset the password for{" "}
            <span className="font-semibold">{user.name}</span> ({user.email})?
            <br />
            <br />
            A password reset email will be sent to the user's email address. They will be able to
            set a new password using the link in the email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-primary">
            Send Reset Email
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

