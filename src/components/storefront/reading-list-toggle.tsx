"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  isInReadingList,
  toggleReadingListItem,
  type ReadingListItem,
} from "@/lib/storefront/reading-list";
import { cn } from "@/lib/utils";

type Props = {
  book: Omit<ReadingListItem, "addedAt">;
  className?: string;
  compact?: boolean;
};

export function ReadingListToggle({ book, className, compact }: Props) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isInReadingList(book.id));
    function sync() {
      setOn(isInReadingList(book.id));
    }
    window.addEventListener("dsb-reading-list", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dsb-reading-list", sync);
      window.removeEventListener("storage", sync);
    };
  }, [book.id]);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from reading list" : "Save to reading list"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] text-[color:var(--sf-ink)] transition hover:border-[color:var(--sf-accent)] hover:text-[color:var(--sf-accent)]",
        compact ? "size-9" : "px-3 py-2 text-[0.7rem] font-semibold tracking-[0.1em] uppercase",
        className
      )}
      style={{ borderRadius: "var(--sf-btn-radius)" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleReadingListItem(book);
        setOn(isInReadingList(book.id));
      }}
    >
      {on ? (
        <BookmarkCheck className="size-4 text-[color:var(--sf-accent)]" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {compact ? null : on ? "Saved" : "Save"}
    </button>
  );
}
