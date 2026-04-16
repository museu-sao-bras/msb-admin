import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventCreateModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title,
        organizer_name: organizerName || null,
        organizer_email: organizerEmail || null,
        organizer_phone: organizerPhone || null,
        description: description || null,
        date: date ? new Date(date).toISOString() : null,
        location: location || null,
      };
      await apiPost(`/events`, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create event");
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
        <h2 className="text-lg font-bold mb-4">New Event</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Organizer Name" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
          <Input placeholder="Organizer Email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} />
          <Input placeholder="Organizer Phone" value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="datetime-local" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button className="w-full" type="submit" disabled={loading || !title}>
            {loading ? "Saving..." : "Create Event"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
