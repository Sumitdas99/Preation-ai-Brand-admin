import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-64 max-w-[80vw] border-r p-0 md:hidden"
        >
          <Sidebar onItemSelect={() => setMobileNavOpen(false)} inDrawer />
        </SheetContent>
      </Sheet>

      <Sidebar className="hidden md:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto overscroll-none scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
