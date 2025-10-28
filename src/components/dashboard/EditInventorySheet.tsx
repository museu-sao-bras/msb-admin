import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { apiPut } from "@/lib/api";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { InventoryRecord } from "@/pages/Inventory";

interface Props {
    open: boolean;
    inventory: InventoryRecord | null;
    setInventory: (inv: InventoryRecord) => void;
    onClose: () => void;
    onSave?: () => void;
}

export const EditInventorySheet: React.FC<Props> = ({ open, inventory, setInventory, onClose, onSave }) => {
    if (!inventory) return null;
    const [donationDatePickerOpen, setDonationDatePickerOpen] = useState<number | null>(null);

    const handleDonationChange = (idx: number, field: string, value: string) => {
        const updated = [...(inventory.donation_information || [])];
        updated[idx] = { ...(updated[idx] || {}), [field]: value };
        setInventory({ ...inventory, donation_information: updated });
    };

    const addDonation = () => {
        const updated = [...(inventory.donation_information || []), { donor_name: "", donor_email: "", donor_phone: "", donor_address: "", donation_date: "", donation_notes: "" }];
        setInventory({ ...inventory, donation_information: updated });
    };

    const removeDonation = (idx: number) => {
        const updated = (inventory.donation_information || []).filter((_, i) => i !== idx);
        setInventory({ ...inventory, donation_information: updated });
    };
    return (
        <Sheet open={open} onOpenChange={open => !open && onClose()}>
            <SheetContent className="overflow-y-auto max-h-screen pr-2">
                <SheetHeader>
                    <h3 className="font-semibold">Inventory</h3>
                    <SheetTitle>
                        <Input
                            value={inventory.physical_inventory_number ?? ""}
                            onChange={e => setInventory({ ...inventory, physical_inventory_number: e.target.value })}
                            placeholder="Physical Inventory Number"
                        />
                    </SheetTitle>
                    <SheetDescription>
                        <Textarea
                            value={inventory.description ?? ""}
                            onChange={e => setInventory({ ...inventory, description: e.target.value })}
                            placeholder="Description"
                        />
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-2">
                    <Input
                        value={inventory.category ?? ""}
                        onChange={e => setInventory({ ...inventory, category: e.target.value })}
                        placeholder="Category"
                    />
                    <Input
                        value={inventory.date_of_article ?? ""}
                        onChange={e => setInventory({ ...inventory, date_of_article: e.target.value })}
                        placeholder="Date of Article"
                    />
                    <Textarea
                        value={inventory.comments ?? ""}
                        onChange={e => setInventory({ ...inventory, comments: e.target.value })}
                        placeholder="Comments"
                    />
                    <Textarea
                        value={inventory.context ?? ""}
                        onChange={e => setInventory({ ...inventory, context: e.target.value })}
                        placeholder="Context"
                    />
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Donation Information</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={addDonation}>Add</Button>
                                {inventory.donation_information && inventory.donation_information.length > 0 && (
                                    <Button variant="destructive" onClick={() => removeDonation(inventory.donation_information!.length - 1)}>Remove Last</Button>
                                )}
                            </div>
                        </div>
                        {(inventory.donation_information || []).map((don, donIdx) => (
                            <div key={donIdx} className="mb-3 grid grid-cols-1 gap-2">
                                <Input placeholder="Donor Name" value={don?.donor_name || ''} onChange={e => handleDonationChange(donIdx, 'donor_name', e.target.value)} />
                                <Input placeholder="Donor Email" value={don?.donor_email || ''} onChange={e => handleDonationChange(donIdx, 'donor_email', e.target.value)} />
                                <Input placeholder="Donor Phone" value={don?.donor_phone || ''} onChange={e => handleDonationChange(donIdx, 'donor_phone', e.target.value)} />
                                <Input placeholder="Donor Address" value={don?.donor_address || ''} onChange={e => handleDonationChange(donIdx, 'donor_address', e.target.value)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Popover open={donationDatePickerOpen === donIdx} onOpenChange={open => setDonationDatePickerOpen(open ? donIdx : null)}>
                                        <PopoverTrigger asChild>
                                            <div className="w-full relative">
                                                <Input
                                                    readOnly
                                                    value={don?.donation_date ? format(new Date(don.donation_date), 'yyyy-MM-dd') : ''}
                                                    onClick={() => setDonationDatePickerOpen(donIdx)}
                                                    className={don?.donation_date ? '' : 'text-muted-foreground'}
                                                />
                                                {!don?.donation_date && (
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">Donation Date</span>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={don?.donation_date ? new Date(don.donation_date) : undefined}
                                                onSelect={date => {
                                                    handleDonationChange(donIdx, 'donation_date', date ? date.toISOString().slice(0,10) : '');
                                                    setDonationDatePickerOpen(null);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input placeholder="Donation Notes" value={don?.donation_notes || ''} onChange={e => handleDonationChange(donIdx, 'donation_notes', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {inventory.inventory_items?.map((ii, itemIdx) => (
                        <div key={ii.id} className="border rounded p-2 my-2 flex flex-col gap-2">
                            <h5 className="font-semibold">Inventory Item {itemIdx + 1}</h5>
                            <div className="mt-1" />
                            <Input
                                value={ii.physical_inventory_number ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], physical_inventory_number: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Physical Inventory Number"
                            />
                            <Input
                                value={ii.state ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], state: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="State"
                            />
                            <Input
                                value={ii.location ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], location: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Location"
                            />
                            <Input
                                value={ii.loan_begin_datetime ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], loan_begin_datetime: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Loan Begin Datetime"
                            />
                            <Input
                                value={ii.loan_end_datetime ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], loan_end_datetime: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Loan End Datetime"
                            />
                            <Input
                                value={ii.cupboard_number ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], cupboard_number: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Cupboard Number"
                            />
                            <Input
                                value={ii.drawer_number ?? ""}
                                onChange={e => {
                                    const updated = [...inventory.inventory_items];
                                    updated[itemIdx] = { ...updated[itemIdx], drawer_number: e.target.value };
                                    setInventory({ ...inventory, inventory_items: updated });
                                }}
                                placeholder="Drawer Number"
                            />
                            <div className="mt-2">
                                <strong>Images:</strong>
                                <div className="flex gap-2 flex-wrap">
                                    {ii.images?.map((img, imgIdx) => (
                                        <div key={img.id} className="border rounded p-1 flex flex-col gap-1">
                                            <Input
                                                value={img.file_path ?? ""}
                                                onChange={e => {
                                                    const updatedItems = [...inventory.inventory_items];
                                                    const updatedImages = [...updatedItems[itemIdx].images];
                                                    updatedImages[imgIdx] = { ...updatedImages[imgIdx], file_path: e.target.value };
                                                    updatedItems[itemIdx] = { ...updatedItems[itemIdx], images: updatedImages };
                                                    setInventory({ ...inventory, inventory_items: updatedItems });
                                                }}
                                                placeholder="File Path"
                                            />
                                            <Input
                                                value={img.description ?? ""}
                                                onChange={e => {
                                                    const updatedItems = [...inventory.inventory_items];
                                                    const updatedImages = [...updatedItems[itemIdx].images];
                                                    updatedImages[imgIdx] = { ...updatedImages[imgIdx], description: e.target.value };
                                                    updatedItems[itemIdx] = { ...updatedItems[itemIdx], images: updatedImages };
                                                    setInventory({ ...inventory, inventory_items: updatedItems });
                                                }}
                                                placeholder="Description"
                                            />
                                            <Input
                                                value={img.date_taken ?? ""}
                                                onChange={e => {
                                                    const updatedItems = [...inventory.inventory_items];
                                                    const updatedImages = [...updatedItems[itemIdx].images];
                                                    updatedImages[imgIdx] = { ...updatedImages[imgIdx], date_taken: e.target.value };
                                                    updatedItems[itemIdx] = { ...updatedItems[itemIdx], images: updatedImages };
                                                    setInventory({ ...inventory, inventory_items: updatedItems });
                                                }}
                                                placeholder="Date Taken"
                                            />
                                            <Input
                                                value={img.photographer ?? ""}
                                                onChange={e => {
                                                    const updatedItems = [...inventory.inventory_items];
                                                    const updatedImages = [...updatedItems[itemIdx].images];
                                                    updatedImages[imgIdx] = { ...updatedImages[imgIdx], photographer: e.target.value };
                                                    updatedItems[itemIdx] = { ...updatedItems[itemIdx], images: updatedImages };
                                                    setInventory({ ...inventory, inventory_items: updatedItems });
                                                }}
                                                placeholder="Photographer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        className="mt-4"
                        onClick={async () => {
                            // Ensure donation entries carry inventory_id for the backend
                            const payload = {
                                ...inventory,
                                donation_information: (inventory.donation_information || []).map(d => ({ ...d, inventory_id: inventory.id })),
                            } as any;
                            await apiPut(`/inventory/${inventory.id}`, payload);
                            if (onSave) onSave();
                            onClose();
                        }}
                    >
                        Save
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}
