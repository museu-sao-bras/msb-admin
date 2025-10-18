import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { apiPut } from "@/lib/api";
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
    return (
        <Sheet open={open} onOpenChange={open => !open && onClose()}>
            <SheetContent className="overflow-y-auto max-h-screen pr-2">
                <SheetHeader>
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
                    {inventory.inventory_items?.map((ii, itemIdx) => (
                        <div key={ii.id} className="border rounded p-2 my-2 flex flex-col gap-2">
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
                            await apiPut(`/inventory/${inventory.id}`, inventory);
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
