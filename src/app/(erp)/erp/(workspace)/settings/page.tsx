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
import {
  STOREFRONT_THEMES,
  resolveStorefrontTheme,
} from "@/lib/storefront/themes";

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
    storefront_theme: "uikit",
  }) as StoreSettings;

  const activeTheme = resolveStorefrontTheme(store.storefront_theme);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Store profile, storefront template, and receipt configuration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storefront template</CardTitle>
          <CardDescription>
            Switch Figma-inspired visual themes for the public website. Default
            is Books Store App &amp; Website UI Kit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStoreSettings} className="space-y-6">
            {/* Keep other fields in sync when saving theme alone — hidden duplicates filled below in main form; this form only saves theme + required name */}
            <input type="hidden" name="store_name" value={store.store_name} />
            <input type="hidden" name="phone" value={store.phone ?? ""} />
            <input type="hidden" name="email" value={store.email ?? ""} />
            <input
              type="hidden"
              name="opening_hours"
              value={store.opening_hours ?? ""}
            />
            <input
              type="hidden"
              name="address_line1"
              value={store.address_line1 ?? ""}
            />
            <input
              type="hidden"
              name="low_stock_default"
              value={String(store.low_stock_default ?? 3)}
            />
            <input
              type="hidden"
              name="receipt_footer"
              value={store.receipt_footer ?? ""}
            />
            <input
              type="hidden"
              name="bank_qr_image_url"
              value={store.bank_qr_image_url ?? ""}
            />
            <input
              type="hidden"
              name="public_tagline"
              value={store.public_tagline ?? ""}
            />
            <input
              type="hidden"
              name="visit_directions"
              value={store.visit_directions ?? ""}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {STOREFRONT_THEMES.filter((t) => t.id === "atelier").map(
                (theme) => (
                  <label
                    key={theme.id}
                    className={`cursor-pointer rounded-xl border p-4 transition hover:border-primary ${
                      activeTheme === theme.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="storefront_theme"
                        value={theme.id}
                        defaultChecked
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {theme.description} Production storefront uses this
                          look only.
                        </p>
                      </div>
                    </div>
                  </label>
                )
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Legacy UI kits (UI Kit / Booksaw / Booketic) are demoted —
              storefront always resolves to Chang Lam atelier.
            </p>
            <Button type="submit">Save template</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store settings</CardTitle>
          <CardDescription>
            Changes apply across POS receipts and the storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStoreSettings} className="grid gap-4 sm:grid-cols-2">
            <input
              type="hidden"
              name="storefront_theme"
              value={activeTheme}
            />
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="public_tagline">Public tagline</Label>
              <Textarea
                id="public_tagline"
                name="public_tagline"
                rows={2}
                defaultValue={store.public_tagline ?? ""}
                placeholder="Shown on Visit and storefront"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="visit_directions">Visit directions</Label>
              <Textarea
                id="visit_directions"
                name="visit_directions"
                rows={3}
                defaultValue={store.visit_directions ?? ""}
                placeholder="How to find the shop on Chang Lam"
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank_qr_image_url">Bhutan QR image URL</Label>
              <Input
                id="bank_qr_image_url"
                name="bank_qr_image_url"
                type="url"
                placeholder="https://…"
                defaultValue={store.bank_qr_image_url ?? ""}
              />
              <p className="text-muted-foreground text-xs">
                Shown on Counter when tendering with Bhutan QR.
              </p>
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
