import type React from "react"
import { redirect } from "next/navigation"
import { StaffNav } from "@/components/staff-nav"
import { getStaffContext } from "@/lib/auth"

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { organisation } = await getStaffContext().catch(() => {
    redirect("/staff/sign-in")
  })

  if (!organisation) {
    redirect("/staff/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <StaffNav orgSlug={organisation.slug} orgName={organisation.name} />
      <div className="lg:pl-64">{children}</div>
    </div>
  )
}
