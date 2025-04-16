import type React from "react"
export interface PageConfig {
  showHeader?: boolean
  headerTitle?: string
  showBottomNav?: boolean
  bottomNavConfig?: BottomNavConfig
  contentClassName?: string
}

export interface BottomNavConfig {
  position?: "fixed"
  showBackButton?: boolean
  currentPage?: "home" | "profile"
  className?: string
  showBottomNav?: boolean
}

export interface PageLayoutProps {
  children: React.ReactNode
  config: PageConfig
}

