import { ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
    if (user?.firstName || user?.lastName) return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return "Super Admin";
  };

  const getInitials = (name?: string) => {
    if (!name) {
      if (user?.firstName || user?.lastName) {
        const n = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
        return n.split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2);
      }
      return "SA";
    }
    return name.split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    dispatch(logout());
    toastSuccess("You have been logged out successfully", "Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 pl-4 z-50 flex h-16 items-center justify-between bg-background">
      <SidebarTrigger className="-ml-1 mr-2" />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
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
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.firstName || user?.lastName ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() : "Super Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
