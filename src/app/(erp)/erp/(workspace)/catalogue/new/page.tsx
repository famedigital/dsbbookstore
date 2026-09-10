import Link from "next/link";
import { requireStaff, canSeeCost } from "@/lib/erp/auth";
import { ProductAddWorkspace } from "@/components/erp/book-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProductPage() {
  const { profile } = await requireStaff();
  const showCost = canSeeCost(profile.role);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Add product
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Books, stationery, and other Counter stock — form, table, or Excel.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/erp/catalogue">Back to products</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New product</CardTitle>
          <CardDescription>
            Choose form, quick table, or CSV upload with template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductAddWorkspace showCost={showCost} />
        </CardContent>
      </Card>
    </div>
  );
}
