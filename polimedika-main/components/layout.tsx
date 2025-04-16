"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BottomNav } from "./bottom-nav"
import { HeaderLogo } from "./header-logo"
import { cn } from "@/lib/utils"
import { BOTTOM_NAV } from "@/constants/theme"

interface LayoutProps {
  children?: React.ReactNode
  showBackButton?: boolean
  currentPage?: "home" | "profile"
  config?: {
    showHeader?: boolean
    headerTitle?: string
    showBottomNav?: boolean
    bottomNavConfig?: {
      position?: "fixed"
      showBackButton?: boolean
      currentPage?: "home" | "profile"
      className?: string
    }
    contentClassName?: string
  }
  // Если true, то компонент будет работать как ClientLayout
  isRootLayout?: boolean
}

export default function Layout({
  children,
  showBackButton = true,
  currentPage = "home",
  config,
  isRootLayout = false,
}: LayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Если это корневой layout, используем логику из ClientLayout
  if (isRootLayout) {
    // Проверяем, находимся ли мы на специальных страницах
    const isSpecialPage = pathname === "/number-not-found" || pathname === "/number-found"
    const isAuthPage = pathname === "/auth"
    const currentPageValue = pathname === "/profile" ? "profile" : pathname === "/home" ? "home" : ""
    const showBackButtonValue = pathname !== "/home"

    // Для специальных страниц не используем навигацию
    if (isSpecialPage || isAuthPage) {
      return (
        <div className="relative min-h-screen max-w-md mx-auto bg-white">
          {/* Шапка с логотипом только для страницы авторизации */}
          {isAuthPage && <HeaderLogo />}
          {children}
        </div>
      )
    }

    // Для всех остальных страниц используем индивидуальную компоновку
    return <>{children}</>
  }

  // Если передан config, используем его параметры
  const { showHeader = true, headerTitle, showBottomNav = true, bottomNavConfig, contentClassName } = config || {}

  // Объединяем параметры из config и прямых props
  const finalShowBackButton = bottomNavConfig?.showBackButton ?? showBackButton
  
  // Всегда используем только fixed позиционирование
  const navConfig = {
    ...bottomNavConfig,
    position: 'fixed',  // Переопределяем всегда на fixed
    className: `${bottomNavConfig?.className || ''} bottom-nav-fixed`
  };

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white">
      {/* Шапка с логотипом */}
      {showHeader && (
        <>
          <HeaderLogo />
          {headerTitle && (
            <h1 className="px-4 sm:px-6 pt-4 text-xl sm:text-2xl font-semibold text-txt-primary">{headerTitle}</h1>
          )}
        </>
      )}

      {/* Основной контент */}
      <div className="content-container overflow-y-auto h-[calc(100vh-87px)]">
        <main className={cn("min-h-[calc(100vh-200px)] pb-[87px]", contentClassName)}>{children}</main>
      </div>

      {/* Нижнее меню - всегда фиксированное позиционирование */}
      {showBottomNav && (
        <BottomNav
          showBackButton={finalShowBackButton}
          className={navConfig.className}
        />
      )}
    </div>
  )
}

