import { redirect } from "next/navigation"
import { createClient, type User } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/clients"
import type { Database } from "@/lib/supabase/types"

export async function getStaffContext() {
  if (process.env.PLAYWRIGHT_MOCKS === "1") {
    // Bypass auth for Playwright smoke tests so staff pages render without live Supabase.
    return {
      supabase: null,
      user: { id: "test-user" },
      orgId: "test-org",
      organisation: { id: "test-org", name: "Green Meadows Kennels", slug: "green-meadows-kennels" },
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
    .from("user_profiles")
    .select("org_id, organisations!inner(id, name, slug)")
    .eq("id", user.id)
    .eq("type", "operator")
    .single()

  if (error || !profile || !profile.org_id) {
    redirect("/staff/sign-in")
  }

  return {
    supabase,
    user,
    orgId: profile.org_id,
    organisation: profile.organisations as unknown as { id: string; name: string; slug: string },
  }
}

// Accepts either a cookie-based staff session or a Bearer token (used by
// clients that hold a Supabase session outside of the server's cookie jar,
// e.g. the public booking form immediately after client-side sign up).
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization") ?? ""
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return null
    }
    return data.user
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ?? null
}
