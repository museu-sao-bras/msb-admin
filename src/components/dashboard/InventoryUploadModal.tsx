import * as React from "react";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ImageInput {
    file_path: string;
    description?: string;
    date_taken?: string;
    photographer?: string;
}

interface ItemInput {
    physical_inventory_number: string;
    state?: string;
    location?: string;
    loan_begin_datetime?: string;
    loan_end_datetime?: string;
    cupboard_number?: string;
    drawer_number?: string;
    images: ImageInput[];
}

interface InventoryInput {
    physical_inventory_number: string;
    name?: string;
    category?: string;
    description?: string;
    date_of_article?: string;
    comments?: string;
    context?: string;
    inventory_items: ItemInput[];
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

export function InventoryUploadModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
    const [form, setForm] = useState<InventoryInput>({
        physical_inventory_number: "",
        name: "",
        category: "",
        description: "",
        date_of_article: "",
        comments: "",
        context: "",
        inventory_items: [
            {
                physical_inventory_number: "",
                state: "",
                location: "",
                loan_begin_datetime: "",
                loan_end_datetime: "",
                cupboard_number: "",
                drawer_number: "",
                images: [
                    {
                        file_path: "",
                        description: "",
                        date_taken: "",
                        photographer: "",
                    },
                ],
            },
        ],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [loanBeginPickerOpen, setLoanBeginPickerOpen] = useState<number | null>(null);
    const [loanEndPickerOpen, setLoanEndPickerOpen] = useState<number | null>(null);
    const [dateTakenPickerOpen, setDateTakenPickerOpen] = useState<{ itemIdx: number; imgIdx: number } | null>(null);

    const handleChange = (field: keyof InventoryInput, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItem = () => {
        setForm((prev) => ({
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
                    images: [
                        {
                            file_path: "",
                            description: "",
                            date_taken: "",
                            photographer: "",
                        },
                    ],
                },
            ],
        }));
    };

    const handleRemoveItem = (idx: number) => {
        setForm((prev) => ({
            ...prev,
            inventory_items: prev.inventory_items.filter((_, i) => i !== idx),
        }));
    };

    const handleItemChange = (idx: number, field: keyof ItemInput, value: string) => {
        setForm((prev) => ({
            ...prev,
            inventory_items: prev.inventory_items.map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
            ),
        }));
    };

    const handleAddImage = (itemIdx: number) => {
        setForm((prev) => ({
            ...prev,
            inventory_items: prev.inventory_items.map((item, i) =>
                i === itemIdx
                    ? {
                        ...item,
                        images: [
                            ...item.images,
                            { file_path: "", description: "", date_taken: "", photographer: "" },
                        ],
                    }
                    : item
            ),
        }));
    };

    const handleRemoveImage = (itemIdx: number, imgIdx: number) => {
        setForm((prev) => ({
            ...prev,
            inventory_items: prev.inventory_items.map((item, i) =>
                i === itemIdx
                    ? { ...item, images: item.images.filter((_, j) => j !== imgIdx) }
                    : item
            ),
        }));
    };

    const handleImageChange = (itemIdx: number, imgIdx: number, field: keyof ImageInput, value: string) => {
        setForm((prev) => ({
            ...prev,
            inventory_items: prev.inventory_items.map((item, i) =>
                i === itemIdx
                    ? {
                        ...item,
                        images: item.images.map((img, j) =>
                            j === imgIdx ? { ...img, [field]: value } : img
                        ),
                    }
                    : item
            ),
        }));
    };

    const handleImageFileChange = async (itemIdx: number, imgIdx: number, file: File | null) => {
        if (!file) return;
        // You may want to POST to an upload endpoint here, for now just set file name
        // Replace with your actual upload logic
        const filePath = file.name;
        handleImageChange(itemIdx, imgIdx, "file_path", filePath);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Clean up empty strings to null or remove
            const clean = (obj: any) => {
                if (Array.isArray(obj)) return obj.map(clean);
                if (obj && typeof obj === "object") {
                    const out: any = {};
                    for (const k in obj) {
                        if (obj[k] === "") continue;
                        out[k] = clean(obj[k]);
                    }
                    return out;
                }
                return obj;
            };
            await apiPost("/inventory", clean(form));
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError("Failed to upload inventory");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="bg-background p-8 rounded-lg w-full max-w-2xl max-h-[90vh] shadow-lg relative overflow-y-auto">
                <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">Upload Inventory</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Physical Inventory Number"
                            value={form.physical_inventory_number}
                            onChange={e => handleChange("physical_inventory_number", e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Category"
                            value={form.category || ""}
                            onChange={e => handleChange("category", e.target.value)}
                        />
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <div className="w-full relative">
                                    <Input
                                        readOnly
                                        value={form.date_of_article ? format(new Date(form.date_of_article), "yyyy-MM-dd") : ""}
                                        onClick={() => setDatePickerOpen(true)}
                                        className={form.date_of_article ? "" : "text-muted-foreground"}
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
                                    onSelect={date => {
                                        handleChange("date_of_article", date ? date.toISOString().slice(0, 10) : "");
                                        setDatePickerOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Textarea
                        placeholder="Description"
                        value={form.description || ""}
                        onChange={e => handleChange("description", e.target.value)}
                    />
                    <Textarea
                        placeholder="Comments"
                        value={form.comments || ""}
                        onChange={e => handleChange("comments", e.target.value)}
                    />
                    <Textarea
                        placeholder="Context"
                        value={form.context || ""}
                        onChange={e => handleChange("context", e.target.value)}
                    />
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Inventory Items</h3>
                            <div className="grid grid-cols-2 gap-2 items-center">
                                <button
                                    type="button"
                                    className="text-primary hover:bg-primary/10 rounded-full p-1 flex items-center justify-center"
                                    onClick={handleAddItem}
                                    title="Add Inventory Item"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                {form.inventory_items.length > 0 && (
                                    <button
                                        type="button"
                                        className="text-destructive hover:bg-destructive/10 rounded-full p-1 flex items-center justify-center"
                                        onClick={() => handleRemoveItem(form.inventory_items.length - 1)}
                                        title="Delete Last Inventory Item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {form.inventory_items.map((item, itemIdx) => (
                            <div key={itemIdx} className="mb-6 border p-4 rounded-lg relative bg-[hsl(var(--glass-bg)_/_0.2)] flex flex-col gap-4">
                                <h5 className="font-semibold mb-4">Item {itemIdx + 1}</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        placeholder="Physical Inventory Number"
                                        value={item.physical_inventory_number}
                                        onChange={e => handleItemChange(itemIdx, "physical_inventory_number", e.target.value)}
                                        required
                                    />
                                    <Select
                                        value={item.state || ""}
                                        onValueChange={value => handleItemChange(itemIdx, "state", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            {item.state ? item.state : <span className="text-muted-foreground">Choose State</span>}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={item.location || ""}
                                        onValueChange={value => handleItemChange(itemIdx, "location", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            {item.location ? item.location : <span className="text-muted-foreground">Choose Location</span>}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOCATION_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {item.location === "On loan" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Popover open={loanBeginPickerOpen === itemIdx} onOpenChange={open => setLoanBeginPickerOpen(open ? itemIdx : null)}>
                                            <PopoverTrigger asChild>
                                                <div className="w-full relative">
                                                    <Input
                                                        readOnly
                                                        value={item.loan_begin_datetime ? format(new Date(item.loan_begin_datetime), "yyyy-MM-dd") : ""}
                                                        onClick={() => setLoanBeginPickerOpen(itemIdx)}
                                                        className={item.loan_begin_datetime ? "" : "text-muted-foreground"}
                                                    />
                                                    {!item.loan_begin_datetime && (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Loan Begin Date</span>
                                                    )}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={item.loan_begin_datetime ? new Date(item.loan_begin_datetime) : undefined}
                                                    onSelect={date => {
                                                        handleItemChange(itemIdx, "loan_begin_datetime", date ? date.toISOString().slice(0, 10) : "");
                                                        setLoanBeginPickerOpen(null);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Popover open={loanEndPickerOpen === itemIdx} onOpenChange={open => setLoanEndPickerOpen(open ? itemIdx : null)}>
                                            <PopoverTrigger asChild>
                                                <div className="w-full relative">
                                                    <Input
                                                        readOnly
                                                        value={item.loan_end_datetime ? format(new Date(item.loan_end_datetime), "yyyy-MM-dd") : ""}
                                                        onClick={() => setLoanEndPickerOpen(itemIdx)}
                                                        className={item.loan_end_datetime ? "" : "text-muted-foreground"}
                                                    />
                                                    {!item.loan_end_datetime && (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Loan End Date</span>
                                                    )}
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent align="end" className="p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={item.loan_end_datetime ? new Date(item.loan_end_datetime) : undefined}
                                                    onSelect={date => {
                                                        handleItemChange(itemIdx, "loan_end_datetime", date ? date.toISOString().slice(0, 10) : "");
                                                        setLoanEndPickerOpen(null);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                                {item.location === "In storage" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Cupboard Number"
                                            value={item.cupboard_number || ""}
                                            onChange={e => handleItemChange(itemIdx, "cupboard_number", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Drawer Number"
                                            value={item.drawer_number || ""}
                                            onChange={e => handleItemChange(itemIdx, "drawer_number", e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="border-t pt-4 mt-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">Images</h4>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                type="button"
                                                className="text-primary hover:bg-primary/10 rounded-full p-1"
                                                onClick={() => handleAddImage(itemIdx)}
                                                title="Add Image"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                            {item.images.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="text-destructive hover:bg-destructive/10 rounded-full p-1"
                                                    onClick={() => handleRemoveImage(itemIdx, item.images.length - 1)}
                                                    title="Delete Last Image"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {item.images.map((img, imgIdx) => (
                                        <div key={imgIdx} className="mb-4 border p-2 rounded relative bg-[hsl(var(--glass-bg)_/_0.1)] flex flex-col gap-4">
                                            <h5 className="font-semibold mb-4">Image {imgIdx + 1}</h5>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0] || null;
                                                    handleImageFileChange(itemIdx, imgIdx, file);
                                                }}
                                            />
                                            <Input placeholder="Description" value={img.description || ""} onChange={e => handleImageChange(itemIdx, imgIdx, "description", e.target.value)} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Popover open={dateTakenPickerOpen?.itemIdx === itemIdx && dateTakenPickerOpen?.imgIdx === imgIdx} onOpenChange={open => setDateTakenPickerOpen(open ? { itemIdx, imgIdx } : null)}>
                                                    <PopoverTrigger asChild>
                                                        <div className="w-full relative">
                                                            <Input
                                                                readOnly
                                                                value={img.date_taken ? format(new Date(img.date_taken), "yyyy-MM-dd") : ""}
                                                                onClick={() => setDateTakenPickerOpen({ itemIdx, imgIdx })}
                                                                className={img.date_taken ? "" : "text-muted-foreground"}
                                                            />
                                                            {!img.date_taken && (
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Date Taken</span>
                                                            )}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={img.date_taken ? new Date(img.date_taken) : undefined}
                                                            onSelect={date => {
                                                                handleImageChange(itemIdx, imgIdx, "date_taken", date ? date.toISOString().slice(0, 10) : "");
                                                                setDateTakenPickerOpen(null);
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Input
                                                    placeholder="Photographer"
                                                    value={img.photographer || ""}
                                                    onChange={e => handleImageChange(itemIdx, imgIdx, "photographer", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {error && <div className="text-destructive text-sm">{error}</div>}
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
