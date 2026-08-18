import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServiceRoleSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/clients"
import type { Database } from "@/lib/supabase/types"

function requireEnv(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") ?? ""
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? requireEnv("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
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

export async function POST(request: Request) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceRole = createServiceRoleSupabaseClient()
  const { data: existingProfile, error: existingError } = await serviceRole
    .from("staff_profiles")
    .select("user_id, kennel_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: "Could not verify staff profile" }, { status: 400 })
  }

  if (existingProfile) {
    return NextResponse.json({ status: "ok" })
  }

  if (!user.email) {
    return NextResponse.json({ error: "Missing account email" }, { status: 400 })
  }

  const email = user.email.trim()
  if (!email) {
    return NextResponse.json({ error: "Missing account email" }, { status: 400 })
  }

  const { data: kennels, error: kennelError } = await serviceRole
    .from("kennels")
    .select("id")
    .ilike("contact_email", email)

  if (kennelError) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 400 })
  }

  if (!kennels || kennels.length !== 1) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 409 })
  }

  const { error: linkError } = await serviceRole.from("staff_profiles").insert({
    user_id: user.id,
    kennel_id: kennels[0].id,
    role: "owner",
  })

  if (linkError) {
    return NextResponse.json({ error: "Could not link account to kennel" }, { status: 400 })
  }

  return NextResponse.json({ status: "ok" })
}
