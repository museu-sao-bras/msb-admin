import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface User {
	id: string;
	user_name: string;
	email: string;
	created_at: string;
}

const Users = () => {
	useAuthGuard();

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [addName, setAddName] = useState("");
	const [addEmail, setAddEmail] = useState("");
	const [addPassword, setAddPassword] = useState("");
	const [addLoading, setAddLoading] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<string | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
		return () => clearTimeout(id);
	}, [searchTerm]);

	useEffect(() => {
		setLoading(true);
		setError(null);
		const q = debouncedSearch ? `?query=${encodeURIComponent(debouncedSearch)}` : "";
		apiGet(`/user/all${q}`)
			.then((data: { items: User[] }) => {
				setUsers(data.items || []);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to fetch users");
				setLoading(false);
			});
	}, [debouncedSearch]);

	const handleAddUser = async () => {
		setAddLoading(true);
		setAddError(null);
		try {
			await apiPost("/user", {
				name: addName,
				email: addEmail,
				password: addPassword,
				created_at: new Date().toISOString(),
			});
			setShowAddModal(false);
			setAddName("");
			setAddEmail("");
			setAddPassword("");
			// Optionally, refetch users
			setLoading(true);
			apiGet("/user/all")
				.then((data: { items: User[] }) => {
					setUsers(data.items || []);
					setLoading(false);
				})
				.catch(() => {
					setError("Failed to fetch users");
					setLoading(false);
				});
		} catch (err) {
			setAddError("Failed to add user");
		} finally {
			setAddLoading(false);
		}
	};

	const handleRemoveUser = async (id: string) => {
		setRemovingId(id);
		try {
			const res = await apiDelete(`/user/${id}`) as { status?: number } | undefined;
			// If the API throws on 204, treat it as success
			if (res === undefined || (res as { status?: number })?.status === 204) {
				// Optionally, refetch users
				setLoading(true);
				apiGet("/user/all")
					.then((data: { items: User[] }) => {
						setUsers(data.items || []);
						setLoading(false);
					})
					.catch(() => {
						setError("Failed to fetch users");
						setLoading(false);
					});
				setError(null);
			} else {
				setError("Failed to remove user");
			}
			} catch (err: any) {
				// If error is due to 204 No Content, treat as success
				const status = (err as { status?: number })?.status ?? (err?.response as { status?: number })?.status;
				if (status === 204) {
					setLoading(true);
					apiGet("/user/all")
						.then((data: { items: User[] }) => {
							setUsers(data.items || []);
							setLoading(false);
						})
						.catch(() => {
						setError("Failed to fetch users");
						setLoading(false);
					});
				setError(null);
			} else {
				setError("Failed to remove user");
			}
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Users</h1>
						<p className="text-sm md:text-base text-muted-foreground">Manage system users and permissions</p>
					</div>
					<Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowAddModal(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Add User
					</Button>
				</div>

				{/* Add User Modal */}
				{showAddModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
						<div className="bg-background rounded-lg p-6 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
							<button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setShowAddModal(false)}>
								×
							</button>
							<h2 className="text-lg md:text-xl font-bold mb-4">Add User</h2>
							<div className="space-y-4">
								<Input placeholder="Name" value={addName} onChange={e => setAddName(e.target.value)} />
								<Input placeholder="Email" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
								<Input placeholder="Password" type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} />
								{addError && <div className="text-destructive text-sm">{addError}</div>}
								<Button className="w-full" onClick={handleAddUser} disabled={addLoading || !addName || !addEmail || !addPassword}>{addLoading ? "Adding..." : "Add User"}</Button>
							</div>
						</div>
					</div>
				)}

				<Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					{loading ? (
						<div className="text-center py-8 text-muted-foreground">
							Loading users...
						</div>
					) : error ? (
						<div className="text-center py-8 text-destructive">{error}</div>
					) : (
						<div className="grid gap-4">
							{users.map((user) => (
								<Card key={user.id} className="glass-hover p-4 sm:p-6 border-[hsl(var(--glass-border)_/_0.3)]">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div className="flex items-start sm:items-center gap-4">
											<Avatar className="w-12 h-12 glass flex-shrink-0">
												<AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
													{user.user_name.split(" ").map((n) => n[0]).join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="text-base md:text-lg font-semibold">{user.user_name}</h3>
												<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
													<Mail className="w-4 h-4" />
													<span className="break-words">{user.email}</span>
												</div>
												<p className="text-xs text-muted-foreground mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
											</div>
										</div>
										<div className="flex gap-2 items-center justify-end">
											<Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">Edit</Button>
											<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => handleRemoveUser(user.id)} disabled={removingId === user.id}>{removingId === user.id ? "Removing..." : "Remove"}</Button>
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</Card>
			</div>
		</DashboardLayout>
	);
};

export default Users;
