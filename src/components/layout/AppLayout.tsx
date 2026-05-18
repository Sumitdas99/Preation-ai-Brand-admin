import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { selectIsAuthenticated } from "@/context/slice/authSlice";
import { getProfile } from "@/api/auth";

export function AppLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Periodic authentication check to detect force logout
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Function to validate authentication
    const validateAuth = async () => {
      try {
        // Make a lightweight API call to check if token is still valid
        // If token is invalid (force logout), the axios interceptor will handle 401 and log out the user
        await getProfile();
      } catch (error) {
        // Error is handled by axios interceptor (401 will trigger logout)
        // We don't need to do anything here as the interceptor handles it
      }
    };

    // Check immediately on mount and route changes
    validateAuth();

    // Set up periodic check every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      validateAuth();
    }, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, location.pathname]); // Re-run when route changes

  if (!isAuthenticated) {
    const isSuperAdminRoute = location.pathname.startsWith("/super-admin");
    return (
      <Navigate
        to={isSuperAdminRoute ? "/super-admin/login" : "/login"}
        replace
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
