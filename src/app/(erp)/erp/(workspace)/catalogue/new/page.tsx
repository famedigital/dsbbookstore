import Link from "next/link";
import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { BookForm } from "@/components/erp/book-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewBookPage() {
  const { profile } = await requireStaff();
  const showCost = canSeeCost(profile.role);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            New book
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a new catalogue entry.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/catalogue">Back to catalogue</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Book details</CardTitle>
          <CardDescription>Fill in the catalogue information</CardDescription>
        </CardHeader>
        <CardContent>
          <BookForm book={null} showCost={showCost} />
        </CardContent>
      </Card>
    </div>
  );
}
