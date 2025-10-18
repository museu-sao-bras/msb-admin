import * as React from "react";
import { useState } from "react";
import { apiPut } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

export function InventoryEditModal({ open, onClose, inventory, onSuccess }) {
  const [form, setForm] = useState(inventory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // ...similar logic for items/images as in upload modal...

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ...handleItemChange, handleImageChange, etc. (copy from upload modal)...

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Clean up empty strings to null or remove
      const clean = (obj) => {
        if (Array.isArray(obj)) return obj.map(clean);
        if (obj && typeof obj === "object") {
          const out = {};
          for (const k in obj) {
            if (obj[k] === "") continue;
            out[k] = clean(obj[k]);
          }
          return out;
        }
        return obj;
      };
      await apiPut(`/inventory/${inventory.id}`, clean(form));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to save inventory");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="bg-background p-8 rounded-lg w-full max-w-2xl max-h-[90vh] shadow-lg relative overflow-y-auto">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Inventory</h2>
        <form className="space-y-4" onSubmit={handleSave}>
          {/* Render all fields as editable, similar to upload modal */}
          {/* ...copy layout and logic from upload modal, but prefill with form values... */}
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
