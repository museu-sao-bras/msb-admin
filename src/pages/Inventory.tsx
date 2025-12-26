import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { API_BASE_URL, apiGet, apiPut } from "@/lib/api";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetClose,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ImageModal } from "@/components/ui/image-modal";
import { InventoryUploadModal } from "@/components/dashboard/InventoryUploadModal";
import { ViewInventorySheet } from "@/components/dashboard/ViewInventorySheet";
import { EditInventorySheet } from "@/components/dashboard/EditInventorySheet";
import { Textarea } from "@/components/ui/textarea";

export interface InventoryImage {
	id: string;
	inventory_item_id: string;
	file_path: string;
	description: string | null;
	date_taken: string | null;
	photographer: string | null;
}

export interface InventoryItemInstance {
	id: string;
	inventory_id: string;
	physical_inventory_number: string;
	state: string | null;
	location: string | null;
	loan_begin_datetime: string | null;
	loan_end_datetime: string | null;
	cupboard_number: string | null;
	drawer_number: string | null;
	images: InventoryImage[];
}

export interface InventoryRecord {
	id: string;
	physical_inventory_number: string;
	name: string | null;
	category: string | null;
	description: string | null;
	date_of_article: string | null;
	comments: string | null;
	context: string | null;
	created_at?: string;
	updated_at?: string;
	inventory_items: InventoryItemInstance[];
	donation_information?: any[];
}

const Inventory = () => {
	useAuthGuard();

	const [items, setItems] = useState<InventoryRecord[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [limit] = useState<number>(5);
	const [offset, setOffset] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [openItem, setOpenItem] = useState<InventoryRecord | null>(null);

	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearch, setDebouncedSearch] = useState<string>("");

	const [modalOpen, setModalOpen] = useState(false);
	const [modalImg, setModalImg] = useState<{ src: string; alt?: string } | null>(null);

	const [showUploadModal, setShowUploadModal] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editInventory, setEditInventory] = useState<InventoryRecord | null>(null);

	// debounce search input
	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
		return () => clearTimeout(id);
	}, [searchTerm]);

	useEffect(() => {
		setLoading(true);
		setError(null);
		const q = debouncedSearch ? `&query=${encodeURIComponent(debouncedSearch)}` : "";
		// when search changes, ensure pagination resets to first page
		// (if offset is not zero and debouncedSearch changed, reset offset then fetching will re-run)
		apiGet<{
			items: InventoryRecord[];
			total: number;
			limit: number;
			offset: number;
		}>(`/inventory?limit=${limit}&offset=${offset}${q}`)
			.then((data) => {
				// normal path
				setItems(data.items || []);
				setTotal(data.total ?? 0);
			})
			.catch((err) => {
				console.error(err);
				setError("Failed to load inventory.");
			})
			.finally(() => setLoading(false));
	}, [limit, offset, debouncedSearch]);

	const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8090";

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-gradient mb-2">
							Inventory
						</h1>
						<p className="text-muted-foreground">
							Manage your museum collection
						</p>
					</div>
					<Button
						className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90"
						onClick={() => setShowUploadModal(true)}
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Item
					</Button>
				</div>

				<Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
					<div className="flex gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search inventory..."
								className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setOffset(0);
								}}
							/>
						</div>
					</div>

					{loading ? (
						<div className="py-8 text-center text-muted-foreground">
							Loading...
						</div>
					) : error ? (
						<div className="py-8 text-center text-red-500">{error}</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-[hsl(var(--glass-border)_/_0.3)]">
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Inv #
											</th>
											{/* <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Name
											</th> */}
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Category
											</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Description
											</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Date
											</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Location
											</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Images
											</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{items.map((item) => (
											<tr
												key={item.id}
												className="border-b border-[hsl(var(--glass-border)_/_0.2)] hover:bg-[hsl(var(--glass-bg)_/_0.3)] transition-colors"
											>
												<td className="py-4 px-4 text-sm">
													{item.physical_inventory_number}
												</td>
												{/* <td className="py-4 px-4 text-sm font-medium">
													{item.name ?? "—"}
												</td> */}
												<td className="py-4 px-4 text-sm">
													{item.category ?? "—"}
												</td>
												<td className="py-4 px-4 text-sm max-w-[300px] truncate">
													{item.description ?? "—"}
												</td>
												<td className="py-4 px-4 text-sm text-muted-foreground">
													{item.date_of_article ?? "—"}
												</td>
												<td className="py-4 px-4">
													<Badge
														variant="default"
														className="text-sm"
													>
														{
															(item.inventory_items &&
																item.inventory_items[0]
																	?.location) ??
															"Unknown"
														}
													</Badge>
												</td>
												<td className="py-4 px-4 text-sm">
													{item.inventory_items
														? item.inventory_items.reduce(
															(acc, ii) =>
																acc + (ii.images?.length || 0),
															0
														)
														: 0}
												</td>
												<td className="flex gap-2 justify-end items-center py-4 px-4">
													<Button
														className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90"
														onClick={() => {
															setOpenItem(item);
														}}
													>
														View
													</Button>
													<Button
														className="glass-hover bg-secondary text-secondary-foreground hover:bg-secondary/90"
														onClick={() => {
															setEditInventory(item);
															setEditModalOpen(true);
														}}
													>
														Edit
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
								<div>Total: {total}</div>
								<div>
									<Button
										disabled={offset === 0}
										onClick={() =>
											setOffset(Math.max(0, offset - limit))
										}
										className="mr-2"
									>
										Previous
									</Button>
									<Button
										disabled={offset + limit >= total}
										onClick={() => setOffset(offset + limit)}
									>
										Next
									</Button>
								</div>
							</div>
						</>
					)}
				</Card>

				<InventoryUploadModal
					open={showUploadModal}
					onClose={() => setShowUploadModal(false)}
					onSuccess={() => {
						// Optionally, refetch inventory list here
						setShowUploadModal(false);
					}}
				/>
				<EditInventorySheet
					open={editModalOpen}
					inventory={editInventory}
					setInventory={inv => setEditInventory(inv)}
					onClose={() => setEditModalOpen(false)}
					onSave={() => setEditModalOpen(false)}
				/>

				<ViewInventorySheet
					open={!!openItem}
					item={openItem}
					onClose={() => setOpenItem(null)}
				/>
			</div>
		</DashboardLayout>
	);
};

export default Inventory;
