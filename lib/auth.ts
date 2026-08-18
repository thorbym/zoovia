import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/clients"

export async function getStaffContext() {
  if (process.env.PLAYWRIGHT_MOCKS === "1") {
    // Bypass auth for Playwright smoke tests so staff pages render without live Supabase.
    return {
      supabase: null,
      user: { id: "test-user" },
      kennelId: "test-kennel",
      kennel: { id: "test-kennel", name: "Green Meadows Kennels", slug: "green-meadows-kennels" },
      role: "owner",
    }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/staff/sign-in")
  }

  const { data: profile, error } = await supabase
    .from("staff_profiles")
    .select("kennel_id, role, kennels!inner(id, name, slug)")
    .eq("user_id", user.id)
    .single()

  if (error || !profile) {
    redirect("/staff/sign-in")
  }

  return {
    supabase,
    user,
    kennelId: profile.kennel_id,
    kennel: profile.kennels as { id: string; name: string; slug: string },
    role: profile.role,
  }
}
