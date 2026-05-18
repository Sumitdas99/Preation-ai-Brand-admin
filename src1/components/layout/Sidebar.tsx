import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
  Boxes,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDevRole, subscribeDevRole, type DevRole } from "@/features/billing";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  role?: DevRole;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Assets", href: "/upload", icon: Upload },
  { name: "Recent Assets", href: "/assets", icon: FileText },
  { name: "Violations", href: "/violations", icon: AlertTriangle },
  { name: "Evidence Packs", href: "/evidence", icon: Package },
  { name: "Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Team & Roles", href: "/team", icon: Users },
  { name: "Billing & Usage", href: "/billing", icon: CreditCard },
  { name: "Brand Pack Manager", href: "/super-admin/brand-packs", icon: Boxes, role: "super-admin" },
  { name: "Integrations", href: "/integrations", icon: Blocks },
  { name: "Policies", href: "/policies", icon: Shield },
  { name: "Audit Log", href: "/audit", icon: FileSearch },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  className,
  onItemSelect,
  inDrawer = false,
}: {
  className?: string;
  onItemSelect?: () => void;
  inDrawer?: boolean;
}) {
  const [devRole, setDevRole] = useState<DevRole>(() => getDevRole());
  useEffect(() => subscribeDevRole(setDevRole), []);

  const visibleNav = navigation.filter(
    (item) => !item.role || item.role === devRole,
  );

  return (
    <aside className={cn("flex w-64 flex-col border-r border-border bg-sidebar", className)}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-sidebar-foreground">Aegis AI</h1>
          <p className="text-xs text-sidebar-foreground/60">Compliance Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onItemSelect}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs font-medium text-sidebar-foreground">Current Workspace</p>
          <p className="mt-1 text-sm font-semibold text-sidebar-primary">Acme Corp</p>
        </div>
      </div>
    </aside>
  );
}
