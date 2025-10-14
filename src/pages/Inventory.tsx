import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockInventory = [
  {
    id: "1",
    physicalInventoryNumber: "INV-2024-001",
    name: "Ming Dynasty Vase",
    category: "Ceramics",
    dateOfArticle: "1450-1500",
    location: "On Display",
    items: 1,
  },
  {
    id: "2",
    physicalInventoryNumber: "INV-2024-002",
    name: "Roman Coin Collection",
    category: "Numismatics",
    dateOfArticle: "100-200 AD",
    location: "In Storage",
    items: 45,
  },
  {
    id: "3",
    physicalInventoryNumber: "INV-2024-003",
    name: "Victorian Era Dress",
    category: "Textiles",
    dateOfArticle: "1880",
    location: "On Loan",
    items: 1,
  },
];

const Inventory = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Inventory</h1>
            <p className="text-muted-foreground">Manage your museum collection</p>
          </div>
          <Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90">
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
              />
            </div>
            <Button variant="outline" className="glass-hover border-[hsl(var(--glass-border)_/_0.3)]">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--glass-border)_/_0.3)]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[hsl(var(--glass-border)_/_0.2)] hover:bg-[hsl(var(--glass-bg)_/_0.3)] transition-colors"
                  >
                    <td className="py-4 px-4 text-sm">{item.physicalInventoryNumber}</td>
                    <td className="py-4 px-4 text-sm font-medium">{item.name}</td>
                    <td className="py-4 px-4 text-sm">{item.category}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{item.dateOfArticle}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={item.location === "On Display" ? "default" : "secondary"}
                        className="glass"
                      >
                        {item.location}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">{item.items}</td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
