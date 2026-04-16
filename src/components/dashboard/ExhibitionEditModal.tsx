import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { ExhibitionRecord, ExhibitionImage, CollectionType } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  exhibition: ExhibitionRecord | null;
  onSuccess?: () => void;
}

export function ExhibitionEditModal({ open, onClose, exhibition, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>("");
  const [startDate, setStartDate] = useState<string | null>("");
  const [endDate, setEndDate] = useState<string | null>("");
  const [collectionType, setCollectionType] = useState<CollectionType | null>(null);
  const [preview, setPreview] = useState<boolean>(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExhibitionImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && exhibition) {
      setTitle(exhibition.title || "");
      setDescription(exhibition.description || "");
      setStartDate(exhibition.start_date || "");
      setEndDate(exhibition.end_date || "");
      setCollectionType((exhibition.collection_type as CollectionType) || CollectionType.PERMANENT);
      setPreview(Boolean(exhibition.preview));
      setExistingImages(exhibition.images || []);
    } else if (!open) {
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setCollectionType(null);
      setPreview(false);
      setNewImages([]);
      setExistingImages([]);
      setRemovedImageIds([]);
    }
  }, [open, exhibition]);

  if (!open || !exhibition) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!exhibition) {
        setError('No exhibition selected');
        setLoading(false);
        return;
      }
      // build multipart/form-data for PUT (backend expects Form fields + files)
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (startDate) formData.append('start_date', startDate);
      if (endDate) formData.append('end_date', endDate);
      if (collectionType) formData.append('collection_type', collectionType);
      formData.append('preview', preview ? 'true' : 'false');

      if (existingImages && existingImages.length > 0) {
        formData.append('images_meta', JSON.stringify(existingImages.map(img => ({ id: img.id, description: img.description ?? null, date_taken: img.date_taken ?? null, photographer: img.photographer ?? null }))));
      }

      if (removedImageIds.length > 0) {
        formData.append('images_to_delete', JSON.stringify(removedImageIds));
      }

      newImages.forEach(file => formData.append('images', file, file.name));

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/exhibition/${exhibition.id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (res.status === 401) {
        try { localStorage.removeItem('token'); } catch (e) {}
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const text = await res.text();
      if (text) {
        try { JSON.parse(text); } catch (e) { /* ignore non-json */ }
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save exhibition");
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setNewImages(prev => [...prev, f]);
    e.currentTarget.value = '';
  };

  const removeNewImage = (idx: number) => setNewImages(prev => prev.filter((_, i) => i !== idx));

  const handleExistingImageMetaChange = (idx: number, field: keyof Pick<ExhibitionImage, 'description' | 'date_taken' | 'photographer'>, value: string) => {
    setExistingImages(prev => prev.map((img, i) => i === idx ? { ...img, [field]: value } : img));
  }

  const removeExistingImage = (idx: number) => {
    const img = existingImages[idx];
    if (!img) return;
    if (img.id) setRemovedImageIds(prev => [...prev, img.id]);
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] shadow-lg relative overflow-y-auto">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">Edit Exhibition</h2>
        <form className="space-y-4" onSubmit={handleSave}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="Description" value={description || ""} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Start Date (YYYY-MM-DD)" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
            <Input placeholder="End Date (YYYY-MM-DD)" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Collection Type</label>
              <select value={collectionType ?? ""} onChange={(e) => setCollectionType(e.target.value as CollectionType)} className="w-full p-2 rounded border">
                <option value={CollectionType.PERMANENT}>Permanent</option>
                <option value={CollectionType.TEMPORARY}>Temporary</option>
                <option value={CollectionType.ARCHIVED}>Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="edit-preview-check" type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} />
              <label htmlFor="edit-preview-check" className="text-sm">Preview</label>
            </div>
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm mb-2">Existing Images</label>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img, i) => (
                  <div key={img.id || i} className="bg-[hsl(var(--glass-bg)_/_0.2)] p-2 rounded w-64">
                    <div className="flex items-center justify-between mb-2">
                      <img src={img.public_url ?? `${import.meta.env.VITE_API_URL || ""}${img.file_path}`} alt="" className="w-24 h-16 object-cover rounded mr-2" />
                      <button type="button" className="text-destructive" onClick={() => removeExistingImage(i)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" placeholder="Description" value={img.description || ""} onChange={e => handleExistingImageMetaChange(i, 'description', e.target.value)} className="w-full mb-2 p-1 rounded border" />
                    <input type="date" placeholder="Date Taken" value={img.date_taken || ""} onChange={e => handleExistingImageMetaChange(i, 'date_taken', e.target.value)} className="w-full mb-2 p-1 rounded border" />
                    <input type="text" placeholder="Photographer" value={img.photographer || ""} onChange={e => handleExistingImageMetaChange(i, 'photographer', e.target.value)} className="w-full p-1 rounded border" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Add Images</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleNewImageChange} />
              <div className="flex gap-2 flex-wrap">
                {newImages.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[hsl(var(--glass-bg)_/_0.2)] p-2 rounded">
                    <span className="text-sm">{f.name}</span>
                    <button type="button" className="text-destructive" onClick={() => removeNewImage(i)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button className="w-full" type="submit" disabled={loading || !title}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
