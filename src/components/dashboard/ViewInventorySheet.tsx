import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import React from "react";
import { format } from "date-fns";

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
                                                    src={img.file_path}
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
                        {(item.donation_information && item.donation_information.length > 0) ? (
                            <div className="space-y-2 mt-2">
                                {item.donation_information.map((d, idx) => (
                                    <div key={idx} className="border rounded p-2">
                                        <div><strong>Donor Name:</strong> {d.donor_name ?? '—'}</div>
                                        <div><strong>Email:</strong> {d.donor_email ?? '—'}</div>
                                        <div><strong>Phone:</strong> {d.donor_phone ?? '—'}</div>
                                        <div><strong>Address:</strong> {d.donor_address ?? '—'}</div>
                                        <div><strong>Donation Date:</strong> {d.donation_date ? format(new Date(d.donation_date), 'yyyy-MM-dd') : '—'}</div>
                                        <div><strong>Notes:</strong> {d.donation_notes ?? '—'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">No donation information</div>
                        )}
                    </div>
                </div>
                <SheetClose asChild>
                    <Button onClick={onClose}>Close</Button>
                </SheetClose>
            </SheetContent>
        </Sheet>
    );
}
