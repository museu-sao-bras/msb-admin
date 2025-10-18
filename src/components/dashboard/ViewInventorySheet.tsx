import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import React from "react";

import type { InventoryRecord } from "@/pages/Inventory";

interface Props {
    open: boolean;
    item: InventoryRecord | null;
    onClose: () => void;
}

export const ViewInventorySheet: React.FC<Props> = ({ open, item, onClose }) => {
    if (!item) return null;
    return (
        <Sheet open={open} onOpenChange={open => !open && onClose()}>
            <SheetContent className="overflow-y-auto max-h-screen pr-2">
                <SheetHeader>
                    <SheetTitle>{item.name ?? "Inventory Item"}</SheetTitle>
                    <SheetDescription>{item.description}</SheetDescription>
                </SheetHeader>
                <div className="space-y-2">
                    <div><strong>Physical Inventory Number:</strong> {item.physical_inventory_number}</div>
                    <div><strong>Category:</strong> {item.category}</div>
                    <div><strong>Date of Article:</strong> {item.date_of_article}</div>
                    <div><strong>Comments:</strong> {item.comments}</div>
                    <div><strong>Context:</strong> {item.context}</div>
                    <div><strong>Created At:</strong> {item.created_at}</div>
                    <div><strong>Updated At:</strong> {item.updated_at}</div>
                    <div className="mt-4">
                        <strong>Inventory Items:</strong>
                        {item.inventory_items?.map(ii => (
                            <div key={ii.id} className="border rounded p-2 my-2">
                                <div><strong>Physical Inventory Number:</strong> {ii.physical_inventory_number}</div>
                                <div><strong>State:</strong> {ii.state}</div>
                                <div><strong>Location:</strong> {ii.location}</div>
                                <div><strong>Loan Begin:</strong> {ii.loan_begin_datetime}</div>
                                <div><strong>Loan End:</strong> {ii.loan_end_datetime}</div>
                                <div><strong>Cupboard Number:</strong> {ii.cupboard_number}</div>
                                <div><strong>Drawer Number:</strong> {ii.drawer_number}</div>
                                <div className="mt-2">
                                    <strong>Images:</strong>
                                    <div className="flex gap-2 flex-wrap">
                                        {ii.images?.map(img => (
                                            <div key={img.id} className="border rounded p-1">
                                                <img
                                                    src={`${API_BASE_URL}/images/${img.file_path}`}
                                                    alt={img.description ?? "Image"} className="w-20 h-20 object-cover rounded mb-1" />
                                                <div><strong>Description:</strong> {img.description}</div>
                                                <div><strong>Date Taken:</strong> {img.date_taken}</div>
                                                <div><strong>Photographer:</strong> {img.photographer}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <strong>Donation Information:</strong>
                        <pre className="bg-muted p-2 rounded text-xs">{JSON.stringify(item.donation_information, null, 2)}</pre>
                    </div>
                </div>
                <SheetClose asChild>
                    <Button onClick={onClose}>Close</Button>
                </SheetClose>
            </SheetContent>
        </Sheet>
    );
}
