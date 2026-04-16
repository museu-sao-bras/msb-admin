import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { EventCreateModal } from "@/components/dashboard/EventCreateModal";
import { EventEditModal } from "@/components/dashboard/EventEditModal";

interface EventItem {
  id: string;
  title: string;
  organizer_name?: string | null;
  organizer_email?: string | null;
  organizer_phone?: string | null;
  description?: string | null;
  date?: string | null;
  location?: string | null;
  approved?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

const Event = () => {
  useAuthGuard();

  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchEvents = async (silent?: boolean) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const q = debouncedSearch ? `?query=${encodeURIComponent(debouncedSearch)}` : "";
      const data = await apiGet<{ items: EventItem[] }>(`/events${q}`);
      setItems(data.items || data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load events");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [debouncedSearch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Events</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage events</p>
          </div>
          <Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading events...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="grid gap-4">
              {items.map((it) => (
                <Card key={it.id} className="glass-hover p-4 sm:p-6 border-[hsl(var(--glass-border)_/_0.3)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold">{it.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{it.description ?? '—'}</p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{it.date ? new Date(it.date).toLocaleString() : '—'}</div>
                      <div className="mt-2">
                        <button onClick={() => { setEditItem(it); setEditOpen(true); }} className="text-sm text-primary underline mr-3">Edit</button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <EventCreateModal open={showCreate} onClose={() => setShowCreate(false)} onSuccess={() => { fetchEvents(true); setShowCreate(false); }} />
        <EventEditModal open={editOpen} event={editItem} onClose={() => setEditOpen(false)} onSuccess={() => { fetchEvents(true); setEditOpen(false); }} />
      </div>
    </DashboardLayout>
  );
};

export default Event;
