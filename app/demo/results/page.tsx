import type { Metadata } from "next"
import DemoResultsClientPage from "./DemoResultsClientPage"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DemoResultsPage() {
  return <DemoResultsClientPage />
}
