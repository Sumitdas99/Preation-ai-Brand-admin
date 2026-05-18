import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { UserPlus, Search, MoreVertical, Shield, Eye, Edit, Copy, CheckCircle, X, Power, PowerOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { selectUserRole, selectAuthUser } from "@/context/slice/authSlice";
import { adminApi } from "@/api/admin";
import { UserDetailDrawer } from "@/components/UserDetailDrawer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTablePagination } from "@/components/DataTablePagination";

const TEAM_MEMBERS_PAGE_SIZE = 10;
const INVITED_USERS_PAGE_SIZE = 10;

// Helper function to get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to format time ago
const formatTimeAgo = (date: Date | null | undefined): string => {
  if (!date) return "Never";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "min" : "mins"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
};

// Helper function to format date only
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Invalid Date";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (e) {
    return "Invalid Date";
  }
};

// Map API role to display name
const mapRoleToDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    CONTENT_REVIEWER: "Content Reviewer",
    LEGAL_APPROVER: "Legal Approver"
  };
  return roleMap[role] || role;
};

// Display roles for cards
const rolesDisplay = [
  {
    name: "Administrator",
    description: "Full system access and workspace management",
    color: "destructive",
  },
  {
    name: "Approver",
    description: "Review and approve/reject compliance decisions",
    color: "default",
  },
  {
    name: "Reviewer",
    description: "Review flagged content and make recommendations",
    color: "secondary",
  },
  {
    name: "Creator",
    description: "Upload assets and view compliance results",
    color: "outline",
  },
];

/** Generate a random temporary password (Cognito: upper, lower, number, symbol). */
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

// Actual roles for invitation (Brand Admin flow)
const inviteRoles = [
  { name: "Content Reviewer", value: "CONTENT_REVIEWER" },
  { name: "Legal Approver", value: "LEGAL_APPROVER" },
];
// Super Admin can also invite Brand Admin to a brand
const inviteRolesSuperAdmin = [
  ...inviteRoles,
  { name: "Brand Admin", value: "BRAND_ADMIN" },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  initials: string;
  workspaceName: string;
  // Store original API data for details view
  originalData?: any;
}

export default function Team() {
  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectAuthUser);
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteGeneratedPassword, setInviteGeneratedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersMode, setMembersMode] = useState<"server" | "client">("server");
  // Client fallback: keep the full dataset in memory (when backend returns unpaginated results)
  const [membersRawAll, setMembersRawAll] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  // Super Admin: brand dropdown for invite
  const [brandsList, setBrandsList] = useState<{ brand_id: string; brand_name: string }[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editRoleValue, setEditRoleValue] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const [loadingInvitedUsers, setLoadingInvitedUsers] = useState(false);
  const [invitedUsersSearchQuery, setInvitedUsersSearchQuery] = useState("");
  const [invitedUsersPage, setInvitedUsersPage] = useState(1);
  const [filteredInvitedUsers, setFilteredInvitedUsers] = useState<any[]>([]);
  const [paginatedInvitedUsers, setPaginatedInvitedUsers] = useState<any[]>([]);

  // Fetch team members (server-first; switches to client mode if API ignores pagination)
  const fetchTeamMembers = useCallback(async (page: number, search: string) => {
    setLoadingMembers(true);
    try {
      const response = await adminApi.getTeamMembers({
        page,
        limit: TEAM_MEMBERS_PAGE_SIZE,
        search: search?.trim() ? search.trim() : undefined,
      });
      const members = response.members || [];

      // Transform API response to component format
      const transformedMembers: TeamMember[] = members.map((member: any) => ({
        id: member.user_id,
        name: member.name,
        email: member.email,
        role: mapRoleToDisplayName(member.role),
        status: member.is_active ? "active" : "inactive",
        lastActive: formatTimeAgo(member.last_active),
        initials: getInitials(member.name),
        workspaceName: member.workspace_name || "N/A",
        originalData: member, // Store original data for details view
      }));

      const totalFromApi = typeof response.total === "number" ? response.total : undefined;
      const seemsUnpaginated =
        totalFromApi === undefined || transformedMembers.length > TEAM_MEMBERS_PAGE_SIZE;

      if (seemsUnpaginated) {
        // Client-side fallback: store full dataset, then filter+paginate locally via effect below
        setMembersMode("client");
        setMembersRawAll(transformedMembers);
      } else {
        // Server-side pagination
        setMembersMode("server");
        setMembersRawAll([]);
        setMembersTotal(totalFromApi ?? transformedMembers.length);

        const totalPages = Math.max(1, Math.ceil((totalFromApi ?? 0) / TEAM_MEMBERS_PAGE_SIZE));
        if (page > totalPages) {
          setMembersPage(totalPages);
        }
        setTeamMembers(transformedMembers);
      }
    } catch (error: any) {
      console.error("Failed to fetch team members", error);
      toastError(error.response?.data?.detail || error.message || "Failed to load team members");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  // Server mode: fetch whenever page/search changes
  useEffect(() => {
    if (membersMode !== "server") return;
    fetchTeamMembers(membersPage, searchQuery);
  }, [fetchTeamMembers, membersMode, membersPage, searchQuery]);

  // Client mode: filter + paginate locally to keep search & pagination perfectly aligned
  useEffect(() => {
    if (membersMode !== "client") return;

    const q = searchQuery.trim().toLowerCase();
    const filteredAll = q
      ? membersRawAll.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q)
        )
      : membersRawAll;

    setMembersTotal(filteredAll.length);

    const totalPages = Math.max(1, Math.ceil(filteredAll.length / TEAM_MEMBERS_PAGE_SIZE));
    const safePage = Math.min(membersPage, totalPages);
    if (safePage !== membersPage) {
      setMembersPage(safePage);
      return;
    }

    const start = (safePage - 1) * TEAM_MEMBERS_PAGE_SIZE;
    setTeamMembers(filteredAll.slice(start, start + TEAM_MEMBERS_PAGE_SIZE));
  }, [membersMode, membersRawAll, searchQuery, membersPage]);

  // Super Admin: fetch brands when invite modal opens or on mount
  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoadingBrands(true);
    adminApi
      .getBrandsList()
      .then((res: any) => {
        const list = res?.brands ?? [];
        setBrandsList(list);
        // If there's only one brand, auto-select it for invitations
        if (list.length === 1 && !selectedBrandId) {
          setSelectedBrandId(list[0].brand_id);
        }
      })
      .catch((err: any) => {
        toastError(err.response?.data?.detail || err.message || "Failed to load brands");
      })
      .finally(() => setLoadingBrands(false));
  }, [isSuperAdmin]);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole || !inviteFirstName.trim() || !inviteLastName.trim()) {
      toastError("Please fill in all required fields (Email, First Name, Last Name, and Role)");
      return;
    }
    if (isSuperAdmin && !selectedBrandId) {
      toastError("Please select a brand");
      return;
    }

    const generatedPassword = generateTempPassword(12);
    setLoading(true);
    try {
      const payload = isSuperAdmin
        ? { 
            brand_id: selectedBrandId, 
            email: inviteEmail, 
            first_name: inviteFirstName.trim(), 
            last_name: inviteLastName.trim(), 
            role: inviteRole, 
            temp_password: generatedPassword 
          }
        : { 
            email: inviteEmail, 
            first_name: inviteFirstName.trim(), 
            last_name: inviteLastName.trim(), 
            role: inviteRole, 
            temp_password: generatedPassword 
          };
      const response = isSuperAdmin
        ? await adminApi.inviteUserAsSuperAdmin(payload)
        : await adminApi.inviteUser(payload);

      const token = response?.token ?? response?.data?.token;
      const baseUrl = window.location.origin;
      const url = token ? `${baseUrl}/invitations/accept?token=${token}` : null;
      setInvitationUrl(url);
      setInviteGeneratedPassword(generatedPassword);

      toastSuccess(`User created. ${inviteEmail.trim()} will receive an email with their login details (invite link and temporary password).`, "User Creation & Invite");
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("");
      // Keep selectedBrandId for Super Admin so invited users list updates
      // Only reset if not Super Admin
      if (!isSuperAdmin) {
        setSelectedBrandId("");
      }
      await fetchTeamMembers(membersPage, searchQuery);
      // Refresh invited users list to show the newly invited user
      await fetchInvitedUsers();
    } catch (error: any) {
      toastError(error.response?.data?.detail || error.message || "Something went wrong", "Invitation Failed");
      setInvitationUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      if (member.status === "active") {
        await adminApi.updateUserStatus(member.id, false);
        toastSuccess(`${member.email} has been deactivated.`, "User deactivated");
      } else {
        await adminApi.updateUserStatus(member.id, true);
        toastSuccess(`${member.email} has been activated.`, "User activated");
      }
      await fetchTeamMembers(membersPage, searchQuery);
    } catch (error: any) {
      toastError(error.response?.data?.detail || error.message || "Failed to update status", "Action failed");
    }
  };

  const handleEditRoleClick = (member: TeamMember) => {
    setMemberToEdit(member);
    const apiRole = member.originalData?.role ?? "";
    setEditRoleValue(apiRole);
    setIsEditRoleOpen(true);
  };

  const handleEditRoleSave = async () => {
    if (!memberToEdit || !editRoleValue) {
      toastError("Please select a role");
      return;
    }
    setUpdatingRole(true);
    try {
      await adminApi.updateMemberRole(memberToEdit.id, editRoleValue);
      toastSuccess(`${memberToEdit.email} role has been updated successfully.`, "Role updated");
      setIsEditRoleOpen(false);
      setMemberToEdit(null);
      setEditRoleValue("");
      await fetchTeamMembers(membersPage, searchQuery);
    } catch (error: any) {
      toastError(error.response?.data?.detail || error.message || "Failed to update role", "Update failed");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Fetch invited users function
  const fetchInvitedUsers = useCallback(async () => {
    // Use different endpoints based on user role:
    // - Brand Admin: use /users/invitations/ (gets their own brand automatically)
    // - Super Admin: use /users/invitations/super-admin/by-brand with brand_id
    setLoadingInvitedUsers(true);
    try {
      if (isSuperAdmin) {
        const brandId = selectedBrandId || undefined;
        if (!brandId) {
          setInvitedUsers([]);
          return;
        }
        const data: any = await adminApi.getInvitationsByBrand(brandId);
        const pendingInvites = (data.invitations || []).filter(
          (inv: any) => inv.accepted_at === null
        );
        setInvitedUsers(pendingInvites);
      } else {
        // Brand Admin: use the endpoint that automatically gets their brand
        const data: any = await adminApi.getMyBrandInvitations();
        const pendingInvites = (data.invitations || []).filter(
          (inv: any) => inv.accepted_at === null
        );
        setInvitedUsers(pendingInvites);
      }
    } catch {
      setInvitedUsers([]);
    } finally {
      setLoadingInvitedUsers(false);
    }
  }, [isSuperAdmin, selectedBrandId]);

  // Fetch invited users for the current brand (page-level list)
  useEffect(() => {
    fetchInvitedUsers();
  }, [fetchInvitedUsers]);

  // Client-side filtering and pagination for invited users
  useEffect(() => {
    const q = invitedUsersSearchQuery.trim().toLowerCase();
    const filtered = q
      ? invitedUsers.filter(
          (inv) =>
            (inv.first_name?.toLowerCase().includes(q) ||
              inv.last_name?.toLowerCase().includes(q) ||
              `${inv.first_name || ""} ${inv.last_name || ""}`.toLowerCase().includes(q) ||
              inv.email?.toLowerCase().includes(q) ||
              mapRoleToDisplayName(inv.role)?.toLowerCase().includes(q))
        )
      : invitedUsers;

    setFilteredInvitedUsers(filtered);

    const totalPages = Math.max(1, Math.ceil(filtered.length / INVITED_USERS_PAGE_SIZE));
    const safePage = Math.min(invitedUsersPage, totalPages);
    if (safePage !== invitedUsersPage && totalPages > 0) {
      setInvitedUsersPage(safePage);
      return;
    }

    const start = (safePage - 1) * INVITED_USERS_PAGE_SIZE;
    setPaginatedInvitedUsers(filtered.slice(start, start + INVITED_USERS_PAGE_SIZE));
  }, [invitedUsers, invitedUsersSearchQuery, invitedUsersPage]);

  const handleViewDetails = (member: TeamMember) => {
    if (!member.originalData) return;

    // Adapt member data to match UserDetailDrawer expectations
    const adaptedMember = {
      ...member.originalData,
      name: member.name,
      email: member.email,
      workspace: member.workspaceName,
      role: mapRoleToDisplayName(member.originalData.role),
      status: member.originalData.status || "pending_verification",
      isActive: member.originalData.is_active ?? false,
      createdAt: member.originalData.created_at ? new Date(member.originalData.created_at) : new Date(),
      lastLogin: member.originalData.last_active ? new Date(member.originalData.last_active) : null,
    };

    setSelectedMember(adaptedMember);
    setIsDrawerOpen(true);
  };


  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Team & Roles</h1>
          <p className="mt-1 text-muted-foreground">
            Manage team members and their access permissions
          </p>
        </div>
        <Dialog
          open={isInviteOpen}
          onOpenChange={(open) => {
            setIsInviteOpen(open);
            if (!open) {
              setSelectedBrandId("");
              setInviteEmail("");
              setInviteFirstName("");
              setInviteLastName("");
              setInviteRole("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join a specific workspace with a Role and Temporary Password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isSuperAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select
                    value={selectedBrandId}
                    onValueChange={setSelectedBrandId}
                    disabled={loadingBrands}
                  >
                    <SelectTrigger id="brand">
                      <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select a brand"} />
                    </SelectTrigger>
                    <SelectContent>
                      {brandsList.map((b) => (
                        <SelectItem key={b.brand_id} value={b.brand_id}>
                          {b.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isSuperAdmin ? inviteRolesSuperAdmin : inviteRoles).map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A temporary password will be generated automatically. Share it with the user along with the invite link.
                </p>
              </div>

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={loading || (isSuperAdmin && !selectedBrandId) || !inviteEmail || !inviteFirstName.trim() || !inviteLastName.trim() || !inviteRole}
              >
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invitation sent confirmation (no link/password shown; sent by email) */}
      {(invitationUrl || inviteGeneratedPassword) && (
        <Alert className="border-primary bg-primary/5 relative">
          <CheckCircle className="h-4 w-4 text-primary" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => { setInvitationUrl(null); setInviteGeneratedPassword(null); }}
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertTitle className="font-semibold">Invitation sent</AlertTitle>
          <AlertDescription className="mt-2">
            The invited user will receive an email with the invite link and temporary password. They must change the password on first login.
          </AlertDescription>
        </Alert>
      )}

      {/* Roles Overview */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rolesDisplay.map((role) => (
          <Card key={role.name} className="card-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5 text-primary" />
                <Badge variant={role.color as any}>{role.name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Team Members */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-display">Team Members</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMembersPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {loadingMembers ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Work Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No team members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <p className="font-medium">{member.name || "—"}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.role}</Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={member.status === "active" ? "default" : "secondary"}
                            className={
                              member.status === "active"
                                ? "status-pass"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.lastActive}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRoleClick(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(member)}>
                                {member.status === "active" ? (
                                  <>
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Power className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <DataTablePagination
                currentPage={membersPage}
                totalPages={Math.max(1, Math.ceil(membersTotal / TEAM_MEMBERS_PAGE_SIZE))}
                totalCount={membersTotal}
                pageSize={TEAM_MEMBERS_PAGE_SIZE}
                onPageChange={setMembersPage}
                itemLabel="members"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Invited Users (Pending) */}
      {loadingInvitedUsers && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-display">Invited Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading invited users...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingInvitedUsers && invitedUsers.length > 0 && (
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-display">Invited Users</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invited users..."
                  className="pl-10"
                  value={invitedUsersSearchQuery}
                  onChange={(e) => {
                    setInvitedUsersSearchQuery(e.target.value);
                    setInvitedUsersPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedInvitedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {invitedUsersSearchQuery.trim() ? "No invited users found matching your search" : "No invited users"}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Work Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvitedUsers.map((invite: any) => {
                      const fullName = invite.first_name && invite.last_name
                        ? `${invite.first_name} ${invite.last_name}`
                        : invite.first_name || invite.last_name || "—";
                      return (
                        <TableRow key={invite.invite_id || invite.email}>
                          <TableCell className="text-sm font-medium">
                            {fullName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invite.email}
                          </TableCell>
                          <TableCell className="text-sm">
                            {mapRoleToDisplayName(invite.role)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(invite.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize"
                            >
                              pending
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <DataTablePagination
                  currentPage={invitedUsersPage}
                  totalPages={Math.max(1, Math.ceil(filteredInvitedUsers.length / INVITED_USERS_PAGE_SIZE))}
                  totalCount={filteredInvitedUsers.length}
                  pageSize={INVITED_USERS_PAGE_SIZE}
                  onPageChange={setInvitedUsersPage}
                  itemLabel="invited users"
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Detail Drawer */}
      {selectedMember && (
        <UserDetailDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          user={selectedMember}
        />
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Change the role for {memberToEdit?.email ?? "this member"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRoleValue} onValueChange={setEditRoleValue}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {(isSuperAdmin ? inviteRolesSuperAdmin : inviteRoles).map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoleSave} disabled={updatingRole}>
              {updatingRole ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
