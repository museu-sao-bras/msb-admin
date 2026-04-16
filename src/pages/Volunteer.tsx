import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Volunteer {
  id: string;
  name?: string;
  user_name?: string;
  email?: string;
  phone?: string;
  message?: string;
  created_at?: string;
}

const Volunteer = () => {
  useAuthGuard();

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = debouncedSearch ? `?query=${encodeURIComponent(debouncedSearch)}` : "";
    apiGet(`/volunteer${q}`)
      .then((data: any) => {
        // Expecting paginated response like { items: Volunteer[] }
        const items = data?.items ?? data ?? [];
        setVolunteers(items);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch volunteers");
        setLoading(false);
      });
  }, [debouncedSearch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Volunteers</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage volunteer contacts and applications</p>
          </div>
        </div>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading volunteers...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="grid gap-4">
              {volunteers.map((v) => (
                <Card key={v.id} className="glass-hover p-4 sm:p-6 border-[hsl(var(--glass-border)_/_0.3)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <Avatar className="w-12 h-12 glass flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {(v.name || v.user_name || "?").split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">{v.name ?? v.user_name ?? "Unnamed"}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="break-words">{v.email ?? "—"}</span>
                        </div>
                        {v.message && <p className="text-xs text-muted-foreground mt-1">Message: {v.message}</p>}
                        {v.created_at && <p className="text-xs text-muted-foreground mt-1">Applied: {new Date(v.created_at).toLocaleDateString()}</p>}
                      </div>
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

export default Volunteer;
