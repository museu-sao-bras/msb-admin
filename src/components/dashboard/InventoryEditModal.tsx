
import React, { useState, useEffect, useRef } from "react";
import { apiPut, apiGet, apiUpload, apiDelete } from "@/lib/api";
import { getCategories } from "@/lib/categories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2, X, Loader } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ImageModal } from "@/components/ui/image-modal";

interface ImageInput {
  file_path: string;
  description?: string;
  date_taken?: string;
  photographer?: string;
  file?: File | null;
}

interface ItemInput {
  id?: number;
  physical_inventory_number: string;
  state?: string;
  location?: string;
  loan_begin_datetime?: string;
  loan_end_datetime?: string;
  cupboard_number?: string;
  drawer_number?: string;
  images: ImageInput[];
}

interface DonationInfo {
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  donor_address?: string;
  donation_date?: string;
  donation_notes?: string;
}

interface InventoryInput {
  id?: number;
  physical_inventory_number: string;
  name?: string;
  category?: string;
  description?: string;
  date_of_article?: string;
  comments?: string;
  context?: string;
  inventory_items: ItemInput[];
  donation_information?: DonationInfo[];
}

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

export function InventoryEditModal({ open, onClose, inventory, onSuccess }: { open: boolean; onClose: () => void; inventory: any; onSuccess?: () => void }) {
  // Initialize a form state similar to Upload modal but seeded from `inventory` prop
  const [form, setForm] = useState<InventoryInput | null>(() => {
    if (!inventory) return null;
    try {
      return JSON.parse(JSON.stringify(inventory));
    } catch (e) {
      return { ...(inventory || {}) } as InventoryInput;
    }
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loanBeginPickerOpen, setLoanBeginPickerOpen] = useState<number | null>(null);
  const [loanEndPickerOpen, setLoanEndPickerOpen] = useState<number | null>(null);
  const [dateTakenPickerOpen, setDateTakenPickerOpen] = useState<{ itemIdx: number; imgIdx: number } | null>(null);
  const [donationDatePickerOpen, setDonationDatePickerOpen] = useState<{ idx: number } | null>(null);

  // donation search UI state (copied from upload modal)
  const [donationQuery, setDonationQuery] = useState<string>("");
  const [donationResults, setDonationResults] = useState<any[]>([]);
  const [donationLoading, setDonationLoading] = useState(false);
  const [activeDonIdx, setActiveDonIdx] = useState<number | null>(null);
  const donationDebounceRef = useRef<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState<string>(form?.category || "");
  const [debouncedCategoryQuery, setDebouncedCategoryQuery] = useState<string>("");
  const [categoryFocused, setCategoryFocused] = useState(false);

  useEffect(() => {
    if (open && inventory) {
      try {
        setForm(JSON.parse(JSON.stringify(inventory)));
      } catch (e) {
        setForm({ ...(inventory || {}) } as InventoryInput);
      }
    } else if (!open) {
      setForm(null);
      setDonationQuery('');
      setDonationResults([]);
      setActiveDonIdx(null);
    }
  }, [open, inventory]);

  const handleChange = (field: keyof InventoryInput, value: any) => {
    setForm(prev => prev ? ({ ...prev, [field]: value }) : prev);
  };

  const handleAddItem = () => {
    setForm(prev => prev ? ({
      ...prev,
      inventory_items: [
        ...prev.inventory_items,
        {
          physical_inventory_number: "",
          state: "",
          location: "",
          loan_begin_datetime: "",
          loan_end_datetime: "",
          cupboard_number: "",
          drawer_number: "",
          images: [{ file_path: "", description: "", date_taken: "", photographer: "" }]
        }
      ]
    }) : prev);
  };

  const handleRemoveItem = (idx: number) => {
    setForm(prev => prev ? ({ ...prev, inventory_items: prev.inventory_items.filter((_, i) => i !== idx) }) : prev);
  };

  const handleItemChange = (idx: number, field: keyof ItemInput, value: any) => {
    setForm(prev => prev ? ({
      ...prev,
      inventory_items: prev.inventory_items.map((item, i) => i === idx ? ({ ...item, [field]: value }) : item)
    }) : prev);
  };

  const handleAddImage = (itemIdx: number) => {
    setForm(prev => prev ? ({ ...prev, inventory_items: prev.inventory_items.map((item, i) => i === itemIdx ? ({ ...item, images: [ ...item.images, { file_path: "", description: "", date_taken: "", photographer: "" } ] }) : item) }) : prev);
  };

  const handleRemoveImage = (itemIdx: number, imgIdx: number) => {
    setForm(prev => prev ? ({ ...prev, inventory_items: prev.inventory_items.map((item, i) => i === itemIdx ? ({ ...item, images: item.images.filter((_, j) => j !== imgIdx) }) : item) }) : prev);
  };

  const handleImageChange = (itemIdx: number, imgIdx: number, field: keyof ImageInput, value: any) => {
    setForm(prev => prev ? ({ ...prev, inventory_items: prev.inventory_items.map((item, i) => i === itemIdx ? ({ ...item, images: item.images.map((img, j) => j === imgIdx ? ({ ...img, [field]: value }) : img) }) : item) }) : prev);
  };

  const handleImageFileChange = (itemIdx: number, imgIdx: number, file: File | null) => {
    if (!file) return;
    setForm(prev => prev ? ({ ...prev, inventory_items: prev.inventory_items.map((it, i) => i === itemIdx ? ({ ...it, images: it.images.map((img, j) => j === imgIdx ? ({ ...img, file_path: file.name, file }) : img) }) : it) }) : prev);
  };

  // Small preview component for image fields. Shows local File via object URL or existing file_path.
  const PreviewImage = ({ img, onClick }: { img: ImageInput; onClick?: (src: string) => void }) => {
    const [src, setSrc] = useState<string | null>(null);
    useEffect(() => {
      let url: string | null = null;
      if (img?.file) {
        url = URL.createObjectURL(img.file);
        setSrc(url);
      } else if (img?.file_path) {
        setSrc(img.file_path);
      } else {
        setSrc(null);
      }
      return () => { if (url) URL.revokeObjectURL(url); };
    }, [img?.file, img?.file_path]);

    if (!src) return null;
    return (
      <img
        src={src}
        alt={img.description || 'Image'}
        className="w-32 h-20 object-cover rounded-md ml-0 border cursor-pointer"
        onClick={() => onClick && src && onClick(src)}
      />
    );
  };

  // lightbox state for enlarged image preview
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleDonationChange = (idx: number, field: keyof DonationInfo, value: string) => {
    setForm(prev => prev ? ({ ...prev, donation_information: (prev.donation_information || []).map((d, i) => i === idx ? ({ ...(d || {}), [field]: value }) : d) }) : prev);
  };

  // donation search
  useEffect(() => {
    if (donationDebounceRef.current) window.clearTimeout(donationDebounceRef.current as any);
    if (!donationQuery || donationQuery.trim().length < 2 || activeDonIdx === null) {
      setDonationResults([]);
      setDonationLoading(false);
      return;
    }
    setDonationLoading(true);
    donationDebounceRef.current = window.setTimeout(async () => {
      try {
        const q = encodeURIComponent(donationQuery.trim());
        const res = await apiGet<{ items: any[] }>(`/donation-information?query=${q}&limit=20&offset=0`);
        setDonationResults(res.items || []);
      } catch (err) {
        console.warn('Donation search failed', err);
        setDonationResults([]);
      } finally {
        setDonationLoading(false);
      }
    }, 400) as unknown as number;
    return () => { if (donationDebounceRef.current) window.clearTimeout(donationDebounceRef.current as any); };
  }, [donationQuery, activeDonIdx]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      try {
        const list = await getCategories();
        if (!cancelled) setCategories(list || []);
      } catch (err) {
        console.warn('Failed to load categories', err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    setCategoryQuery(form?.category || "");
  }, [open, form?.category]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedCategoryQuery(categoryQuery.trim()), 300);
    return () => window.clearTimeout(id);
  }, [categoryQuery]);

  const categorySuggestions = debouncedCategoryQuery
    ? categories.filter(c => c.toLowerCase().includes(debouncedCategoryQuery.toLowerCase()))
    : [];

  const applyDonationResult = (idx: number, result: any) => {
    handleDonationChange(idx, 'donor_name', result.donor_name || '');
    handleDonationChange(idx, 'donor_email', result.donor_email || '');
    handleDonationChange(idx, 'donor_phone', result.donor_phone || '');
    handleDonationChange(idx, 'donor_address', result.donor_address || '');
    handleDonationChange(idx, 'donation_date', result.donation_date || '');
    handleDonationChange(idx, 'donation_notes', result.donation_notes || '');
    setDonationResults([]);
    setDonationQuery('');
    setActiveDonIdx(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !inventory) return;
    setLoading(true);
    setError(null);
    try {
      const clean = (obj: any) => {
        if (Array.isArray(obj)) return obj.map(clean);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const k in obj) {
            if (obj[k] === '') continue;
            out[k] = clean(obj[k]);
          }
          return out;
        }
        return obj;
      };

      const stripFiles = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(stripFiles);
        if (obj && typeof obj === 'object') {
          const out: any = {};
          for (const k in obj) {
            const v = obj[k];
            if (v instanceof File) continue;
            out[k] = stripFiles(v);
          }
          return out;
        }
        return obj;
      };

      // send inventory update via PUT
      const payload = clean(stripFiles(form));
      const updated = await apiPut(`/inventory/${inventory.id}`, payload) as any;

      // upload any attached files for images (keep current behavior)
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
              // try to find the matching updated inventory_item id
              const updatedItem = updated?.inventory_items?.[i];
              if (updatedItem && updatedItem.id) {
                formData.append('inventory_item_id', updatedItem.id);
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
      console.error(err);
      setError('Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventory = async () => {
    if (!inventory?.id) return;
    if (!window.confirm('Delete this inventory item? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/inventory/${inventory.id}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete inventory');
    } finally {
      setDeleting(false);
    }
  };

  if (!open || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="bg-background p-8 rounded-lg w-full max-w-2xl max-h-[90vh] shadow-lg relative overflow-y-auto">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Inventory</h2>
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Physical Inventory Number"
              value={form.physical_inventory_number}
              onChange={e => handleChange('physical_inventory_number', e.target.value)}
              required
            />
            <div className="relative">
              <Input
                placeholder="Category"
                value={categoryQuery}
                onChange={e => setCategoryQuery(e.target.value)}
                onFocus={() => setCategoryFocused(true)}
                onBlur={() => { handleChange('category', categoryQuery); setTimeout(() => setCategoryFocused(false), 100); }}
              />
              {categoriesLoading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {categoryFocused && categorySuggestions.length > 0 && (
                <div className="absolute z-50 bg-background border rounded mt-1 w-full max-h-48 overflow-auto shadow">
                  {categorySuggestions.map(s => (
                    <div key={s} className="p-2 hover:bg-accent/10 cursor-pointer" onMouseDown={() => { handleChange('category', s); setCategoryQuery(s); }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <div className="w-full relative">
                  <Input
                    readOnly
                    value={form.date_of_article ? format(new Date(form.date_of_article), 'yyyy-MM-dd') : ''}
                    onClick={() => setDatePickerOpen(true)}
                    className={form.date_of_article ? '' : 'text-muted-foreground'}
                  />
                  {!form.date_of_article && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Date of Article</span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0">
                <Calendar
                  mode="single"
                  selected={form.date_of_article ? new Date(form.date_of_article) : undefined}
                  onSelect={date => { handleChange('date_of_article', date ? date.toISOString().slice(0,10) : ''); setDatePickerOpen(false); }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Textarea placeholder="Description" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} />
          <Textarea placeholder="Comments" value={form.comments || ''} onChange={e => handleChange('comments', e.target.value)} />
          <Textarea placeholder="Context" value={form.context || ''} onChange={e => handleChange('context', e.target.value)} />

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Donation Information</h3>
            </div>
            {(form.donation_information || []).map((don, donIdx) => (
              <div key={donIdx} className="mb-4 grid grid-cols-1 gap-3 relative">
                <Input
                  placeholder="Donor Name"
                  value={don?.donor_name || donationQuery}
                  onChange={e => { handleDonationChange(donIdx, 'donor_name', e.target.value); setDonationQuery(e.target.value); setActiveDonIdx(donIdx); }}
                />
                {activeDonIdx === donIdx && donationResults.length > 0 && (
                  <div className="absolute z-50 bg-background border rounded mt-1 w-full max-h-48 overflow-auto shadow">
                    {donationResults.map(r => (
                      <div key={r.id} className="p-2 hover:bg-accent/10 cursor-pointer" onClick={() => applyDonationResult(donIdx, r)}>
                        <div className="font-medium">{r.donor_name}</div>
                        <div className="text-xs text-muted-foreground">{r.donor_email}</div>
                      </div>
                    ))}
                  </div>
                )}
                <Input placeholder="Donor Email" value={don?.donor_email || ''} onChange={e => handleDonationChange(donIdx, 'donor_email', e.target.value)} />
                <Input placeholder="Donor Phone" value={don?.donor_phone || ''} onChange={e => handleDonationChange(donIdx, 'donor_phone', e.target.value)} />
                <Input placeholder="Donor Address" value={don?.donor_address || ''} onChange={e => handleDonationChange(donIdx, 'donor_address', e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Popover open={donationDatePickerOpen?.idx === donIdx} onOpenChange={open => setDonationDatePickerOpen(open ? { idx: donIdx } : null)}>
                    <PopoverTrigger asChild>
                      <div className="w-full relative">
                        <Input
                          readOnly
                          value={don?.donation_date ? format(new Date(don.donation_date), 'yyyy-MM-dd') : ''}
                          onClick={() => setDonationDatePickerOpen({ idx: donIdx })}
                          className={don?.donation_date ? '' : 'text-muted-foreground'}
                        />
                        {!don?.donation_date && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Donation Date</span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-0">
                      <Calendar mode="single" selected={don?.donation_date ? new Date(don.donation_date) : undefined} onSelect={date => { handleDonationChange(donIdx, 'donation_date', date ? date.toISOString().slice(0,10) : ''); setDonationDatePickerOpen(null); }} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Input placeholder="Donation Notes" value={don?.donation_notes || ''} onChange={e => handleDonationChange(donIdx, 'donation_notes', e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Inventory Items</h3>
              <div className="grid grid-cols-2 gap-2 items-center">
                <button type="button" className="text-primary hover:bg-primary/10 rounded-full p-1 flex items-center justify-center" onClick={handleAddItem} title="Add Inventory Item"><Plus className="w-5 h-5" /></button>
                {(form.inventory_items.length || 0) > 0 && (
                  <button type="button" className="text-destructive hover:bg-destructive/10 rounded-full p-1 flex items-center justify-center" onClick={() => handleRemoveItem(form.inventory_items.length - 1)} title="Delete Last Inventory Item"><Trash2 className="w-5 h-5" /></button>
                )}
              </div>
            </div>
            {(form.inventory_items || []).map((item, itemIdx) => (
              <div key={itemIdx} className="mb-6 border p-4 rounded-lg relative bg-[hsl(var(--glass-bg)_/_0.2)] flex flex-col gap-4">
                <h5 className="font-semibold mb-4">Item {itemIdx + 1}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Physical Inventory Number" value={item.physical_inventory_number} onChange={e => handleItemChange(itemIdx, 'physical_inventory_number', e.target.value)} required />
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
                      <button type="button" className="text-primary hover:bg-primary/10 rounded-full p-1" onClick={() => handleAddImage(itemIdx)} title="Add Image"><Plus className="w-5 h-5" /></button>
                      {item.images.length > 1 && (<button type="button" className="text-destructive hover:bg-destructive/10 rounded-full p-1" onClick={() => handleRemoveImage(itemIdx, item.images.length - 1)} title="Delete Last Image"><Trash2 className="w-4 h-4" /></button>)}
                    </div>
                  </div>
                      {(item.images || []).map((img, imgIdx) => (
                    <div key={imgIdx} className="mb-4 border p-2 rounded relative bg-[hsl(var(--glass-bg)_/_0.1)] flex flex-col gap-4">
                      <h5 className="font-semibold mb-4">Image {imgIdx + 1}</h5>
                      {/* show preview of current image (either existing URL or newly selected file) */}
                      <PreviewImage img={img} onClick={(s) => setLightboxSrc(s)} />
                      <Input type="file" accept="image/*" capture="environment" onChange={e => { const file = e.target.files?.[0] || null; handleImageFileChange(itemIdx, imgIdx, file); }} />
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
          <Button className="w-full mt-2" variant="destructive" type="button" onClick={handleDeleteInventory} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Inventory'}</Button>
        </form>
      </Card>
      <ImageModal open={!!lightboxSrc} onOpenChange={(open) => { if (!open) setLightboxSrc(null); }} src={lightboxSrc || ''} />
    </div>
  );
}
