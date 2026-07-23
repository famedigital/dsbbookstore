import { requireOwner } from "@/lib/erp/auth";
import { updateStoreSettings } from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StoreSettings } from "@/types/erp";

export default async function SettingsPage() {
  await requireOwner();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const store = (settings ?? {
    id: 1,
    store_name: "DSB Books",
    phone: null,
    email: null,
    opening_hours: null,
    address_line1: null,
    low_stock_default: 3,
    receipt_footer: null,
  }) as StoreSettings;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Store profile, contact details, and receipt configuration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store settings</CardTitle>
          <CardDescription>
            Changes apply across POS receipts and the storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStoreSettings} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="store_name">Store name</Label>
              <Input
                id="store_name"
                name="store_name"
                defaultValue={store.store_name}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address_line1">Address</Label>
              <Input
                id="address_line1"
                name="address_line1"
                defaultValue={store.address_line1 ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={store.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={store.email ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="opening_hours">Opening hours</Label>
              <Textarea
                id="opening_hours"
                name="opening_hours"
                rows={2}
                defaultValue={store.opening_hours ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low_stock_default">Default low-stock threshold</Label>
              <Input
                id="low_stock_default"
                name="low_stock_default"
                type="number"
                min="0"
                defaultValue={store.low_stock_default}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="receipt_footer">Receipt footer</Label>
              <Textarea
                id="receipt_footer"
                name="receipt_footer"
                rows={2}
                defaultValue={store.receipt_footer ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
