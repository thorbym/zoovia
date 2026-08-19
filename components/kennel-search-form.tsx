"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function KennelSearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/kennels" method="GET" className="flex gap-2">
      <Input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Postcode, town, or area"
        aria-label="Search by postcode or area"
        className="flex-1"
      />
      <Button type="submit">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  )
}
