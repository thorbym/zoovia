import type { Metadata } from "next"
import DemoPageClient from "./DemoPageClient"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DemoPage() {
  return <DemoPageClient />
}
