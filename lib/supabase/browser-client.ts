import { createBrowserClient } from "@supabase/ssr"
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

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    requireEnv("NEXT_PUBLIC_SUPABASE_URL")
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
}
