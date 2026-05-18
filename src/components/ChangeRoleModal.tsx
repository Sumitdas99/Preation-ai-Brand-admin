import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError, toastWarning } from "@/utils/toast";
import type { PlatformUser } from "@/types/platform-user";

const availableRoles = [
  "CONTENT_REVIEWER",
  "LEGAL_APPROVER", 
  "BRAND_ADMIN",
  "ADMIN",
  "SUPER_ADMIN",
];

interface ChangeRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser;
}

export function ChangeRoleModal({
  open,
  onOpenChange,
  user,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleConfirm = async () => {
    if (selectedRole === user.role) {
      toastWarning("Please select a different role.", "No Change");
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onOpenChange(false);

    toastSuccess(`${user.name}'s role has been changed to ${selectedRole}.`, "Role Changed");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Role</AlertDialogTitle>
          <AlertDialogDescription>
            Change the role for <span className="font-semibold">{user.name}</span> ({user.email}).
            <br />
            <br />
            Current role: <span className="font-medium">{user.role}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="role-select" className="mb-2 block">
            New Role
          </Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger id="role-select">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSelectedRole(user.role)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-primary">
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

