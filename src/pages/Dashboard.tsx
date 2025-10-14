import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, Users, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your museum collection management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Inventory Items"
            value="1,247"
            icon={Package}
            trend="+12% from last month"
            trendUp
          />
          <StatsCard
            title="Active Donations"
            value="89"
            icon={Heart}
            trend="+5 this week"
            trendUp
          />
          <StatsCard
            title="Registered Users"
            value="45"
            icon={Users}
            trend="+3 new users"
            trendUp
          />
          <StatsCard
            title="Items on Display"
            value="342"
            icon={TrendingUp}
            trend="68% of collection"
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
