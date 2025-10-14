import { LayoutDashboard, Package, Users, Heart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Inventory", icon: Package, path: "/inventory" },
  { title: "Donations", icon: Heart, path: "/donations" },
  { title: "Users", icon: Users, path: "/users" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-[hsl(var(--glass-border)_/_0.3)] p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">Museum Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Collection Management</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "glass-hover",
                isActive
                  ? "bg-[hsl(var(--glass-bg)_/_0.6)] border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-[hsl(var(--glass-border)_/_0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold">
            MA
          </div>
          <div>
            <p className="text-sm font-medium">Museum Admin</p>
            <p className="text-xs text-muted-foreground">admin@museum.org</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
