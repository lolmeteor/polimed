import type React from "react"
import { cn } from "@/lib/utils"

interface AdaptiveContainerProps {
  children: React.ReactNode
  className?: string
  withPadding?: boolean
}

/**
 * Адаптивный контейнер для содержимого страницы
 *
 * @param children - Содержимое контейнера
 * @param className - Дополнительные классы
 * @param withPadding - Добавлять ли стандартные отступы (по умолчанию true)
 */
export function AdaptiveContainer({ children, className, withPadding = true }: AdaptiveContainerProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto", withPadding && "px-4 sm:px-page-x py-4 sm:py-page-y", className)}>
      {children}
    </div>
  )
}

