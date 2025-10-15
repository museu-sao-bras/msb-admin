import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail, Phone } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const mockDonations = [
	{
		id: "1",
		donorName: "John Smith",
		donorEmail: "john.smith@email.com",
		donorPhone: "+1 234 567 890",
		inventoryItem: "Ming Dynasty Vase",
		donationDate: "2024-01-15",
	},
	{
		id: "2",
		donorName: "Sarah Johnson",
		donorEmail: "sarah.j@email.com",
		donorPhone: "+1 234 567 891",
		inventoryItem: "Colonial Documents",
		donationDate: "2024-01-10",
	},
];

const Donations = () => {
	useAuthGuard();

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-gradient mb-2">Donations</h1>
						<p className="text-muted-foreground">
							Track and manage donation information
						</p>
					</div>
					<Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90">
						<Plus className="w-4 h-4 mr-2" />
						Add Donation
					</Button>
				</div>

				<Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search donations..."
								className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
							/>
						</div>
					</div>

					<div className="grid gap-4">
						{mockDonations.map((donation) => (
							<Card
								key={donation.id}
								className="glass-hover p-6 border-[hsl(var(--glass-border)_/_0.3)]"
							>
								<div className="flex items-start justify-between">
									<div className="space-y-3 flex-1">
										<div>
											<h3 className="text-lg font-semibold">
												{donation.donorName}
											</h3>
											<p className="text-sm text-muted-foreground mt-1">
												Donated: {donation.inventoryItem}
											</p>
										</div>
										<div className="flex gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<Mail className="w-4 h-4" />
												{donation.donorEmail}
											</div>
											<div className="flex items-center gap-2">
												<Phone className="w-4 h-4" />
												{donation.donorPhone}
											</div>
										</div>
										<p className="text-xs text-muted-foreground">
											Donation Date: {donation.donationDate}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-primary hover:text-primary/80"
									>
										View Details
									</Button>
								</div>
							</Card>
						))}
					</div>
				</Card>
			</div>
		</DashboardLayout>
	);
};

export default Donations;
