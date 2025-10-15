import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, Users, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your museum collection management system</p>
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <StatsCard
            title="Total Donations"
            value={loading ? "..." : counts.donations}
            icon={Heart}
            trend={loading ? undefined : undefined}
            trendUp
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New item added", item: "Ming Dynasty Vase", time: "2 hours ago" },
                { action: "Donation received", item: "Colonial Era Documents", time: "5 hours ago" },
                { action: "Item updated", item: "Roman Coin Collection", time: "1 day ago" },
                { action: "New user registered", item: "Jane Smith", time: "2 days ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--glass-bg)_/_0.3)] hover:bg-[hsl(var(--glass-bg)_/_0.5)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
            <h3 className="text-xl font-semibold mb-4">Collection Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>On Display</span>
                  <span className="text-primary">342 items</span>
                </div>
                <div className="w-full h-2 bg-[hsl(var(--glass-bg)_/_0.5)] rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>In Storage</span>
                  <span className="text-secondary">805 items</span>
                </div>
                <div className="w-full h-2 bg-[hsl(var(--glass-bg)_/_0.5)] rounded-full overflow-hidden">
                  <div className="h-full w-[32%] bg-gradient-to-r from-secondary to-accent rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>On Loan</span>
                  <span className="text-accent">100 items</span>
                </div>
                <div className="w-full h-2 bg-[hsl(var(--glass-bg)_/_0.5)] rounded-full overflow-hidden">
                  <div className="h-full w-[20%] bg-gradient-to-r from-accent to-primary rounded-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
