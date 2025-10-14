import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </div>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          <h3 className="text-xl font-semibold mb-6">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-url" className="text-sm font-medium">API Base URL</Label>
              <Input
                id="api-url"
                placeholder="https://api.museum.org"
                className="mt-2 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                className="mt-2 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
              />
            </div>
            <Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          <h3 className="text-xl font-semibold mb-6">Display Preferences</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="items-per-page" className="text-sm font-medium">Items Per Page</Label>
              <Input
                id="items-per-page"
                type="number"
                defaultValue="20"
                className="mt-2 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
              />
            </div>
            <Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90">
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
