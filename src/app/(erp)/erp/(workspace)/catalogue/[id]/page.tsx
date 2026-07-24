import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import {
  setBookAuthors,
  setBookCategories,
  unpublishBook,
} from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/erp/book-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Author, Book, Category } from "@/types/erp";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: PageProps) {
  const { id } = await params;
  const { profile } = await requireStaff();
  const showCost = canSeeCost(profile.role);
  const supabase = await createClient();

  const [
    { data: book },
    { data: authors },
    { data: categories },
    { data: bookAuthors },
    { data: bookCategories },
  ] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    supabase.from("authors").select("*").order("name"),
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("book_authors").select("author_id").eq("book_id", id),
    supabase.from("book_categories").select("category_id").eq("book_id", id),
  ]);

  if (!book) notFound();

  const bookData = book as Book;
  const authorList = (authors ?? []) as Author[];
  const categoryList = (categories ?? []) as Category[];
  const selectedAuthorIds = new Set(
    (bookAuthors ?? []).map((row) => row.author_id as string)
  );
  const selectedCategoryIds = new Set(
    (bookCategories ?? []).map((row) => row.category_id as string)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Edit book
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{bookData.title}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/catalogue">Back to catalogue</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Book details</CardTitle>
          <CardDescription>
            Stock on hand: {bookData.stock_qty} units (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookForm book={bookData} showCost={showCost} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authors</CardTitle>
          <CardDescription>Assign authors to this title</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={setBookAuthors} className="space-y-4">
            <input type="hidden" name="book_id" value={bookData.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              {authorList.length === 0 ? (
                <p className="text-muted-foreground text-sm sm:col-span-2">
                  No authors yet.{" "}
                  <Link href="/erp/authors" className="underline">
                    Add authors
                  </Link>
                </p>
              ) : (
                authorList.map((author) => (
                  <div key={author.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`author-${author.id}`}
                      name="author_ids"
                      value={author.id}
                      defaultChecked={selectedAuthorIds.has(author.id)}
                      className="size-4 rounded border border-input"
                    />
                    <Label
                      htmlFor={`author-${author.id}`}
                      className="font-normal"
                    >
                      {author.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
            {authorList.length > 0 ? (
              <Button type="submit" variant="outline">
                Save authors
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
          <CardDescription>Assign categories to this title</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={setBookCategories} className="space-y-4">
            <input type="hidden" name="book_id" value={bookData.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              {categoryList.length === 0 ? (
                <p className="text-muted-foreground text-sm sm:col-span-2">
                  No categories yet.{" "}
                  <Link href="/erp/categories" className="underline">
                    Add categories
                  </Link>
                </p>
              ) : (
                categoryList.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      name="category_ids"
                      value={category.id}
                      defaultChecked={selectedCategoryIds.has(category.id)}
                      className="size-4 rounded border border-input"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
            {categoryList.length > 0 ? (
              <Button type="submit" variant="outline">
                Save categories
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {bookData.is_published ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unpublish</CardTitle>
            <CardDescription>
              Remove this book from the public storefront
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={unpublishBook}>
              <input type="hidden" name="id" value={bookData.id} />
              <Button type="submit" variant="destructive">
                Unpublish book
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
