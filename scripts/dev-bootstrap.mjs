/**
 * Local dev bootstrap for a fresh Supabase instance (`npx supabase start`).
 * Creates the public `media` storage bucket, an owner auth user, and its
 * `profiles` row (role = owner). Idempotent — safe to re-run.
 *
 * Usage: node --env-file=.env.local scripts/dev-bootstrap.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = process.env.SEED_OWNER_EMAIL || "dsb.owner@gmail.com";
const ownerPassword = process.env.SEED_OWNER_PASSWORD || "DsbOwner2026!";

if (!url || !service) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Public media bucket (idempotent)
const { data: buckets } = await admin.storage.listBuckets();
if (!buckets?.some((b) => b.name === "media")) {
  const { error } = await admin.storage.createBucket("media", { public: true });
  if (error) throw error;
  console.log("created bucket: media");
} else {
  console.log("bucket exists: media");
}

// 2. Owner auth user (idempotent). The handle_new_user() trigger reads
//    user_metadata.role, so the profile is created as owner automatically.
const { data: list } = await admin.auth.admin.listUsers();
let user = list?.users?.find((u) => u.email === ownerEmail);
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { full_name: "DSB Owner", role: "owner" },
  });
  if (error) throw error;
  user = data.user;
  console.log("created owner user:", user.email);
} else {
  console.log("owner user exists:", user.email);
}

// 3. Ensure profile is owner + active (idempotent)
const { error: pErr } = await admin
  .from("profiles")
  .upsert(
    {
      id: user.id,
      email: ownerEmail,
      full_name: "DSB Owner",
      role: "owner",
      is_active: true,
    },
    { onConflict: "id" }
  );
if (pErr) throw pErr;
console.log("owner profile ready:", user.id);
