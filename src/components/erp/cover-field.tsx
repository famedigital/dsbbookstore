"use client";

import { CoverUpload } from "@/components/media/cover-upload";
import { Label } from "@/components/ui/label";

type Props = {
  defaultValue?: string | null;
  showManualInput?: boolean;
};

export function CoverField({
  defaultValue,
  showManualInput = true,
}: Props) {
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
