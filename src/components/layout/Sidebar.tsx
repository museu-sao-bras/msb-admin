import { 
    LayoutDashboard, 
    Package, 
    Users, 
    ChevronLeft, 
    ChevronRight, 
    LogOut 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Inventory", icon: Package, path: "/inventory" },
    { title: "Users", icon: Users, path: "/users" }
];

export const SidebarContent = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const [user, setUser] = useState<{ user_name?: string; email?: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <div className={cn("flex flex-col h-full py-6 transition-all duration-300", isCollapsed ? "px-3" : "px-6")}>
            {/* Logo / Header */}
            <div className="mb-8 overflow-hidden whitespace-nowrap">
                <h1 className={cn("font-bold text-gradient transition-all", isCollapsed ? "text-xl text-center" : "text-2xl")}>
                    {isCollapsed ? "M" : "Museum Admin"}
                </h1>
                {!isCollapsed && (
                    <p className="text-sm text-muted-foreground mt-1">Collection Management</p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.title : ""} // Tooltip on hover when collapsed
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 py-3 rounded-lg transition-all duration-200",
                                isCollapsed ? "justify-center px-0" : "px-4",
                                "glass-hover",
                                isActive
                                    ? "bg-[hsl(var(--glass-bg)_/_0.6)] border-primary text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                title={isCollapsed ? "Logout" : ""}
                className={cn(
                    "mt-8 flex items-center justify-center gap-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all font-medium",
                    isCollapsed ? "px-0 w-10 mx-auto" : "w-full px-4"
                )}
            >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
            </button>

            {/* User Profile */}
            <div className={cn("mt-auto pt-6 border-t border-[hsl(var(--glass-border)_/_0.3)]", isCollapsed ? "flex justify-center" : "")}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                        {user?.user_name ? user.user_name[0]?.toUpperCase() : "?"}
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{user?.user_name ?? "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email ?? "No email"}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void 
}) => {
    return (
        <aside 
            className={cn(
                "hidden md:flex flex-col h-screen fixed left-0 top-0 glass border-r border-[hsl(var(--glass-border)_/_0.3)] transition-all duration-300 ease-in-out z-50",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-12 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border border-border shadow-md hover:scale-110 transition-transform z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <SidebarContent isCollapsed={isCollapsed} />
        </aside>
    );
};