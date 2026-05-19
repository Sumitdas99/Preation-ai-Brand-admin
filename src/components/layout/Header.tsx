import { Bell, ChevronDown, Search, Moon, Sun, Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";
import gsap from "gsap";
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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { toastSuccess } from "@/utils/toast";
import { selectAuthUser, logout } from "@/context/slice/authSlice";
import { useTheme } from "../theme-provider";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  
  // Ref for the theme icon animation
  const themeIconRef = useRef<HTMLDivElement>(null);

  // Determine actual current theme (resolving "system" to light or dark)
  const isDark = 
    theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    }
    return "User";
  };

  const getInitials = (name?: string) => {
    if (!name) {
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

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";

    // GSAP Timeline for a snappy, premium flip animation
    const tl = gsap.timeline();
    tl.to(themeIconRef.current, {
      scale: 0,
      rotation: isDark ? -90 : 90,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => setTheme(newTheme) // Change theme at the apex of the animation
    }).to(themeIconRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: "back.out(1.7)" // Adds a nice elastic bounce
    });
  };

  return (
    <header className="sticky top-4 z-50 mx-6 mt-4 flex h-14 shrink-0 items-center justify-between rounded-full border border-white/20 dark:border-zinc-800/40 bg-white/75 dark:bg-zinc-950/80 px-6 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300">
      {/* Left Section - Trigger & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 -ml-2 text-blue-500 hover:text-blue-600 hover:bg-white hover:border hover:border-blue-500 hover:shadow-sm dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-zinc-900 dark:hover:border-blue-500/50 rounded-full transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        {/* <div className="relative flex-1 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets, violations, evidence packs..."
            className="pl-10 bg-secondary/30 border-border/40 focus-visible:bg-background/80 transition-all shadow-inner hover:bg-secondary/50 rounded-full"
          />
        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* Instant Theme Toggle (GSAP Animated) */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full bg-secondary/40 border border-border/30 shadow-sm hover:bg-secondary/80 hover:shadow-md transition-all text-muted-foreground hover:text-foreground h-9 w-9"
        >
          <div ref={themeIconRef} className="flex items-center justify-center">
            {isDark ? (
              <Moon className="h-4 w-4 text-blue-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications (Commented Out) */}
        {/* <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
          </span>
        </Button> */}

        <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-3 px-3 py-1.5 hover:bg-zinc-100 hover:border-zinc-200 dark:hover:bg-zinc-900/60 dark:hover:border-zinc-800/80 rounded-full transition-all duration-200 border border-transparent shadow-none hover:shadow-sm"
            >
              <Avatar className="h-8 w-8 ring-2 ring-background/80 ring-offset-1 ring-offset-background shadow-sm transition-shadow">
                <AvatarFallback className="bg-primary/90 text-primary-foreground text-sm font-bold bg-gradient-to-br from-primary to-primary/70">
                  {getInitials(user?.name || getDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-none text-foreground/90">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{getRoleLabel(user?.role)}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-lg border-border/40 bg-background/95 backdrop-blur-md p-2">
            <DropdownMenuLabel className="px-2 py-3">
              <div className="flex flex-col space-y-1.5">
                <p className="font-semibold leading-none text-foreground">
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                    : "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer rounded-md py-2.5 font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-md py-2.5 font-medium text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}