import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { CookieOptions } from "@supabase/ssr"
import type { Database } from "./types"

function requireEnv(key: string) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    requireEnv("NEXT_PUBLIC_SUPABASE_URL")
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}

export function createServiceRoleSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Service role client must not be created in the browser")
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    requireEnv("NEXT_PUBLIC_SUPABASE_URL")
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
