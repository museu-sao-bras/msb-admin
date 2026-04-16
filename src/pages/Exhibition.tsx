import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash, Pen } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiDelete, API_BASE_URL } from "@/lib/api";
import { ExhibitionRecord, CollectionType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ExhibitionUploadModal } from "@/components/dashboard/ExhibitionUploadModal";
import { ExhibitionEditModal } from "@/components/dashboard/ExhibitionEditModal";
 

const Exhibition = () => {
  useAuthGuard();

  const [items, setItems] = useState<ExhibitionRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(6);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editExhibition, setEditExhibition] = useState<ExhibitionRecord | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchExhibitions = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      // API supports limit, offset and optional query
      const q = debouncedSearch ? `&query=${encodeURIComponent(debouncedSearch)}` : "";
      const data = await apiGet<{ items: ExhibitionRecord[]; total?: number }>(`/exhibition?limit=${limit}&offset=${offset}${q}`);
      setItems(data.items || []);
      setTotal(data.total ?? (data.items ? data.items.length : 0));
    } catch (err) {
      console.error(err);
      setError("Failed to load exhibitions.");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [limit, offset, debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exhibition? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      await apiDelete(`/exhibition/${id}`);
      await fetchExhibitions({ silent: true });
    } catch (err) {
      console.error(err);
      setError('Failed to delete exhibition');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions, debouncedSearch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Exhibitions</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage exhibitions and their images</p>
          </div>
          <Button className="glass-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Exhibition
          </Button>
        </div>

        <Card className="glass p-6 border-[hsl(var(--glass-border)_/_0.3)]">
          {/* <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exhibitions..."
                className="pl-10 glass border-[hsl(var(--glass-border)_/_0.3)] focus:border-primary"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setOffset(0);
                }}
              />
            </div>
          </div> */}

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">{error}</div>
          ) : (
            <>
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="glass-hover p-4 sm:p-6 border-[hsl(var(--glass-border)_/_0.3)]" role="button">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="text-base md:text-lg font-semibold">{item.title ?? "Untitled"}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description ?? "—"}</p>
                        </div>
                        <div className="text-sm text-muted-foreground text-right flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.collection_type === CollectionType.PERMANENT ? 'default' : item.collection_type === CollectionType.TEMPORARY ? 'secondary' : 'destructive'}>
                              {item.collection_type ?? '—'}
                            </Badge>
                            <Badge variant={item.preview ? 'secondary' : 'outline'}>
                              {item.preview ? 'Preview' : 'Live'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); setEditExhibition(item); setEditModalOpen(true); }}>
                              <Pen className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Start</div>
                          <div className="text-sm">{item.start_date ? new Date(item.start_date).toLocaleString() : "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">End</div>
                          <div className="text-sm">{item.end_date ? new Date(item.end_date).toLocaleString() : "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Created / Updated</div>
                          <div className="text-sm">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"} / {item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Images ({item.images?.length ?? 0})</div>
                        <div className="flex gap-3 flex-wrap">
                          {(item.images || []).map((img) => (
                            <div key={img.id} className="w-44 border rounded p-2 bg-[hsl(var(--glass-bg)_/_0.04)]">
                              <img
                                src={
                                  img.public_url && img.public_url.length > 0
                                    ? img.public_url
                                    : (img.file_path || "").startsWith("http")
                                    ? img.file_path
                                    : `${API_BASE_URL}${img.file_path || ""}`
                                }
                                alt={img.description || "exhibition image"}
                                className="w-full h-24 object-cover rounded"
                              />
                              <div className="mt-2 text-xs text-muted-foreground break-words">
                                <div>Description: {img.description ?? "—"}</div>
                                <div>Date Taken: {img.date_taken ?? "—"}</div>
                                <div>Photographer: {img.photographer ?? "—"}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* clicking the card opens edit modal via the Edit button; controls stopPropagation */}
                  </Card>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div>Total: {total}</div>
                <div>
                  <Button
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
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
        <ExhibitionUploadModal open={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={() => { fetchExhibitions({ silent: true }); }} />
        <ExhibitionEditModal open={editModalOpen} exhibition={editExhibition} onClose={() => setEditModalOpen(false)} onSuccess={() => { fetchExhibitions({ silent: true }); setEditModalOpen(false); }} />
      </div>
    </DashboardLayout>
  );
};

export default Exhibition;
