import type React from "react"
// This layout removes the bottom navigation for this specific page
export default function NumberFoundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

