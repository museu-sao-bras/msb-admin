import * as React from "react";
import { Dialog, DialogContent } from "./dialog";

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
}

export function ImageModal({ open, onOpenChange, src, alt }: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeButtonClassName="text-orange-500 hover:text-orange-600" className="max-w-3xl w-full p-0 bg-transparent border-none shadow-none flex items-center justify-center">
        <img
          src={src}
          alt={alt || "Image"}
          className="max-h-[90vh] max-w-full rounded-lg shadow-lg object-contain"
          style={{ background: "#fff" }}
        />
      </DialogContent>
    </Dialog>
  );
}
