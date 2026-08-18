import type React from "react"
import { redirect } from "next/navigation"
import { StaffNav } from "@/components/staff-nav"
import { getStaffContext } from "@/lib/auth"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { kennel } = await getStaffContext().catch(() => {
    redirect("/staff/sign-in")
  })

  if (!kennel) {
    redirect("/staff/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <StaffNav kennelSlug={kennel.slug} kennelName={kennel.name} />
      <div className="lg:pl-64">{children}</div>
    </div>
  )
}
