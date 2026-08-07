import { requireOwner } from "@/lib/erp/auth";
import {
  updateStoreSettings,
  updateShippingZone,
} from "@/lib/erp/actions";
import { createClient } from "@/lib/supabase/server";
import { formatBtn } from "@/lib/erp/format";
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
import type { ShippingZone, StoreSettings } from "@/types/erp";

export default async function SettingsPage() {
  await requireOwner();
  const supabase = await createClient();

  const [{ data: settings }, { data: zones }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).single(),
    supabase
      .from("shipping_zones")
      .select("*")
      .order("sort_order"),
  ]);

  const store = (settings ?? {
    id: 1,
    store_name: "DSB Books",
    phone: null,
    email: null,
    opening_hours: null,
    address_line1: null,
    low_stock_default: 3,
    receipt_footer: null,
    online_checkout_enabled: false,
    btn_per_usd: 84,
    stripe_enabled: false,
  }) as StoreSettings;

  const shippingZones = (zones ?? []) as ShippingZone[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Store profile, commerce toggles, and shipping zones.
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

            <div className="sm:col-span-2 border-t border-border/60 pt-4">
              <p className="mb-3 text-sm font-medium">Online commerce</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="online_checkout_enabled"
                    defaultChecked={Boolean(store.online_checkout_enabled)}
                    className="size-4 rounded border"
                  />
                  Enable online checkout
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="stripe_enabled"
                    defaultChecked={Boolean(store.stripe_enabled)}
                    className="size-4 rounded border"
                  />
                  Enable Stripe card payments
                </label>
                <div className="space-y-2">
                  <Label htmlFor="btn_per_usd">BTN per USD (FX)</Label>
                  <Input
                    id="btn_per_usd"
                    name="btn_per_usd"
                    type="number"
                    step="0.0001"
                    min="1"
                    defaultValue={store.btn_per_usd ?? 84}
                  />
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                Stripe API keys live in environment variables, not in this form.
              </p>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping zones</CardTitle>
          <CardDescription>
            Fees shown at checkout ({shippingZones.length} zone(s))
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {shippingZones.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No shipping zones yet. Run the cms_commerce migration to seed
              pickup, Bhutan, and international zones.
            </p>
          ) : (
            shippingZones.map((zone) => (
              <form
                key={zone.id}
                action={updateShippingZone}
                className="grid gap-3 rounded-lg border border-border/70 p-4 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={zone.id} />
                <div className="space-y-1 sm:col-span-2">
                  <p className="font-medium">
                    {zone.label}{" "}
                    <span className="text-muted-foreground font-mono text-xs">
                      ({zone.code})
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Current fee {formatBtn(zone.fee_btn)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`label-${zone.id}`}>Label</Label>
                  <Input
                    id={`label-${zone.id}`}
                    name="label"
                    defaultValue={zone.label}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`fee-${zone.id}`}>Fee (BTN)</Label>
                  <Input
                    id={`fee-${zone.id}`}
                    name="fee_btn"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={zone.fee_btn}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor={`notes-${zone.id}`}>Notes</Label>
                  <Textarea
                    id={`notes-${zone.id}`}
                    name="notes_md"
                    rows={2}
                    defaultValue={zone.notes_md ?? ""}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={zone.is_active}
                    className="size-4 rounded border"
                  />
                  Active
                </label>
                <div className="flex items-end justify-end">
                  <Button type="submit" size="sm" variant="outline">
                    Save zone
                  </Button>
                </div>
              </form>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
