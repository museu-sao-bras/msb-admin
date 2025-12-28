import { LayoutDashboard, Package, Users, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
	{ title: "Dashboard", icon: LayoutDashboard, path: "/" },
	{ title: "Inventory", icon: Package, path: "/inventory" },
	{ title: "Users", icon: Users, path: "/users" }
];

export const SidebarContent = () => {
	const [user, setUser] = useState<{ user_name?: string; email?: string } | null>(null);
	useEffect(() => {
		const stored = localStorage.getItem("user");
		if (stored) {
			try {
				setUser(JSON.parse(stored));
			} catch {
				setUser(null);
			}
		} else {
			setUser(null);
		}
	}, []);

	return (
		<div className="flex flex-col h-full p-6">
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

			<button
				onClick={() => {
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					window.location.href = "/login";
				}}
				className="mt-8 w-full py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors font-medium"
			>
				Logout
			</button>

			<div className="mt-auto pt-6 border-t border-[hsl(var(--glass-border)_/_0.3)]">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold">
						{user?.user_name ? user.user_name[0]?.toUpperCase() : "?"}
					</div>
					<div>
						<p className="text-sm font-medium">{user?.user_name ?? "Unknown User"}</p>
						<p className="text-xs text-muted-foreground">{user?.email ?? "No email"}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export const Sidebar = () => {
	return (
		// Hidden on small screens; shown from md and up
		<aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 glass border-r border-[hsl(var(--glass-border)_/_0.3)]">
			<SidebarContent />
		</aside>
	);
};
