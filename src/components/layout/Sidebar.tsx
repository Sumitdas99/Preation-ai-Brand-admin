import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";

import { selectAuthUser, selectUserRole } from "@/context/slice/authSlice";
import type { UserRole } from "@/context/slice/authSlice";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number | (() => number);
  end?: boolean;
}

const allNavigationItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER", "BRAND_ADMIN"] },
  { name: "Upload Assets", href: "/upload", icon: Upload, roles: ["CONTENT_REVIEWER", "BRAND_ADMIN"] },
  { name: "Recent Assets", href: "/assets", icon: FileText, roles: ["CONTENT_REVIEWER", "BRAND_ADMIN"] },
  { name: "Violations", href: "/violations", icon: AlertTriangle, roles: ["BRAND_ADMIN"] },
  { name: "Evidence Packs", href: "/evidence", icon: Package, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER", "BRAND_ADMIN"] },
  { name: "Pending Approvals", href: "/approvals", icon: CheckCircle, roles: ["LEGAL_APPROVER", "BRAND_ADMIN"] },
  { name: "Team & Roles", href: "/team", icon: Users, roles: ["BRAND_ADMIN"] },
  { name: "Billing & Usage", href: "/billing", icon: CreditCard, roles: ["BRAND_ADMIN"] },
  { name: "Policies", href: "/policies", icon: Shield, roles: ["BRAND_ADMIN"] },
  { name: "Audit Log", href: "/audit", icon: FileSearch, roles: ["LEGAL_APPROVER", "BRAND_ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["CONTENT_REVIEWER", "LEGAL_APPROVER", "BRAND_ADMIN"] }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector(selectAuthUser);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  const brandName =
    user?.brandName ||
    user?.brand_name ||
    user?.workspaceName ||
    user?.workspace_name ||
    "No Brand";

  // Filter navigation based on user role
  const navigation = allNavigationItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  const isItemActive = (href: string, end?: boolean) => {
    if (end || href === "/") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Praetion AI</span>
                  <span className="text-xs text-muted-foreground">Compliance Platform</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navigation.map((item) => {
              const badgeCount = typeof item.badge === "function" ? item.badge() : item.badge;
              const active = isItemActive(item.href, item.end);

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                    <NavLink to={item.href} end={item.end} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span className="flex-1">{item.name}</span>
                      
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {badgeCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between rounded-lg bg-sidebar-accent p-3">
          <div className="flex flex-col gap-1 leading-none">
            <span className="font-semibold text-sm text-sidebar-primary">
              {brandName}
            </span>
            {user && (
              <span className="text-xs text-sidebar-foreground/60 capitalize">
                {user.role?.replace("_", " ").toLowerCase()}
              </span>
            )}
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}