import { ReactNode, useState } from "react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar />

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
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* main content: on md+ leave left margin for sidebar, on small screens no margin */}
      <main className="md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
