"use client"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { HeaderLogo } from "@/components/header-logo"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/bottom-nav"
import { useUser, UserProvider } from "@/context/user-context"
import { toast } from "sonner"

// Типы процедур
type Procedure = {
  name: string
  path: string
}

export default function ProceduresByReferralPage() {
  return (
    <UserProvider>
      <ProceduresContent />
    </UserProvider>
  )
}

function ProceduresContent() {
  const router = useRouter()
  const { userProfile, isLoading: isUserLoading } = useUser()
  const [hoveredProcedure, setHoveredProcedure] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Добавляем эффект для проверки авторизации
  useEffect(() => {
    if (!isUserLoading && !userProfile) {
      router.push("/auth")
    }
  }, [userProfile, isUserLoading, router])

  // Добавляем эффект для скролла в начало страницы при монтировании
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Первая группа процедур (без заголовка)
  const firstGroupProcedures: Procedure[] = [
    { name: "Забор крови", path: "/doctor-appointment/procedures/blood-sampling" },
    { name: "Вакцинация", path: "/doctor-appointment/procedures/vaccination" },
    { name: "ФОГ", path: "/doctor-appointment/procedures/fog" },
  ]

  // Вторая группа процедур (По направлению от врача)
  const secondGroupProcedures: Procedure[] = [
    { name: "УЗИ вен/артерий нижних конечностей", path: "/doctor-appointment/procedures/leg-vessels-ultrasound" },
    { name: "УЗИ брюшной полости", path: "/doctor-appointment/procedures/abdominal-ultrasound" },
    { name: "УЗИ органов малого таза", path: "/doctor-appointment/procedures/pelvic-ultrasound" },
    { name: "Фиброколоноскопия", path: "/doctor-appointment/procedures/fibrocolonoscopy" },
    { name: "Рентген", path: "/doctor-appointment/procedures/xray" },
    { name: "Маммография", path: "/doctor-appointment/procedures/mammography" },
    { name: "Холтер", path: "/doctor-appointment/procedures/holter" },
    { name: "СМАД", path: "/doctor-appointment/procedures/smad" },
    { name: "ФГДС", path: "/doctor-appointment/procedures/fgds" },
    { name: "УЗИ сердца", path: "/doctor-appointment/procedures/heart-ultrasound" },
    { name: "УЗИ сосудов шеи", path: "/doctor-appointment/procedures/neck-vessels-ultrasound" },
    { name: "ТРУЗИ", path: "/doctor-appointment/procedures/truzi" },
    { name: "Функция внешнего дыхания", path: "/doctor-appointment/procedures/external-respiration" },
    { name: "КТГ", path: "/doctor-appointment/procedures/ktg" },
    { name: "ЭКГ", path: "/doctor-appointment/procedures/ekg" },
    { name: "Инъекции", path: "/doctor-appointment/procedures/injections" },
    { name: "Дневной стационар", path: "/doctor-appointment/procedures/day-hospital" },
  ]

  const handleProcedureClick = async (path: string) => {
    if (isNavigating) return
    
    try {
      setIsNavigating(true)
      await router.push(path)
    } catch (error) {
      console.error("Ошибка при навигации:", error)
      toast.error("Произошла ошибка при переходе на страницу процедуры")
    } finally {
      setIsNavigating(false)
    }
  }

  const handleMouseEnter = (procedurePath: string) => {
    setHoveredProcedure(procedurePath)
  }

  const handleMouseLeave = () => {
    setHoveredProcedure(null)
  }

  // Функция для рендеринга кнопки процедуры
  const renderProcedureButton = (procedure: Procedure, index: number, groupKey: string) => (
    <button
      key={`${groupKey}-${index}`}
      className={cn(
        "flex justify-between items-start w-[275px] px-6 py-3 border-2 rounded-[15px] transition-all duration-200 mb-4",
        hoveredProcedure === procedure.path 
          ? "bg-brand border-brand" 
          : "bg-white border-brand",
        isNavigating ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
      )}
      onClick={() => handleProcedureClick(procedure.path)}
      onMouseEnter={() => handleMouseEnter(procedure.path)}
      onMouseLeave={handleMouseLeave}
      disabled={isNavigating}
    >
      <span className={cn(
        "font-semibold text-[15px] leading-[122.11%] break-words text-left max-w-[185px]",
        hoveredProcedure === procedure.path ? "text-white" : "text-txt-primary"
      )}>
        {procedure.name}
      </span>
      <ArrowRight className={cn(
        "w-5 h-5 ml-2 flex-shrink-0 mt-0.5",
        hoveredProcedure === procedure.path ? "text-white" : "text-brand"
      )} />
    </button>
  )

  if (isUserLoading) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-white">
        <HeaderLogo />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return null // Редирект будет выполнен в useEffect
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />
      
      <AdaptiveContainer className="flex flex-col items-start">
        {/* Первая группа процедур (без заголовка) */}
        <div className="w-full flex flex-col items-start mb-8 mt-6">
          {firstGroupProcedures.map((procedure, index) => 
            renderProcedureButton(procedure, index, "first")
          )}
        </div>

        {/* Заголовок "По направлению от врача" */}
        <h2 className="text-[15px] font-semibold text-txt-primary mb-4">По направлению от врача:</h2>

        {/* Объединенная группа процедур */}
        <div className="w-full flex flex-col items-start mb-8">
          {secondGroupProcedures.map((procedure, index) => 
            renderProcedureButton(procedure, index, "second")
          )}
        </div>
      </AdaptiveContainer>
      
      {/* Нижнее меню */}
      <BottomNav currentPage="home" showBackButton={true} className="bottom-nav-fixed" />
    </div>
  )
}

