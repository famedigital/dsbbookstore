"use client";

import { useState } from "react";
import { CoverPickerDialog } from "@/components/erp/cover-picker-dialog";
import { CoverUpload } from "@/components/media/cover-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type Props = {
  bookId?: string;
  bookTitle?: string;
  defaultValue?: string | null;
  isbn?: string | null;
  barcode?: string | null;
  showManualInput?: boolean;
};

/** Edit-form cover control — full picker when book already exists. */
export function CoverField({
  bookId,
  bookTitle = "Product",
  defaultValue,
  isbn,
  barcode,
  showManualInput = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const router = useRouter();

  if (!bookId) {
    return (
      <div className="space-y-3">
        <Label>Cover image</Label>
        <CoverUpload value={defaultValue} />
        {showManualInput ? (
          <p className="text-muted-foreground text-xs">
            Uploaded covers are stored under the <code>dsb/covers</code> folder.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Cover image</Label>
      <input type="hidden" name="cover_public_id" value={value} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          {value ? "Change / manage photo" : "Add photo"}
        </Button>
        {value ? (
          <span className="text-muted-foreground max-w-xs truncate text-xs">
            {value}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">No cover yet</span>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        Paste a link, upload to Cloudinary, or pick from the library.
      </p>
      <CoverPickerDialog
        open={open}
        onOpenChange={setOpen}
        bookId={bookId}
        bookTitle={bookTitle}
        initialCover={value || null}
        isbn={isbn}
        barcode={barcode}
        onSaved={(next) => {
          setValue(next ?? "");
          router.refresh();
        }}
      />
    </div>
  );
}
