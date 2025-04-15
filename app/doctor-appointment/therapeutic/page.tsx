"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { cn } from "@/lib/utils"

export default function TherapeuticPage() {
  const router = useRouter()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const handleButtonClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />

      <AdaptiveContainer className="flex flex-col items-start">
        <h1 className="text-xl font-semibold text-brand-dark mb-8">Терапевтическое отделение</h1>

        {/* Кнопка "Участковый терапевт" */}
        <div
          className={cn(
            "w-[275px] h-[95px] border-2 border-brand rounded-btn",
            "flex items-center justify-between px-6 mb-4 cursor-pointer",
            "transition-colors duration-200",
            hoveredButton === "therapist" ? "bg-brand" : "bg-white",
          )}
          onMouseEnter={() => setHoveredButton("therapist")}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick("/doctor-appointment/therapeutic/therapist")}
        >
          <span
            className={cn(
              "font-semibold text-[16px] leading-[20px]",
              hoveredButton === "therapist" ? "text-white" : "text-txt-primary",
            )}
          >
            Участковый терапевт
          </span>
          <ArrowRight className={cn("w-6 h-6", hoveredButton === "therapist" ? "text-white" : "text-txt-primary")} />
        </div>

        {/* Кнопка "Врач общей практики" */}
        <div
          className={cn(
            "w-[275px] h-[95px] border-2 border-brand rounded-btn",
            "flex items-center justify-between px-6 cursor-pointer",
            "transition-colors duration-200",
            hoveredButton === "general" ? "bg-brand" : "bg-white",
          )}
          onMouseEnter={() => setHoveredButton("general")}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => handleButtonClick("/doctor-appointment/therapeutic/general")}
        >
          <span
            className={cn(
              "font-semibold text-[16px] leading-[20px]",
              hoveredButton === "general" ? "text-white" : "text-txt-primary",
            )}
          >
            Врач общей практики
          </span>
          <ArrowRight className={cn("w-6 h-6", hoveredButton === "general" ? "text-white" : "text-txt-primary")} />
        </div>
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <div className="bottom-nav-container">
        <BottomNav showBackButton={true} currentPage="home" className="bottom-nav-fixed" />
      </div>
    </div>
  )
}

