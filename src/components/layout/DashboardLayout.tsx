import { ReactNode, useState, useEffect } from "react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  
  // 1. Lift state here so 'main' can see it
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen">
      {/* 2. Pass state to Desktop Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile sheet for sidebar */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={(v) => setOpen(v)}>
          <div className="p-4">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="p-0 w-64">
            {/* Mobile sidebar is usually never collapsed */}
            <SidebarContent isCollapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      {/* 3. Dynamic Margin: Shift content based on sidebar width */}
      <main 
        className={cn(
          "transition-all duration-300 p-4 md:p-8",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
};