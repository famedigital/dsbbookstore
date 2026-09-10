"use client";

import { useState } from "react";
import { BookCover } from "@/components/media/book-cover";
import { CoverPickerDialog } from "@/components/erp/cover-picker-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  bookId: string;
  title: string;
  coverPublicId?: string | null;
  isbn?: string | null;
  barcode?: string | null;
};

export function CatalogueCoverCell({
  bookId,
  title,
  coverPublicId,
  isbn,
  barcode,
}: Props) {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState(coverPublicId ?? null);
  const router = useRouter();
  const missing = !cover || cover.endsWith(".svg");

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-12 w-8 shrink-0 overflow-hidden rounded border bg-muted"
          title={missing ? "Add cover" : "Change cover"}
        >
          <BookCover
            publicId={cover}
            isbn={isbn}
            barcode={barcode}
            alt=""
            width={48}
            height={72}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </button>
        <Button
          type="button"
          size="sm"
          variant={missing ? "default" : "outline"}
          className="h-7 px-2 text-[0.65rem]"
          onClick={() => setOpen(true)}
        >
          {missing ? "Add photo" : "Photo"}
        </Button>
      </div>
      <CoverPickerDialog
        open={open}
        onOpenChange={setOpen}
        bookId={bookId}
        bookTitle={title}
        initialCover={cover}
        isbn={isbn}
        barcode={barcode}
        onSaved={(next) => {
          setCover(next);
          router.refresh();
        }}
      />
    </>
  );
}
