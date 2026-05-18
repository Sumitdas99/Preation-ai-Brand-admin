import { Bell, ChevronDown, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toastSuccess } from "@/utils/toast";
import { selectAuthUser } from "@/context/slice/authSlice";
import { logout } from "@/context/slice/authSlice";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    }
    return "User";
  };

  const getInitials = (name?: string) => {
    if (!name) {
      // Fallback to firstName/lastName if name is not available
      if (user?.firstName || user?.lastName) {
        const fallbackName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
        return fallbackName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "User";
    return role
      .split("_")
      .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
      .join(" ");
  };

  const handleLogout = () => {
    dispatch(logout());
    toastSuccess("You have been logged out successfully", "Logged out");
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets, violations, evidence packs..."
            className="pl-10 bg-secondary border-border"
          />
        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger"></span>
          </span>
        </Button> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user?.name || getDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role)}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                    : "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            {/* {user?.role === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/team")}>
                Team
              </DropdownMenuItem>
            )} */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
