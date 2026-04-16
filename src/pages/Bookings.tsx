import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Booking {
  id: string;
  name?: string | null;
  email?: string | null;
  date_of_visit?: string | null;
  visitor_count?: number | null;
  phone?: string | null;
  message?: string | null;
  created_at?: string | null;
}

const Bookings = () => {
  useAuthGuard();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = debouncedSearch ? `?query=${encodeURIComponent(debouncedSearch)}` : "";
        const response = await apiGet<{ items?: Booking[] }>(`/booking${q}`);
        const items = (response && 'items' in (response as { items?: Booking[] }))
          ? (response as { items?: Booking[] }).items ?? []
          : (response as unknown as Booking[]) ?? [];
        setBookings(items);
      } catch (e) {
        setError("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Bookings</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage visitor bookings</p>
          </div>
        </div>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((b) => (
                <Card key={b.id} className="glass-hover p-4 sm:p-6 border-[hsl(var(--glass-border)_/_0.3)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold">{b.name ?? "Unnamed"}</h3>
                      <div className="text-sm text-muted-foreground mt-1">{b.email ?? "—"}</div>
                      {b.message && <p className="text-xs text-muted-foreground mt-1">Message: {b.message}</p>}
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>Date of visit: {b.date_of_visit ? new Date(b.date_of_visit).toLocaleString() : "—"}</div>
                      <div>Visitors: {b.visitor_count ?? "—"}</div>
                      {b.created_at && <div className="text-xs text-muted-foreground mt-1">Created: {new Date(b.created_at).toLocaleString()}</div>}
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

export default Bookings;
