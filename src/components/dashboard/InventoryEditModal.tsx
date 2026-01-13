import * as React from "react";
import { useState, useEffect } from "react";
import { apiPut, apiUpload } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

export function InventoryEditModal({ open, onClose, inventory, onSuccess }) {
  // initialize form from passed inventory; keep File references in-memory
  const [form, setForm] = useState(() => {
    // clone inventory so we can attach `file` properties to images without mutating prop
    if (!inventory) return null;
    try {
      return JSON.parse(JSON.stringify(inventory));
    } catch (e) {
      return { ...inventory };
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loanBeginPickerOpen, setLoanBeginPickerOpen] = useState<number | null>(null);
  const [loanEndPickerOpen, setLoanEndPickerOpen] = useState<number | null>(null);
  const [dateTakenPickerOpen, setDateTakenPickerOpen] = useState<{ itemIdx: number; imgIdx: number } | null>(null);
  const [donationDatePickerOpen, setDonationDatePickerOpen] = useState<{ idx: number } | null>(null);

  // keep form in sync when modal opens or inventory prop changes
  useEffect(() => {
    if (open && inventory) {
      try {
        setForm(JSON.parse(JSON.stringify(inventory)));
      } catch (e) {
        setForm({ ...inventory });
      }
    } else if (!open) {
      // clear form when modal closed to avoid stale files in memory
      setForm(null);
    }
  }, [open, inventory]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  const handleImageChange = (itemIdx, imgIdx, field, value) => {
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).map((it, i) => i === itemIdx ? ({
        ...it,
        images: (it.images || []).map((img, j) => j === imgIdx ? { ...img, [field]: value } : img)
      }) : it)
    }));
  };

  const handleImageFileChange = (itemIdx, imgIdx, file) => {
    if (!file) return;
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).map((it, i) => i === itemIdx ? ({
        ...it,
        images: (it.images || []).map((img, j) => j === imgIdx ? ({ ...img, file, file_path: file.name }) : img)
      }) : it)
    }));
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      inventory_items: [
        ...(prev?.inventory_items || []),
        {
          physical_inventory_number: "",
          state: "",
          location: "",
          loan_begin_datetime: "",
          loan_end_datetime: "",
          cupboard_number: "",
          drawer_number: "",
          images: [
            { file_path: "", description: "", date_taken: "", photographer: "" }
          ]
        }
      ]
    }));
  };

  const handleRemoveItem = (idx) => {
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddImage = (itemIdx) => {
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).map((it, i) => i === itemIdx ? ({
        ...it,
        images: [ ...(it.images || []), { file_path: "", description: "", date_taken: "", photographer: "" } ]
      }) : it)
    }));
  };

  const handleRemoveImage = (itemIdx, imgIdx) => {
    setForm(prev => ({
      ...prev,
      inventory_items: (prev?.inventory_items || []).map((it, i) => i === itemIdx ? ({
        ...it,
        images: (it.images || []).filter((_, j) => j !== imgIdx)
      }) : it)
    }));
  };

  const handleDonationChange = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      donation_information: (prev?.donation_information || []).map((d, i) => i === idx ? ({ ...(d||{}), [field]: value }) : d)
    }));
  };

  const LOCATION_OPTIONS = [
    { label: "On loan", value: "On loan" },
    { label: "In storage", value: "In storage" },
    { label: "On display", value: "On display" },
  ];

  const STATE_OPTIONS = [
    { label: "Excellent", value: "Excellent" },
    { label: "Good", value: "Good" },
    { label: "Fair", value: "Fair" },
    { label: "Poor", value: "Poor" },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form) return;
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

      // Strip File instances before sending JSON payload
      const stripFiles = (obj) => {
        if (Array.isArray(obj)) return obj.map(stripFiles);
        if (obj && typeof obj === "object") {
          const out = {};
          for (const k in obj) {
            const v = obj[k];
            if (v instanceof File) continue;
            out[k] = stripFiles(v);
          }
          return out;
        }
        return obj;
      };

      // send inventory update
      await apiPut(`/inventory/${inventory.id}`, clean(stripFiles(form)));

      // after updating inventory fields, upload any attached files for images
      try {
        for (let i = 0; i < (form.inventory_items || []).length; i++) {
          const item = form.inventory_items[i];
          if (!item || !item.images) continue;
          for (let j = 0; j < item.images.length; j++) {
            const img = item.images[j];
            const file = img?.file;
            if (!file) continue;

            try {
              const formData = new FormData();
              formData.append('file', file, file.name);
              formData.append('filename', file.name);
              if (item && item.id) {
                formData.append('inventory_item_id', item.id);
              }
              await apiUpload(`/uploads`, formData);
            } catch (imgErr) {
              console.warn('Image upload failed', imgErr);
              throw imgErr;
            }
          }
        }
      } catch (upErr) {
        console.warn('One or more image uploads failed', upErr);
        setError('Saved inventory but some image uploads failed.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save inventory');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Physical Inventory Number"
              value={form?.physical_inventory_number || ''}
              onChange={e => handleChange('physical_inventory_number', e.target.value)}
              required
            />
            <Input
              placeholder="Category"
              value={form?.category || ''}
              onChange={e => handleChange('category', e.target.value)}
            />
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <div className="w-full relative">
                  <Input
                    readOnly
                    value={form?.date_of_article ? format(new Date(form.date_of_article), "yyyy-MM-dd") : ""}
                    onClick={() => setDatePickerOpen(true)}
                    className={form?.date_of_article ? "" : "text-muted-foreground"}
                  />
                  {!form?.date_of_article && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Date of Article</span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0">
                <Calendar
                  mode="single"
                  selected={form?.date_of_article ? new Date(form.date_of_article) : undefined}
                  onSelect={date => {
                    handleChange('date_of_article', date ? date.toISOString().slice(0,10) : '');
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Textarea placeholder="Description" value={form?.description || ''} onChange={e => handleChange('description', e.target.value)} />
          <Textarea placeholder="Comments" value={form?.comments || ''} onChange={e => handleChange('comments', e.target.value)} />
          <Textarea placeholder="Context" value={form?.context || ''} onChange={e => handleChange('context', e.target.value)} />

          {/* Donation information if present */}
          { (form?.donation_information || []).length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Donation Information</h3>
              </div>
              {(form.donation_information || []).map((don, donIdx) => (
                <div key={donIdx} className="mb-4 grid grid-cols-1 gap-3 relative">
                  <Input placeholder="Donor Name" value={don?.donor_name || ''} onChange={e => handleDonationChange(donIdx, 'donor_name', e.target.value)} />
                  <Input placeholder="Donor Email" value={don?.donor_email || ''} onChange={e => handleDonationChange(donIdx, 'donor_email', e.target.value)} />
                  <Input placeholder="Donor Phone" value={don?.donor_phone || ''} onChange={e => handleDonationChange(donIdx, 'donor_phone', e.target.value)} />
                  <Input placeholder="Donor Address" value={don?.donor_address || ''} onChange={e => handleDonationChange(donIdx, 'donor_address', e.target.value)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Popover open={donationDatePickerOpen?.idx === donIdx} onOpenChange={open => setDonationDatePickerOpen(open ? { idx: donIdx } : null)}>
                      <PopoverTrigger asChild>
                        <div className="w-full relative">
                          <Input
                            readOnly
                            value={don?.donation_date ? format(new Date(don.donation_date), "yyyy-MM-dd") : ""}
                            onClick={() => setDonationDatePickerOpen({ idx: donIdx })}
                            className={don?.donation_date ? "" : "text-muted-foreground"}
                          />
                          {!don?.donation_date && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Donation Date</span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="p-0">
                        <Calendar
                          mode="single"
                          selected={don?.donation_date ? new Date(don.donation_date) : undefined}
                          onSelect={date => { handleDonationChange(donIdx, 'donation_date', date ? date.toISOString().slice(0,10) : ''); setDonationDatePickerOpen(null); }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input placeholder="Donation Notes" value={don?.donation_notes || ''} onChange={e => handleDonationChange(donIdx, 'donation_notes', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Inventory Items</h3>
              <div className="grid grid-cols-2 gap-2 items-center">
                <button type="button" className="text-primary hover:bg-primary/10 rounded-full p-1" onClick={handleAddItem} title="Add Inventory Item">+</button>
                {(form?.inventory_items?.length || 0) > 0 && (
                  <button type="button" className="text-destructive hover:bg-destructive/10 rounded-full p-1" onClick={() => handleRemoveItem((form.inventory_items || []).length - 1)} title="Delete Last Inventory Item">-</button>
                )}
              </div>
            </div>
            {(form?.inventory_items || []).map((item, itemIdx) => (
              <div key={itemIdx} className="mb-6 border p-4 rounded-lg relative bg-[hsl(var(--glass-bg)_/_0.2)] flex flex-col gap-4">
                <h5 className="font-semibold mb-4">Item {itemIdx + 1}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Physical Inventory Number" value={item.physical_inventory_number || ''} onChange={e => handleItemChange(itemIdx, 'physical_inventory_number', e.target.value)} required />
                  <Select value={item.state || ''} onValueChange={value => handleItemChange(itemIdx, 'state', value)}>
                    <SelectTrigger className="w-full">{item.state ? item.state : <span className="text-muted-foreground">Choose State</span>}</SelectTrigger>
                    <SelectContent>{STATE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={item.location || ''} onValueChange={value => handleItemChange(itemIdx, 'location', value)}>
                    <SelectTrigger className="w-full">{item.location ? item.location : <span className="text-muted-foreground">Choose Location</span>}</SelectTrigger>
                    <SelectContent>{LOCATION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {item.location === 'On loan' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Popover open={loanBeginPickerOpen === itemIdx} onOpenChange={open => setLoanBeginPickerOpen(open ? itemIdx : null)}>
                      <PopoverTrigger asChild>
                        <div className="w-full relative">
                          <Input readOnly value={item.loan_begin_datetime ? format(new Date(item.loan_begin_datetime), 'yyyy-MM-dd') : ''} onClick={() => setLoanBeginPickerOpen(itemIdx)} className={item.loan_begin_datetime ? '' : 'text-muted-foreground'} />
                          {!item.loan_begin_datetime && (<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Loan Begin Date</span>)}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="p-0">
                        <Calendar mode="single" selected={item.loan_begin_datetime ? new Date(item.loan_begin_datetime) : undefined} onSelect={date => { handleItemChange(itemIdx, 'loan_begin_datetime', date ? date.toISOString().slice(0,10) : ''); setLoanBeginPickerOpen(null); }} />
                      </PopoverContent>
                    </Popover>
                    <Popover open={loanEndPickerOpen === itemIdx} onOpenChange={open => setLoanEndPickerOpen(open ? itemIdx : null)}>
                      <PopoverTrigger asChild>
                        <div className="w-full relative">
                          <Input readOnly value={item.loan_end_datetime ? format(new Date(item.loan_end_datetime), 'yyyy-MM-dd') : ''} onClick={() => setLoanEndPickerOpen(itemIdx)} className={item.loan_end_datetime ? '' : 'text-muted-foreground'} />
                          {!item.loan_end_datetime && (<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Loan End Date</span>)}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="p-0">
                        <Calendar mode="single" selected={item.loan_end_datetime ? new Date(item.loan_end_datetime) : undefined} onSelect={date => { handleItemChange(itemIdx, 'loan_end_datetime', date ? date.toISOString().slice(0,10) : ''); setLoanEndPickerOpen(null); }} />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {item.location === 'In storage' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Cupboard Number" value={item.cupboard_number || ''} onChange={e => handleItemChange(itemIdx, 'cupboard_number', e.target.value)} />
                    <Input placeholder="Drawer Number" value={item.drawer_number || ''} onChange={e => handleItemChange(itemIdx, 'drawer_number', e.target.value)} />
                  </div>
                )}

                <div className="border-t pt-4 mt-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Images</h4>
                    <div className="flex gap-2 items-center">
                      <button type="button" className="text-primary hover:bg-primary/10 rounded-full p-1" onClick={() => handleAddImage(itemIdx)} title="Add Image">+</button>
                      {(item.images || []).length > 1 && (<button type="button" className="text-destructive hover:bg-destructive/10 rounded-full p-1" onClick={() => handleRemoveImage(itemIdx, (item.images || []).length - 1)} title="Delete Last Image">-</button>)}
                    </div>
                  </div>
                  {(item.images || []).map((img, imgIdx) => (
                    <div key={imgIdx} className="mb-4 border p-2 rounded relative bg-[hsl(var(--glass-bg)_/_0.1)] flex flex-col gap-4">
                      <h5 className="font-semibold mb-4">Image {imgIdx + 1}</h5>
                      {img.file_path && <div className="text-sm text-muted-foreground">Current: {img.file_path}</div>}
                      <Input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0] || null; handleImageFileChange(itemIdx, imgIdx, file); }} />
                      <Input placeholder="Description" value={img.description || ''} onChange={e => handleImageChange(itemIdx, imgIdx, 'description', e.target.value)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Popover open={dateTakenPickerOpen?.itemIdx === itemIdx && dateTakenPickerOpen?.imgIdx === imgIdx} onOpenChange={open => setDateTakenPickerOpen(open ? { itemIdx, imgIdx } : null)}>
                          <PopoverTrigger asChild>
                            <div className="w-full relative">
                              <Input readOnly value={img.date_taken ? format(new Date(img.date_taken), 'yyyy-MM-dd') : ''} onClick={() => setDateTakenPickerOpen({ itemIdx, imgIdx })} className={img.date_taken ? '' : 'text-muted-foreground'} />
                              {!img.date_taken && (<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Date Taken</span>)}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="p-0">
                            <Calendar mode="single" selected={img.date_taken ? new Date(img.date_taken) : undefined} onSelect={date => { handleImageChange(itemIdx, imgIdx, 'date_taken', date ? date.toISOString().slice(0,10) : ''); setDateTakenPickerOpen(null); }} />
                          </PopoverContent>
                        </Popover>
                        <Input placeholder="Photographer" value={img.photographer || ''} onChange={e => handleImageChange(itemIdx, imgIdx, 'photographer', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </form>
      </Card>
    </div>
  );
}
