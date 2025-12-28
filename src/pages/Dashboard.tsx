import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, Users, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiGet, API_BASE_URL } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  useAuthGuard();

  const [counts, setCounts] = useState({
    inventory: 0,
    items: 0,
    images: 0,
    donations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ inventory: number; items: number; images: number; donations: number }>("/analytics/counts")
      .then((data) => {
        setCounts(data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load analytics counts");
      })
      .finally(() => setLoading(false));
  }, []);

  interface LatestInventoryItem {
    id: string;
    physical_inventory_number: string;
    name: string | null;
    category: string | null;
    description: string | null;
    date_of_article: string | null;
    comments: string | null;
    context: string | null;
    created_at: string;
    updated_at?: string;
    inventory_items: Array<{
      id: string;
      inventory_id: string;
      physical_inventory_number: string;
      state: string | null;
      location: string | null;
      loan_begin_datetime: string | null;
      loan_end_datetime: string | null;
      cupboard_number: string | null;
      drawer_number: string | null;
      images: Array<{
        id: string;
        inventory_item_id: string;
        file_path: string;
        description: string | null;
        date_taken: string | null;
        photographer: string | null;
      }>;
    }>;
    donation_information: any[];
  }

  const [recent, setRecent] = useState<LatestInventoryItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    setRecentLoading(true);
    apiGet<{ items: LatestInventoryItem[] }>("/analytics/latest-inventory?limit=3")
      .then((data) => {
        setRecent(data.items || []);
        setRecentError(null);
      })
      .catch(() => setRecentError("Failed to load recent activity"))
      .finally(() => setRecentLoading(false));
  }, []);

  const [locations, setLocations] = useState<Record<string, number>>({});
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    setLocationsLoading(true);
    apiGet<Record<string, number>>("/analytics/item-locations")
      .then((data) => {
        setLocations(data || {});
        setLocationsError(null);
      })
      .catch(() => setLocationsError("Failed to load collection status"))
      .finally(() => setLocationsLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back to your museum collection management system</p>
        </div>

        {error && <div className="text-red-500">{error}</div>}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Inventory"
            value={loading ? "..." : counts.inventory}
            icon={Package}
            trend={loading ? undefined : undefined}
            trendUp
          />
          <StatsCard
            title="Total Inventory (Sub)Items"
            value={loading ? "..." : counts.items}
            icon={TrendingUp}
            trend={loading ? undefined : undefined}
            trendUp
          />
          <StatsCard
            title="Total Images"
            value={loading ? "..." : counts.images}
            icon={Users}
            trend={loading ? undefined : undefined}
            trendUp
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentLoading ? (
                <div className="text-muted-foreground text-center py-4">Loading...</div>
              ) : recentError ? (
                <div className="text-destructive text-center py-4">{recentError}</div>
              ) : recent.length === 0 ? (
                <div className="text-muted-foreground text-center py-4">No recent activity.</div>
              ) : (
                recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--glass-bg)_/_0.3)] hover:bg-[hsl(var(--glass-bg)_/_0.5)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.category || "Item"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{item.description}</p>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px]">
                      {item.inventory_items?.[0]?.images?.[0]?.file_path && (() => {
                        const fp = item.inventory_items[0].images[0].file_path;
                        return (
                          <img src={fp} alt={item.category || "Recent"} className="w-12 h-12 object-cover rounded-md ml-4 border mb-1" />
                        );
                      })()}
                      {item.updated_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
            <h3 className="text-xl font-semibold mb-4">Collection Status</h3>
            <div className="space-y-4">
              {locationsLoading ? (
                <div className="text-muted-foreground text-center py-4">Loading...</div>
              ) : locationsError ? (
                <div className="text-destructive text-center py-4">{locationsError}</div>
              ) : Object.keys(locations).length === 0 ? (
                <div className="text-muted-foreground text-center py-4">No data.</div>
              ) : (
                Object.entries(locations).map(([status, count], idx) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{status}</span>
                      <span className={idx === 0 ? "text-primary" : idx === 1 ? "text-secondary" : "text-accent"}>{count} items</span>
                    </div>
                    <div className="w-full h-2 bg-[hsl(var(--glass-bg)_/_0.5)] rounded-full overflow-hidden">
                      <div
                        className={
                          "h-full " +
                          (idx === 0
                            ? "bg-gradient-to-r from-primary to-accent"
                            : idx === 1
                            ? "bg-gradient-to-r from-secondary to-accent"
                            : "bg-gradient-to-r from-accent to-primary")
                        }
                        style={{ width: `${Math.max(5, (count / Object.values(locations).reduce((a, b) => a + b, 0)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
