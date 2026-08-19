"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Inbox, CalendarDays, Dog, Settings, Menu, X, LogOut, ExternalLink } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

const NAV_ITEMS = [
  { href: "/staff/inbox", label: "Inbox", icon: Inbox },
  { href: "/staff/availability", label: "Availability", icon: CalendarDays },
  { href: "/staff/dogs", label: "Dogs & Owners", icon: Dog },
  { href: "/staff/settings", label: "Settings", icon: Settings },
]

export function StaffNav({ orgSlug, orgName }: { orgSlug?: string; orgName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createSupabaseBrowserClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/staff/sign-in")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">KennelBook</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 bg-transparent",
                    isActive && "bg-accent text-accent-foreground font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 mb-2 bg-transparent text-muted-foreground"
          >
            <a
              href={orgSlug ? `/book/${orgSlug}` : "/book"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View booking page"
            >
              <ExternalLink className="h-4 w-4" />
              {orgName ? `View ${orgName}` : "View booking page"}
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 bg-transparent text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-20 lg:hidden border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">KennelBook</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-transparent"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="border-b border-border bg-card px-2 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 bg-transparent",
                      isActive && "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-border mt-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 mb-1 bg-transparent text-muted-foreground"
              >
                <a
                  href={orgSlug ? `/book/${orgSlug}` : "/book"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View booking page"
                >
                  <ExternalLink className="h-4 w-4" />
                  {orgName ? `View ${orgName}` : "View booking page"}
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 bg-transparent text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
