import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, MoreVertical, AlertCircle, Users, Loader2, LogOut, KeyRound, ArrowRightLeft, UserPlus, Copy, CheckCircle } from "lucide-react";
import { UserDetailDrawer } from "@/components/UserDetailDrawer";
import { ActivateDeactivateModal } from "@/components/ActivateDeactivateModal";
import { TransferBrandAdminDialog } from "@/components/TransferBrandAdminDialog";
import { CreateBrandAdminDialog } from "@/components/CreateBrandAdminDialog";
import { AddUserToBrandDialog } from "@/components/AddUserToBrandDialog";
import { adminApi } from "@/api/admin";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";

/** Generate a random temporary password (Cognito: upper, lower, number, symbol). */
function generateTempPassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;
  const pick = (str) => str.charAt(Math.floor(Math.random() * str.length));
  let s = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
  for (let i = s.length; i < length; i++) s += pick(all);
  return s.split("").sort(() => Math.random() - 0.5).join("");
}

export default function UserManagement() {

  // State for data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUserCount, setTotalUserCount] = useState(0);

  const [roleFilter] = useState("BRAND_ADMIN"); // Page shows Brand Admins only

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal/Drawer State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [brandUsersForDrawer, setBrandUsersForDrawer] = useState([]);
  const [actionModal, setActionModal] = useState({
    type: null,
    user: null,
  });

  // Force logout / Force password reset (per user, from row actions)
  const [forceLogoutUser, setForceLogoutUser] = useState(null);
  const [forcePasswordUser, setForcePasswordUser] = useState(null);
  const [forcePasswordSuccessValue, setForcePasswordSuccessValue] = useState(null); // shown after success with Copy
  const [securityActionLoading, setSecurityActionLoading] = useState(false);

  // Transfer Brand Admin (Super Admin) – brand from row when opened from 3-dot menu
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferDialogBrand, setTransferDialogBrand] = useState(null); // { brandId, brandName } when opened from row
  const [addUserToBrandForBrand, setAddUserToBrandForBrand] = useState(null); // { brandId, brandName } when opened from row action
  const [brandsList, setBrandsList] = useState([]);

  // Force logout all users in this brand (from row 3-dot menu)
  const [forceLogoutBrandUser, setForceLogoutBrandUser] = useState(null);
  const [forceLogoutBrandLoading, setForceLogoutBrandLoading] = useState(false);

  // Global loader for 3-dot actions (activate/deactivate, transfer)
  const [activateDeactivateLoading, setActivateDeactivateLoading] = useState(false);
  const [transferDialogLoading, setTransferDialogLoading] = useState(false);

  const globalActionLoading =
    securityActionLoading ||
    forceLogoutBrandLoading ||
    activateDeactivateLoading ||
    transferDialogLoading;

  // Clear transfer dialog loading when dialog closes
  useEffect(() => {
    if (!isTransferDialogOpen) setTransferDialogLoading(false);
  }, [isTransferDialogOpen]);

  // Fetch Users
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, currentPage, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        role: roleFilter,
        page: currentPage,
        limit: pageSize
      });
      setUsers(data.users);
      setTotalUserCount(data.total);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (err) {
      toastError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    handleCloseModal();
    // Also update selected user in drawer if drawer is open
    if (selectedUser) {
      // Optimistic update or refetch
      // We'll just refetch the list for now, and close drawer to be safe 
      // OR we can keep drawer open and update selectedUser.
      // Let's refetch users first.
      fetchUsers().then(() => {
        // If we really wanted to update the drawer live, we'd need to fetch single user or guess state.
        // Simpler to close drawer or let user reopen.
        setIsDrawerOpen(false);
      });
    } else {
      fetchUsers();
    }

    toastSuccess("User updated successfully");
  };

  // Fetch users in the same brand when drawer opens (for "Users in this brand" list)
  useEffect(() => {
    if (!isDrawerOpen || !selectedUser) {
      setBrandUsersForDrawer([]);
      return;
    }
    const brandName = selectedUser.brand_name || selectedUser.workspace;
    if (!brandName || brandName === "N/A") {
      setBrandUsersForDrawer([]);
      return;
    }
    adminApi.getUsers({ brand: brandName, page: 1, limit: 100 })
      .then((data) => setBrandUsersForDrawer(data.users || []))
      .catch(() => setBrandUsersForDrawer([]));
  }, [isDrawerOpen, selectedUser?.brand_name, selectedUser?.workspace]);

  const handleViewUser = (user) => {
    const adaptedUser = {
      ...user,
      name: user.name,
      email: user.email,
      workspace: user.workspace,
      brand_name: user.brand_name || user.workspace,
      brand_id: user.brand_id,
      role: user.role,
      status: user.status,
      isActive: user.is_active,
      createdAt: new Date(user.created_at),
      lastLogin: user.last_login ? new Date(user.last_login) : new Date()
    };
    setSelectedUser(adaptedUser);
    setIsDrawerOpen(true);
  };

  const handleAction = (type, user) => {
    setActionModal({ type, user });
  };

  const handleCloseModal = () => {
    setActionModal({ type: null, user: null });
  };

  const getRoleBadge = (role) => {
    const normalizedRole = role || "N/A";
    const displayRole = normalizedRole.replace(/_/g, " ");

    let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
    if (displayRole.includes("Super")) colorClass = "bg-purple-50 text-purple-700 border-purple-200";
    else if (displayRole.includes("Brand Admin")) colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    else if (displayRole.includes("Manager")) colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
    else if (displayRole.includes("Approver")) colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    else if (displayRole.includes("Reviewer")) colorClass = "bg-green-50 text-green-700 border-green-200";

    return (
      <Badge variant="outline" className={colorClass}>
        {displayRole}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();

    if (s === "approved" || s === "active") {
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

  const getAccessBadge = (isActive) => {
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

  const getSignupMethodBadge = (authProvider) => {
    const isSSO = authProvider && authProvider !== "email";
    if (isSSO) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          SSO
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
        Normal
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleForceLogoutUser = async () => {
    if (!forceLogoutUser) return;
    setSecurityActionLoading(true);
    try {
      await adminApi.forceLogoutUser(forceLogoutUser.user_id);
      setForceLogoutUser(null);
      toastSuccess("User has been signed out from all devices.");
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.detail || "Failed to force logout user.");
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleForcePasswordUser = async () => {
    if (!forcePasswordUser) return;
    const newPassword = generateTempPassword(12);
    setSecurityActionLoading(true);
    try {
      await adminApi.forcePasswordResetUser(forcePasswordUser.user_id, newPassword);
      setForcePasswordSuccessValue(newPassword);
      toastSuccess("Share the temporary password below with the user. They must change it on first login.", "Password set");
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.detail || "Failed to set password.");
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleCopyForcePassword = async () => {
    if (!forcePasswordSuccessValue) return;
    try {
      await navigator.clipboard.writeText(forcePasswordSuccessValue);
      toastInfo("Temporary password copied to clipboard.", "Copied");
    } catch {
      toastError("Copy failed");
    }
  };

  const handleCloseForcePasswordDialog = () => {
    setForcePasswordUser(null);
    setForcePasswordSuccessValue(null);
  };

  const handleForceLogoutAllInBrand = async () => {
    if (!forceLogoutBrandUser) return;
    const brandName = (forceLogoutBrandUser.brand_name || forceLogoutBrandUser.workspace || "").trim();
    if (!brandName || brandName === "N/A") {
      toastError("No brand found for this user.");
      setForceLogoutBrandUser(null);
      return;
    }
    const pageSize = 100; // API max limit
    setForceLogoutBrandLoading(true);
    try {
      const seenIds = new Set();
      const uniqueUsers = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const data = await adminApi.getUsers({ brand: brandName, page, limit: pageSize });
        const list = data.users || [];
        if (list.length === 0) break;
        for (const u of list) {
          const id = u.user_id;
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          uniqueUsers.push(u);
        }
        hasMore = list.length === pageSize;
        page += 1;
      }
      let count = 0;
      for (const u of uniqueUsers) {
        try {
          await adminApi.forceLogoutUser(u.user_id);
          count += 1;
        } catch (e) {
          console.warn("Force logout failed for", u.user_id, e);
        }
      }
      setForceLogoutBrandUser(null);
      toastSuccess(
        count === 0
          ? "No users found in this brand."
          : `${count} user${count !== 1 ? "s" : ""} in ${brandName} signed out from all devices.`,
        "Done"
      );
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.detail || "Failed to load users or force logout.");
    } finally {
      setForceLogoutBrandLoading(false);
    }
  };

  // Fetch brands for transfer dialog
  useEffect(() => {
    adminApi.getBrandsList().then((r) => setBrandsList(r.brands || [])).catch(() => setBrandsList([]));
  }, []);

  return (
    <div className="space-y-4 p-6 animate-fade-in relative">
      {/* Global loader overlay when any 3-dot action is in progress */}
      {globalActionLoading && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Processing...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Brand Admin Management</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CreateBrandAdminDialog
            trigger={
              <Button className="bg-gradient-primary" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Brand Admin
              </Button>
            }
          />
          <AddUserToBrandDialog brandsList={brandsList} onSuccess={fetchUsers} />
          {addUserToBrandForBrand && (
            <AddUserToBrandDialog
              brandsList={brandsList}
              onSuccess={() => { fetchUsers(); setAddUserToBrandForBrand(null); }}
              open={true}
              onOpenChange={(o) => !o && setAddUserToBrandForBrand(null)}
              initialBrandId={addUserToBrandForBrand.brandId}
              initialBrandName={addUserToBrandForBrand.brandName}
            />
          )}
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {totalUserCount} Total Users
          </Badge>
        </div>
      </div>



      {/* Users Table */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {totalUserCount} user{totalUserCount !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page size:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No brand admins found.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Work Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Sign up</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getAccessBadge(user.is_active)}</TableCell>
                        <TableCell>{getSignupMethodBadge(user.auth_provider)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"

                              >
                                <DropdownMenuItem
                                  onSelect={() =>
                                    handleAction(
                                      user.is_active ? "deactivate" : "activate",
                                      user
                                    )
                                  }
                                >
                                  {user.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setForceLogoutUser(user)}>
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Force logout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setForceLogoutBrandUser(user)}
                                  disabled={!user.brand_name && !user.workspace}
                                >
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Force logout all (this brand)
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => setForcePasswordUser(user)}>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Force password reset
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const bid = user.brand_id || brandsList.find(
                                      (b) => (b.brand_name || "").trim().toLowerCase() === (user.brand_name || user.workspace || "").trim().toLowerCase()
                                    )?.brand_id;
                                    if (!bid) {
                                      toastError("Could not determine brand for this user.");
                                      return;
                                    }
                                    setAddUserToBrandForBrand({
                                      brandId: typeof bid === "string" ? bid : String(bid),
                                      brandName: user.brand_name || user.workspace || "N/A",
                                    });
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Add user to this brand
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const brandId = user.brand_id || brandsList.find(
                                      (b) => (b.brand_name || "").trim().toLowerCase() === (user.brand_name || user.workspace || "").trim().toLowerCase()
                                    )?.brand_id;
                                    if (!brandId) {
                                      toastError("Could not determine brand for this user.");
                                      return;
                                    }
                                    setTransferDialogBrand({
                                      brandId: typeof brandId === "string" ? brandId : String(brandId),
                                      brandName: user.brand_name || user.workspace || "N/A",
                                    });
                                    setIsTransferDialogOpen(true);
                                  }}
                                >
                                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                                  Transfer Brand Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, totalUserCount)} of{" "}
                    {totalUserCount} users
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Drawer */}
      {selectedUser && (
        <UserDetailDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          user={selectedUser}
          onAction={handleAction}
          onForceLogout={(u) => {
            setIsDrawerOpen(false);
            setForceLogoutUser(u);
          }}
          onForcePasswordReset={(u) => {
            setIsDrawerOpen(false);
            setForcePasswordUser(u);
          }}
          brandUsers={brandUsersForDrawer}
        />
      )}

      {/* Action Modals */}
      {actionModal.type === "activate" && actionModal.user && (
        <ActivateDeactivateModal
          open={true}
          onOpenChange={handleCloseModal}
          user={actionModal.user}
          action="activate"
          onConfirm={handleActionComplete}
          onLoadingChange={setActivateDeactivateLoading}
        />
      )}

      {actionModal.type === "deactivate" && actionModal.user && (
        <ActivateDeactivateModal
          open={true}
          onOpenChange={handleCloseModal}
          user={actionModal.user}
          action="deactivate"
          onConfirm={handleActionComplete}
          onLoadingChange={setActivateDeactivateLoading}
        />
      )}

      {/* Force logout single user */}
      <AlertDialog open={!!forceLogoutUser} onOpenChange={(open) => !open && setForceLogoutUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force logout user?</AlertDialogTitle>
            <AlertDialogDescription>
              Sign out <span className="font-semibold">{forceLogoutUser?.name}</span> ({forceLogoutUser?.email}) from all devices? They will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={securityActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceLogoutUser} disabled={securityActionLoading}>
              {securityActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing out...
                </>
              ) : (
                "Sign out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force logout all users in this brand */}
      <AlertDialog
        open={!!forceLogoutBrandUser}
        onOpenChange={(open) => !open && setForceLogoutBrandUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force logout all users in this brand?</AlertDialogTitle>
            <AlertDialogDescription>
              All users in <span className="font-semibold">{forceLogoutBrandUser?.brand_name || forceLogoutBrandUser?.workspace || "this brand"}</span> will be signed out from all devices. They will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={forceLogoutBrandLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceLogoutAllInBrand} disabled={forceLogoutBrandLoading}>
              {forceLogoutBrandLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing out all...
                </>
              ) : (
                "Sign out all"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force password reset single user */}
      <Dialog open={!!forcePasswordUser} onOpenChange={(open) => !open && handleCloseForcePasswordDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {forcePasswordSuccessValue ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Password set
                </>
              ) : (
                "Force password reset"
              )}
            </DialogTitle>
            <DialogDescription>
              {forcePasswordSuccessValue
                ? "Share this temporary password with the user. They must change it on first login."
                : <>Set a temporary password for <span className="font-semibold">{forcePasswordUser?.name}</span> ({forcePasswordUser?.email}). A system-generated password will be created. They must change it on first login.</>}
            </DialogDescription>
          </DialogHeader>
          {forcePasswordSuccessValue ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Temporary password</Label>
                <div className="flex gap-2">
                  <Input readOnly value={forcePasswordSuccessValue} className="font-mono text-sm bg-muted" />
                  <Button type="button" variant="outline" size="icon" onClick={handleCopyForcePassword} title="Copy password">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Copy and share with the user. They will need to change it on first login.</p>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseForcePasswordDialog}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseForcePasswordDialog} disabled={securityActionLoading}>Cancel</Button>
                <Button onClick={handleForcePasswordUser} disabled={securityActionLoading}>
                  {securityActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Set password...
                    </>
                  ) : (
                    "Set password"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Brand Admin Dialog */}
      <TransferBrandAdminDialog
        open={isTransferDialogOpen}
        onOpenChange={(open) => {
          if (!open) setTransferDialogBrand(null);
          setIsTransferDialogOpen(open);
        }}
        brandsList={brandsList}
        initialBrandId={transferDialogBrand?.brandId}
        initialBrandName={transferDialogBrand?.brandName}
        onSuccess={fetchUsers}
        onLoadingChange={setTransferDialogLoading}
      />
    </div>
  );
}
