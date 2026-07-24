"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  value?: string | null;
  onUploaded?: (publicId: string) => void;
  inputName?: string;
};

export function CoverUpload({
  value,
  onUploaded,
  inputName = "cover_public_id",
}: Props) {
  const [publicId, setPublicId] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      if (!signRes.ok) {
        setManualMode(true);
        setError("Cloudinary upload unavailable — paste a public_id below.");
        return;
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

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const result = await uploadRes.json();
      const id = result.public_id as string;
      setPublicId(id);
      onUploaded?.(id);
    } catch (err) {
      setManualMode(true);
      setError(
        err instanceof Error ? err.message : "Upload failed — use manual entry."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={inputName} value={publicId} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" disabled={uploading} asChild>
          <label className="cursor-pointer">
            {uploading ? "Uploading…" : "Upload cover"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        {publicId ? (
          <span className="text-muted-foreground max-w-xs truncate text-xs">
            {publicId}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      {manualMode || !publicId ? (
        <div className="space-y-1">
          <Label htmlFor={`${inputName}_manual`}>Cover public ID</Label>
          <Input
            id={`${inputName}_manual`}
            value={publicId}
            onChange={(e) => {
              setPublicId(e.target.value);
              onUploaded?.(e.target.value);
            }}
            placeholder="dsb/covers/my-book-cover"
          />
          {manualMode ? (
            <p className="text-muted-foreground text-xs">
              Paste a Cloudinary public_id manually if upload is not configured.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
