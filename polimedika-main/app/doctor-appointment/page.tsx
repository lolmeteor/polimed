"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { cn } from "@/lib/utils"

export default function DoctorAppointmentPage() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const menuItems = [
    {
      id: "dispensary",
      title: "Кабинет диспансеризации",
      href: "/doctor-appointment/dispensary",
      description: "",
      height: "h-[95px]",
    },
    {
      id: "therapeutic",
      title: "Терапевтическое отделение",
      href: "/doctor-appointment/therapeutic",
      description: "Участковые терапевты, ВОП",
      height: "h-[116px]",
    },
    {
      id: "emergency",
      title: "Неотложная помощь",
      href: "/doctor-appointment/emergency",
      description: "",
      height: "h-[95px]",
    },
    {
      id: "specialists",
      title: "Врачи-специалисты",
      href: "/doctor-appointment/specialists",
      description: "Хирург, офтальмолог, отоларинголог, гинеколог и др.",
      height: "h-[116px]",
    },
    {
      id: "procedures",
      title: "Исследования и процедуры",
      href: "/doctor-appointment/procedures",
      description: "ФОГ, ЭКГ, УЗИ, ЭХО КГ, забор крови, вакцинация",
      height: "h-[116px]",
    },
  ]

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />

      <AdaptiveContainer className="flex flex-col items-start gap-4">
        {menuItems.map((item) => (
          <Link key={item.id} href={item.href} className="w-full sm:w-[275px]">
            <div
              className={cn(
                "w-full",
                item.height,
                "border-2 border-brand",
                "rounded-btn flex items-start justify-between p-6",
                "transition-colors duration-200",
                hoveredButton === item.id ? "bg-brand" : "bg-white",
              )}
              onMouseEnter={() => setHoveredButton(item.id)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <div className="space-y-2">
                <h2
                  className={cn(
                    "font-semibold text-[16px] leading-[20px]",
                    hoveredButton === item.id ? "text-white" : "text-txt-primary",
                  )}
                >
                  {item.title}
                </h2>
                {item.description && (
                  <p
                    className={cn(
                      "text-[11px] leading-[13px]",
                      hoveredButton === item.id ? "text-white" : "text-txt-secondary",
                    )}
                  >
                    {item.description}
                  </p>
                )}
              </div>
              <ArrowRight className={cn("w-6 h-6", hoveredButton === item.id ? "text-white" : "text-txt-primary")} />
            </div>
          </Link>
        ))}
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <BottomNav currentPage="home" showBackButton={true} className="bottom-nav-fixed" />
    </div>
  )
}

