import { upsertBook } from "@/lib/erp/actions";
import { CoverField } from "@/components/erp/cover-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Book } from "@/types/erp";

type BookFormProps = {
  book: Book | null;
  showCost: boolean;
};

export function BookForm({ book, showCost }: BookFormProps) {
  const isEdit = Boolean(book);

  return (
    <form action={upsertBook} className="grid gap-4 sm:grid-cols-2">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={book?.title ?? ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          defaultValue={book?.subtitle ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={book?.slug ?? ""} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={book?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="isbn_13">ISBN-13</Label>
        <Input
          id="isbn_13"
          name="isbn_13"
          defaultValue={book?.isbn_13 ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          name="language"
          defaultValue={book?.language ?? "English"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Input
          id="format"
          name="format"
          defaultValue={book?.format ?? "paperback"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publisher_name">Publisher</Label>
        <Input
          id="publisher_name"
          name="publisher_name"
          defaultValue={book?.publisher_name ?? "DSB Publication"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price_btn">Price (BTN)</Label>
        <Input
          id="price_btn"
          name="price_btn"
          type="number"
          min="0"
          step="0.01"
          defaultValue={book?.price_btn ?? 0}
          required
        />
      </div>

      {showCost ? (
        <div className="space-y-2">
          <Label htmlFor="cost_price_btn">Cost price (BTN)</Label>
          <Input
            id="cost_price_btn"
            name="cost_price_btn"
            type="number"
            min="0"
            step="0.01"
            defaultValue={book?.cost_price_btn ?? 0}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="page_count">Page count</Label>
        <Input
          id="page_count"
          name="page_count"
          type="number"
          min="0"
          defaultValue={book?.page_count ?? ""}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <CoverField defaultValue={book?.cover_public_id} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          name="is_published"
          defaultChecked={book?.is_published ?? false}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="is_published">Published on storefront</Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          defaultChecked={book?.is_featured ?? false}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="is_featured">Featured</Label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
