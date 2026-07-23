import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/erp";
import { MANAGER_ROLES, STAFF_ROLES } from "@/types/erp";
import { redirect } from "next/navigation";

export async function getSessionProfile(): Promise<{
  userId: string;
  profile: Profile;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return { userId: user.id, profile: profile as Profile };
}

export async function requireStaff(roles: UserRole[] = STAFF_ROLES) {
  const session = await getSessionProfile();
  if (!session || !roles.includes(session.profile.role)) {
    redirect("/erp/login");
  }
  return session;
}

export async function requireManager() {
  return requireStaff(MANAGER_ROLES);
}

export async function requireOwner() {
  return requireStaff(["owner"]);
}

export function canSeeCost(role: UserRole) {
  return role === "owner" || role === "manager";
}

export function canManageStaff(role: UserRole) {
  return role === "owner";
}

export function canManageFinance(role: UserRole) {
  return role === "owner" || role === "manager";
}
