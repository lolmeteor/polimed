"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { cn } from "@/lib/utils"
import { useUser } from "@/context/user-context"

export default function HomePage() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  // Используем контекст вместо локального состояния для профиля
  const { userProfile, isLoading: isUserLoading } = useUser()

  // Удаляем эффект, который загружает профиль из localStorage,
  // так как теперь мы получаем данные из контекста

  const getGreeting = () => {
    if (!userProfile) return "Здравствуйте!"
    return `Здравствуйте,\n${userProfile.firstName} ${userProfile.patronymic}!`
  }

  // Обновляем условие загрузки, чтобы использовать состояние загрузки из контекста
  const showLoading = isUserLoading

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-[120px]">
      <HeaderLogo />

      {/* Основной контент */}
      <div className="px-page-x pt-4">
        {showLoading ? (
          <div className="animate-pulse">
            <div className="h-[90px] bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <h1 className="text-xl sm:text-[24px] leading-[29px] font-semibold text-txt-primary mb-2 whitespace-pre-line">
              {getGreeting()}
            </h1>
            <p className="text-[11px] leading-[13px] font-medium text-txt-secondary mt-2">
              Вы в приложении «Полимедика»
            </p>
          </>
        )}

        <div className="mt-8 sm:mt-[60px]">
          <h2 className="text-[16px] font-semibold text-txt-primary mb-4">Выберете опцию</h2>

          <Link href="/doctor-appointment">
            <div
              className={cn(
                "box-border w-full sm:w-[275px] h-[84px] border-2 border-brand",
                "rounded-btn flex items-center justify-between px-6 mb-4",
                "transition-colors duration-200",
                hoveredButton === "doctor" ? "bg-brand" : "bg-white",
              )}
              onMouseEnter={() => setHoveredButton("doctor")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span
                className={cn(
                  "font-semibold text-[16px] leading-[20px]",
                  hoveredButton === "doctor" ? "text-white" : "text-txt-primary",
                )}
              >
                Запись к врачу
              </span>
              <ArrowRight className={cn("w-6 h-6", hoveredButton === "doctor" ? "text-white" : "text-txt-primary")} />
            </div>
          </Link>

          <Link href="/appointment-rules">
            <div
              className={cn(
                "box-border w-full sm:w-[275px] h-[84px] border-2 border-brand",
                "rounded-btn flex items-center justify-between px-6 mb-8",
                "transition-colors duration-200",
                hoveredButton === "rules" ? "bg-brand" : "bg-white",
              )}
              onMouseEnter={() => setHoveredButton("rules")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span
                className={cn(
                  "font-semibold text-[16px] leading-[20px]",
                  hoveredButton === "rules" ? "text-white" : "text-txt-primary",
                )}
              >
                Правила записи
              </span>
              <ArrowRight className={cn("w-6 h-6", hoveredButton === "rules" ? "text-white" : "text-txt-primary")} />
            </div>
          </Link>
        </div>
      </div>

      {/* Ссылка на адреса филиалов */}
      <div className="flex justify-center sm:justify-start sm:pl-[74px] mt-4 mb-[87px]">
        <div className="w-[245px] text-center">
          <Link href="/branches" className="font-medium text-[13px] leading-[16px] text-txt-primary underline">
            Адреса филиалов
          </Link>
        </div>
      </div>

      {/* Нижнее меню - используем обновленный компонент */}
      <BottomNav showBackButton={false} className="bottom-nav-fixed" />
    </div>
  )
}

