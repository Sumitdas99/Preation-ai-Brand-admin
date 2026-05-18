import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Upload,
  FileText,
  AlertTriangle,
  Package,
  CheckCircle,
  Users,
  CreditCard,
  Settings,
  FileSearch,
  Shield,
  Blocks,
  Building2,
  UserCheck,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { selectAuthUser, selectUserRole } from "@/context/slice/authSlice";
import type { UserRole } from "@/context/slice/authSlice";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number | (() => number);
  end?: boolean;
}

const allNavigationItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER","BRAND_ADMIN"] },
  { name: "Upload Assets", href: "/upload", icon: Upload, roles: ["CONTENT_REVIEWER",  "BRAND_ADMIN"] },
  { name: "Recent Assets", href: "/assets", icon: FileText, roles: ["CONTENT_REVIEWER",  "BRAND_ADMIN"] },
  { name: "Violations", href: "/violations", icon: AlertTriangle, roles: ["BRAND_ADMIN"] },
  { name: "Evidence Packs", href: "/evidence", icon: Package, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER",  "BRAND_ADMIN"] },
  { name: "Pending Approvals", href: "/approvals", icon: CheckCircle, roles: ["LEGAL_APPROVER",  "BRAND_ADMIN"] },
  { name: "Team & Roles", href: "/team", icon: Users, roles: [ "BRAND_ADMIN"] },
  { name: "Billing & Usage", href: "/billing", icon: CreditCard, roles: [ "BRAND_ADMIN"] },
  // { name: "Integrations", href: "/integrations", icon: Blocks, roles: [ "BRAND_ADMIN"] },
  { name: "Policies", href: "/policies", icon: Shield, roles: ["BRAND_ADMIN"] },
  { name: "Audit Log", href: "/audit", icon: FileSearch, roles: ["LEGAL_APPROVER",   "BRAND_ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER",  "BRAND_ADMIN"] }
  // { name: "Admin Console", href: "/super-admin", icon: LayoutDashboard, roles: ["SUPER_ADMIN"], end: true },
  // { name: "Brand Admin Requests", href: "/super-admin/brand-admin-requests", icon: UserCheck, roles: ["SUPER_ADMIN"] },
  // { name: "Brand Admin Management", href: "/super-admin/user-management", icon: UsersRound, roles: ["SUPER_ADMIN"] },
];



export function Sidebar() {
  const user = useSelector(selectAuthUser);
  const userRole = useSelector(selectUserRole);

  const brandName =
    user?.brandName ||
    user?.brand_name ||
    user?.workspaceName ||
    user?.workspace_name ||
    "";

  // Filter navigation based on user role
  const navigation = allNavigationItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-foreground">Praetion AI</h1>
          <p className="text-xs text-sidebar-foreground/60">Compliance Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const badgeCount = typeof item.badge === "function" ? item.badge() : item.badge;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus:outline-0",
                  isActive
                    ? "bg-[linear-gradient(135deg,_hsl(217_91%_24%)_0%,_hsl(217_91%_32%)_100%)] text-white font-bold"
                    : "text-[#454545]  hover:bg-[var(--hover-sidebar)]"
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {badgeCount !== undefined && badgeCount > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                  {badgeCount}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Workspace Info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          {/* <p className="text-xs font-medium text-sidebar-foreground">Current Brand</p> */}
          <p className="mt-1 text-sm font-semibold text-sidebar-primary">
            {brandName || "No Brand"}
          </p>
          {user && (
            <p className="mt-1 text-xs text-sidebar-foreground/60 capitalize">
              {user.role?.replace("_", " ")}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}