"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { cn } from "@/lib/utils"
import { UserProvider } from "@/context/user-context"

export default function SpecialistsPage() {
  return (
    <UserProvider>
      <SpecialistsContent />
    </UserProvider>
  )
}

function SpecialistsContent() {
  const router = useRouter()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  // Список специалистов первой группы (без направления)
  const directSpecialists = [
    { id: "surgeon", title: "Хирург", href: "/doctor-appointment/specialists/surgeon" },
    { id: "gynecologist", title: "Гинеколог", href: "/doctor-appointment/specialists/gynecologist" },
    { id: "otolaryngologist", title: "Отоларинголог", href: "/doctor-appointment/specialists/otolaryngologist" },
    { id: "ophthalmologist", title: "Офтальмолог", href: "/doctor-appointment/specialists/ophthalmologist" },
  ]

  // Список специалистов второй группы (по направлению)
  const referralSpecialists = [
    { id: "cardiologist", title: "Кардиолог", href: "/doctor-appointment/specialists/cardiologist" },
    { id: "endocrinologist", title: "Эндокринолог", href: "/doctor-appointment/specialists/endocrinologist" },
    { id: "gastroenterologist", title: "Гастроэнтеролог", href: "/doctor-appointment/specialists/gastroenterologist" },
    { id: "neurologist", title: "Невролог", href: "/doctor-appointment/specialists/neurologist" },
    { id: "urologist", title: "Уролог", href: "/doctor-appointment/specialists/urologist" },
    { id: "rheumatologist", title: "Ревматолог", href: "/doctor-appointment/specialists/rheumatologist" },
    { id: "pulmonologist", title: "Пульмонолог", href: "/doctor-appointment/specialists/pulmonologist" },
  ]

  const handleButtonClick = (path: string) => {
    router.push(path)
  }

  // Функция для рендеринга кнопки специалиста
  const renderSpecialistButton = (specialist: { id: string; title: string; href: string }) => (
    <div
      key={specialist.id}
      className={cn(
        "w-[275px] h-[57px] border-2 border-brand rounded-btn",
        "flex items-center justify-between px-6 mb-4 cursor-pointer",
        "transition-colors duration-200",
        hoveredButton === specialist.id ? "bg-brand" : "bg-white",
      )}
      onMouseEnter={() => setHoveredButton(specialist.id)}
      onMouseLeave={() => setHoveredButton(null)}
      onClick={() => handleButtonClick(specialist.href)}
    >
      <span
        className={cn(
          "font-semibold text-[16px] leading-[20px]",
          hoveredButton === specialist.id ? "text-white" : "text-txt-primary",
        )}
      >
        {specialist.title}
      </span>
      <ArrowRight className={cn("w-6 h-6", hoveredButton === specialist.id ? "text-white" : "text-txt-primary")} />
    </div>
  )

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />

      <AdaptiveContainer className="flex flex-col items-start">
        <h1 className="text-xl font-semibold text-brand-dark mb-8">Врачи-специалисты</h1>

        {/* Первая группа специалистов */}
        <div className="w-full flex flex-col items-start mb-8">{directSpecialists.map(renderSpecialistButton)}</div>

        {/* Заголовок для специалистов по направлению */}
        <h2 className="text-[15px] font-semibold text-txt-primary mb-4">По направлению от врача</h2>

        {/* Вторая группа специалистов (по направлению) */}
        <div className="w-full flex flex-col items-start">{referralSpecialists.map(renderSpecialistButton)}</div>
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <BottomNav currentPage="home" showBackButton={true} className="bottom-nav-fixed" />
    </div>
  )
}

