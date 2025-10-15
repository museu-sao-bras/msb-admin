import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const mockUsers = [
	{
		id: "1",
		userName: "John Doe",
		email: "john.doe@museum.org",
		createdAt: "2024-01-01",
	},
	{
		id: "2",
		userName: "Jane Smith",
		email: "jane.smith@museum.org",
		createdAt: "2024-01-05",
	},
	{
		id: "3",
		userName: "Bob Johnson",
		email: "bob.johnson@museum.org",
		createdAt: "2024-01-10",
	},
];

const Users = () => {
	useAuthGuard();

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-gradient mb-2">Users</h1>
						<p className="text-muted-foreground">
							Manage system users and permissions
						</p>
					</div>
					<Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90">
						<Plus className="w-4 h-4 mr-2" />
						Add User
					</Button>
				</div>

				<Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
							/>
						</div>
					</div>

					<div className="grid gap-4">
						{mockUsers.map((user) => (
							<Card
								key={user.id}
								className="glass-hover p-6 border-[hsl(var(--glass-border)_/_0.3)]"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Avatar className="w-12 h-12 glass">
											<AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
												{user.userName
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="text-lg font-semibold">
												{user.userName}
											</h3>
											<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
												<Mail className="w-4 h-4" />
												{user.email}
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												Joined: {user.createdAt}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="ghost"
											size="sm"
											className="text-primary hover:text-primary/80"
										>
											Edit
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive hover:text-destructive/80"
										>
											Remove
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				</Card>
			</div>
		</DashboardLayout>
	);
};

export default Users;
