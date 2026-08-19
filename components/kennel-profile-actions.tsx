"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { KennelOwnerModal } from "@/components/kennel-owner-modal"

export function KennelProfileActions({
  name,
  slug,
  location,
  isClaimed,
}: {
  name: string
  slug: string
  location: string
  isClaimed: boolean
}) {
  const [showClaimModal, setShowClaimModal] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Button asChild>
        <Link href={`/book/${slug}`}>Request a stay</Link>
      </Button>

      {!isClaimed && (
        <>
          <Button variant="outline" onClick={() => setShowClaimModal(true)}>
            Claim this listing
          </Button>
          <KennelOwnerModal
            open={showClaimModal}
            onOpenChange={setShowClaimModal}
            defaultKennelName={name}
            defaultLocation={location}
            slug={slug}
          />
        </>
      )}
    </div>
  )
}
