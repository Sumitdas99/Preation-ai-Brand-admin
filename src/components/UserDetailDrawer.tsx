import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Mail,
  Building2,
  Calendar,
  Shield,
  Power,
  PowerOff,
  LogOut,
  KeyRound,
  Users,
  MoreVertical,
} from "lucide-react";

interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onAction?: (action: 'activate' | 'deactivate', user: any) => void;
  onForceLogout?: (user: any) => void;
  onForcePasswordReset?: (user: any) => void;
  loading?: boolean;
  brandUsers?: any[];
}

export function UserDetailDrawer({
  open,
  onOpenChange,
  user,
  onAction,
  onForceLogout,
  onForcePasswordReset,
  loading = false,
  brandUsers = [],
}: UserDetailDrawerProps) {
  if (!user) return null;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Never";
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "Invalid Date";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getRoleBadge = (role: string) => {
    const raw = role || "N/A";
    const displayRole = raw.replace(/_/g, " ");
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
    if (raw.includes("Super") || displayRole.includes("Super")) colorClass = "bg-purple-50 text-purple-700 border-purple-200";
    else if (raw.includes("Brand") || raw.includes("BRAND")) colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    else if (raw.includes("Manager") || displayRole.includes("Manager")) colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
    else if (raw.includes("Approver") || displayRole.includes("Approver")) colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    else if (raw.includes("Reviewer") || displayRole.includes("Reviewer")) colorClass = "bg-green-50 text-green-700 border-green-200";
    return (
      <Badge variant="outline" className={colorClass}>
        {displayRole}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "approved") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    } else if (s === "rejected") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Rejected
        </Badge>
      );
    }

    // Pending Verification or Approval
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending Approval
      </Badge>
    );
  };

  const getAccessBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        Inactive
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="text-2xl">User Details</SheetTitle>
          <SheetDescription>
            View detailed information about this user
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 flex-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {/*{getStatusBadge(user.status)}*/}
            {getAccessBadge(user.isActive)}
            {getRoleBadge(user.role)}
          </div>

          <Separator />

          {/* User Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              User Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="mt-1 font-medium">{user.name}</p>
              </div> */}
              <div>
                <Label className="text-muted-foreground">Work Email</Label>
                <p className="mt-1 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Brand</Label>
                <p className="mt-1 font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {user.brand_name || user.workspace || "—"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="mt-1">{getRoleBadge(user.role)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="mt-1 flex gap-2">
                  {/* {getStatusBadge(user.status)} */}
                  {getAccessBadge(user.isActive)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Created Date</Label>
                <p className="mt-1 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Users in this brand - grid with column names and per-user actions */}
          {Array.isArray(brandUsers) && brandUsers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Users in this brand
                </h3>
                <div className="rounded-md border overflow-hidden max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Full Name</TableHead>
                        <TableHead className="text-xs">Work Email</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Access</TableHead>
                        <TableHead className="text-right text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandUsers.map((u) => (
                        <TableRow key={u.user_id} className="text-sm">
                          <TableCell className="font-medium truncate max-w-[120px]">{u.name}</TableCell>
                          <TableCell className="truncate max-w-[160px] text-muted-foreground">{u.email}</TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell>{getAccessBadge(u.is_active ?? u.isActive)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onAction && (u.is_active ?? u.isActive) && (
                                  <DropdownMenuItem onClick={() => onAction("deactivate", u)} disabled={loading}>
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                {onAction && !(u.is_active ?? u.isActive) && ["approved", "active"].includes((u.status || "").toLowerCase()) && (
                                  <DropdownMenuItem onClick={() => onAction("activate", u)} disabled={loading}>
                                    <Power className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                {onForceLogout && (
                                  <DropdownMenuItem onClick={() => onForceLogout(u)} disabled={loading}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Force logout
                                  </DropdownMenuItem>
                                )}
                                {onForcePasswordReset && (
                                  <DropdownMenuItem onClick={() => onForcePasswordReset(u)} disabled={loading}>
                                    <KeyRound className="h-4 w-4 mr-2" />
                                    Force password reset
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
