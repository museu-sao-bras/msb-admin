import React, { useState } from "react";
import { CollectionType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExhibitionUploadModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>("");
  const [startDate, setStartDate] = useState<string | null>("");
  const [endDate, setEndDate] = useState<string | null>("");
  const [images, setImages] = useState<Array<{ file: File; description?: string; date_taken?: string; photographer?: string }>>([]);
  const [collectionType, setCollectionType] = useState<CollectionType>(CollectionType.PERMANENT);
  const [preview, setPreview] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImages((prev) => [...prev, { file: f }]);
    // Reset input
    e.currentTarget.value = "";
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleImageMetaChange = (idx: number, field: "date_taken" | "photographer" | "description", value: string) => {
    setImages(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (startDate) formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);
      if (collectionType) formData.append("collection_type", collectionType);
      formData.append("preview", preview ? "true" : "false");
      images.forEach((imgObj, i) => {
        const file = imgObj.file;
        // server expects array named `images`
        formData.append("images", file, file.name);
      });
      // include metadata for images as JSON array in same order
      const imagesMeta = images.map(img => ({ description: img.description ?? null, date_taken: img.date_taken ?? null, photographer: img.photographer ?? null }));
      formData.append('images_meta', JSON.stringify(imagesMeta));

      // POST multipart/form-data to /exhibition
      // Use fetch directly to ensure multipart POST (apiUpload also works)
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch(`${import.meta.env.VITE_API_URL || ""}/exhibition`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create exhibition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] shadow-lg relative overflow-y-auto">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">New Exhibition</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Description" value={description || ""} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Collection Type</label>
              <select value={collectionType} onChange={(e) => setCollectionType(e.target.value as CollectionType)} className="w-full p-2 rounded border">
                <option value={CollectionType.PERMANENT}>Permanent</option>
                <option value={CollectionType.TEMPORARY}>Temporary</option>
                <option value={CollectionType.ARCHIVED}>Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="preview-check" type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} />
              <label htmlFor="preview-check" className="text-sm">Preview</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Start Date (YYYY-MM-DD)" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
            <Input placeholder="End Date (YYYY-MM-DD)" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-2">Images</label>
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="flex gap-2 flex-wrap">
                {images.map((imgObj, i) => (
                  <div key={i} className="bg-[hsl(var(--glass-bg)_/_0.2)] p-2 rounded w-64">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm truncate">{imgObj.file.name}</span>
                      <button type="button" className="text-destructive" onClick={() => removeImage(i)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" placeholder="Description" value={imgObj.description || ""} onChange={e => handleImageMetaChange(i, 'description', e.target.value)} className="w-full mb-2 p-1 rounded border" />
                    <input type="date" placeholder="Date Taken" value={imgObj.date_taken || ""} onChange={e => handleImageMetaChange(i, 'date_taken', e.target.value)} className="w-full mb-2 p-1 rounded border" />
                    <input type="text" placeholder="Photographer" value={imgObj.photographer || ""} onChange={e => handleImageMetaChange(i, 'photographer', e.target.value)} className="w-full p-1 rounded border" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button className="w-full" type="submit" disabled={loading || !title}>
            {loading ? "Saving..." : "Create Exhibition"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
