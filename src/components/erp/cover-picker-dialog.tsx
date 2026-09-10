"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { BookCover } from "@/components/media/book-cover";
import { updateBookCover } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tab = "link" | "upload" | "library";

type CloudResource = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  initialCover?: string | null;
  isbn?: string | null;
  barcode?: string | null;
  onSaved?: (cover: string | null) => void;
};

export function CoverPickerDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  initialCover,
  isbn,
  barcode,
  onSaved,
}: Props) {
  const [tab, setTab] = useState<Tab>("link");
  const [value, setValue] = useState(initialCover ?? "");
  const [linkDraft, setLinkDraft] = useState(initialCover ?? "");
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [libraryQ, setLibraryQ] = useState("");
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setValue(initialCover ?? "");
    setLinkDraft(initialCover ?? "");
    setError(null);
    setTab("link");
  }, [open, initialCover]);

  const loadLibrary = useCallback(
    async (opts?: { cursor?: string | null; append?: boolean; q?: string }) => {
      setLoadingLibrary(true);
      setError(null);
      try {
        const sp = new URLSearchParams({ folder: "dsb/covers" });
        if (opts?.cursor) sp.set("cursor", opts.cursor);
        const q = opts?.q ?? libraryQ;
        if (q.trim()) sp.set("q", q.trim());
        const res = await fetch(`/api/cloudinary/list?${sp}`);
        const data = (await res.json()) as {
          resources?: CloudResource[];
          nextCursor?: string | null;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Could not list media");
        setResources((prev) =>
          opts?.append
            ? [...prev, ...(data.resources || [])]
            : data.resources || []
        );
        setNextCursor(data.nextCursor ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Library load failed");
      } finally {
        setLoadingLibrary(false);
      }
    },
    [libraryQ]
  );

  useEffect(() => {
    if (open && tab === "library") {
      void loadLibrary({ append: false });
    }
  }, [open, tab, loadLibrary]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "dsb/covers" }),
      });
      if (!signRes.ok) {
        const data = (await signRes.json()) as { error?: string };
        throw new Error(data.error || "Cloudinary signing failed");
      }
      const { apiKey, cloudName, timestamp, folder, signature } =
        await signRes.json();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const result = (await uploadRes.json()) as { public_id: string };
      setValue(result.public_id);
      setLinkDraft(result.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function importUrlToCloudinary() {
    const url = linkDraft.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError("Paste a full http(s) image URL to import.");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/cloudinary/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, folder: "dsb/covers" }),
      });
      const data = (await res.json()) as {
        publicId?: string;
        error?: string;
      };
      if (!res.ok || !data.publicId) {
        throw new Error(data.error || "Import failed");
      }
      setValue(data.publicId);
      setLinkDraft(data.publicId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function applyLink() {
    const next = linkDraft.trim();
    setValue(next);
    setError(null);
  }

  function save(cover: string | null) {
    startTransition(async () => {
      try {
        await updateBookCover(bookId, cover);
        onSaved?.(cover);
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "link", label: "Paste link" },
    { id: "upload", label: "Upload" },
    { id: "library", label: "Cloudinary" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Set cover photo</DialogTitle>
          <DialogDescription>
            {bookTitle} — paste a URL, upload a file, or pick from Cloudinary (
            <code>dsb/covers</code>).
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="relative h-28 w-[4.75rem] shrink-0 overflow-hidden rounded-md border bg-muted">
            <BookCover
              publicId={value || null}
              isbn={isbn}
              barcode={barcode}
              alt={bookTitle}
              width={120}
              height={180}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-muted-foreground text-xs break-all">
              {value || "No cover set"}
            </p>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setValue("");
                  setLinkDraft("");
                }}
              >
                Clear selection
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant={tab === t.id ? "default" : "outline"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {tab === "link" ? (
          <div className="space-y-2">
            <Label htmlFor="cover-link">Image URL or Cloudinary public_id</Label>
            <Input
              id="cover-link"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://… or dsb/covers/my-book"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={applyLink}>
                Use this link
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={importing}
                onClick={() => void importUrlToCloudinary()}
              >
                {importing ? "Importing…" : "Import URL → Cloudinary"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Direct links work on the storefront. Importing copies the file into
              your Cloudinary free tier so it stays available.
            </p>
          </div>
        ) : null}

        {tab === "upload" ? (
          <div className="space-y-2">
            <Label>Upload image file</Label>
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <label className="cursor-pointer">
                {uploading ? "Uploading…" : "Choose photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
            <p className="text-muted-foreground text-xs">
              Stored under <code>dsb/covers</code> on Cloudinary.
            </p>
          </div>
        ) : null}

        {tab === "library" ? (
          <div className="space-y-2">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void loadLibrary({ append: false });
              }}
            >
              <Input
                value={libraryQ}
                onChange={(e) => setLibraryQ(e.target.value)}
                placeholder="Search Cloudinary…"
              />
              <Button type="submit" size="sm" variant="outline" disabled={loadingLibrary}>
                Search
              </Button>
            </form>
            {loadingLibrary && resources.length === 0 ? (
              <p className="text-muted-foreground text-xs">Loading…</p>
            ) : resources.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No images in <code>dsb/covers</code> yet — upload one first.
              </p>
            ) : (
              <ul className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
                {resources.map((r) => (
                  <li key={r.publicId}>
                    <button
                      type="button"
                      title={r.publicId}
                      onClick={() => {
                        setValue(r.publicId);
                        setLinkDraft(r.publicId);
                      }}
                      className={cn(
                        "relative aspect-[2/3] w-full overflow-hidden rounded border",
                        value === r.publicId
                          ? "ring-2 ring-primary"
                          : "hover:ring-1 hover:ring-foreground/30"
                      )}
                    >
                      <Image
                        src={r.url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {nextCursor ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loadingLibrary}
                onClick={() =>
                  void loadLibrary({ cursor: nextCursor, append: true })
                }
              >
                Load more
              </Button>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-destructive text-xs">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => save(null)}
          >
            Remove cover
          </Button>
          <Button
            type="button"
            disabled={pending || !value.trim()}
            onClick={() => save(value.trim())}
          >
            {pending ? "Saving…" : "Save cover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
