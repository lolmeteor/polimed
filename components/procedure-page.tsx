"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { AppointmentCard } from "@/components/appointment-card"
import { ConfirmAppointmentModal } from "@/components/confirm-appointment-modal"
import { SuccessModal } from "@/components/success-modal"
import { ReferralCheck } from "@/components/referral-check"
import { AppointmentTicketModal } from "@/components/appointment-ticket-modal"
import { useUser } from "@/context/user-context"
import { AppointmentService } from "@/services/appointment-service"
import { AppointmentSlot } from "@/types/appointment"
import { directAccessProcedures } from "@/data/procedures"
import { toast } from "sonner"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcedurePageProps {
  procedureName: string
  procedureSlug: string
}

// Добавляем компонент модального окна ошибки
interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isProfileButtonHovered, setIsProfileButtonHovered] = useState(false)
  const router = useRouter()
  
  if (!isOpen) return null

  // Заменяем все пробелы после предлогов и союзов на неразрывные
  const processedMessage = message
    .replace(/ к /g, " к\u00A0")
    .replace(/ в /g, " в\u00A0")
    .replace(/ на /g, " на\u00A0")
    .replace(/ и /g, " и\u00A0")
    .replace(/ с /g, " с\u00A0")
    .replace(/ у /g, " у\u00A0")
    .replace(/ о /g, " о\u00A0")
    .replace(/ от /g, " от\u00A0")
    .replace(/ по /g, " по\u00A0")
    .replace(/ для /g, " для\u00A0")
    .replace(/Для /g, "Для\u00A0")
    .replace(/ при /g, " при\u00A0");
  
  const handleProfileClick = () => {
    try {
      // Сначала пробуем обычную навигацию
      router.push("/profile");
      
      // Резервный вариант с небольшой задержкой
      setTimeout(() => {
        if (window.location.pathname !== "/profile") {
          console.log("Резервная навигация на /profile");
          window.location.href = "/profile";
        }
      }, 100);
    } catch (error) {
      console.error("Ошибка навигации:", error);
      // Используем прямую навигацию в случае ошибки
      window.location.href = "/profile";
    }
  };
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Затемненный фон с размытием */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[5px]" onClick={onClose} />

      {/* Модальное окно */}
      <div className="relative w-[275px] bg-white border-2 border-brand rounded-[20px] shadow-[0px_0px_25.8px_-5px_rgba(141,206,202,0.3)] z-10">
        {/* Кнопка закрытия */}
        <button onClick={onClose} className="absolute right-4 top-4 text-brand" aria-label="Закрыть">
          <X className="w-6 h-6" />
        </button>

        {/* Содержимое модального окна */}
        <div className="p-6 pt-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
          </div>
          
          <h2 className="text-[20px] font-bold text-brand-dark mb-4 text-center">
            Запись невозможна
          </h2>

          <p className="text-[14px] leading-[18px] text-txt-secondary mb-6 text-center">
            {processedMessage}
          </p>

          {/* Кнопки */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className={cn(
                "w-full h-[39px] rounded-full font-bold text-[14px] transition-colors duration-200",
                isButtonHovered ? "bg-brand text-white" : "bg-white text-brand border-2 border-brand"
              )}
            >
              Понятно
            </button>
            
            <button
              onClick={handleProfileClick}
              onMouseEnter={() => setIsProfileButtonHovered(true)}
              onMouseLeave={() => setIsProfileButtonHovered(false)}
              className={cn(
                "w-full h-[39px] rounded-full font-bold text-[14px] transition-colors duration-200",
                isProfileButtonHovered ? "bg-brand text-white" : "bg-white text-brand border-2 border-brand"
              )}
            >
              Перейти к профилю
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProcedurePage({ procedureName, procedureSlug }: ProcedurePageProps) {
  const router = useRouter()
  const { userProfile, addAppointment, checkReferral } = useUser()
  
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [referralChecked, setReferralChecked] = useState(false)
  const [hasReferral, setHasReferral] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  // Проверяем, нужно ли направление для этой процедуры
  const requiresReferral = !directAccessProcedures.includes(procedureSlug)

  // Обработчик завершения проверки направления
  const handleReferralCheckComplete = (hasReferral: boolean) => {
    setReferralChecked(true)
    setHasReferral(hasReferral)
    
    if (hasReferral) {
      // Загружаем слоты только после успешной проверки направления
      fetchSlots()
    }
  }
  
  // Загрузка слотов при монтировании, если не требуется направление
  useEffect(() => {
    if (!requiresReferral) {
      fetchSlots()
      setReferralChecked(true)
    }
  }, [procedureSlug, requiresReferral])
  
  // Функция загрузки слотов
  const fetchSlots = async () => {
    setIsLoading(true)
    
    try {
      const availableSlots = await AppointmentService.getProcedureSlots(procedureSlug)
      
      // Сортируем слоты по дате и времени
      const sortedSlots = availableSlots.sort((a, b) => {
        // Преобразуем дату-время в сопоставимый формат
        const dateA = a.datetime.split(' ')[0];
        const dateB = b.datetime.split(' ')[0];
        
        // Извлекаем день из строки даты
        const dayA = parseInt(dateA.split(' ')[0]);
        const dayB = parseInt(dateB.split(' ')[0]);
        
        // Сначала сортируем по дню
        if (dayA !== dayB) {
          return dayA - dayB;
        }
        
        // Если дни одинаковые, сортируем по времени
        const timeA = a.datetime.split(' ')[1];
        const timeB = b.datetime.split(' ')[1];
        
        // Преобразуем время в минуты для сравнения
        const [hoursA, minutesA] = timeA.split(':').map(Number);
        const [hoursB, minutesB] = timeB.split(':').map(Number);
        
        const minutesTotalA = hoursA * 60 + minutesA;
        const minutesTotalB = hoursB * 60 + minutesB;
        
        return minutesTotalA - minutesTotalB;
      });
      
      setSlots(sortedSlots)
    } catch (error) {
      console.error("Ошибка при загрузке слотов:", error)
      toast.error("Не удалось загрузить доступные слоты")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Выбор слота для записи
  const handleSelectAppointment = (id: string) => {
    const selected = slots.find(slot => slot.id === id) || null
    setSelectedSlot(selected)
    setIsConfirmModalOpen(true)
  }

  // Подтверждение записи
  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!selectedSlot || !userProfile) {
      setErrorMessage("Не удалось создать запись. Попробуйте еще раз.")
      setIsErrorModalOpen(true)
      return
    }
    
    try {
      // Убедимся, что название процедуры заполнено
      const procedureData = {
        ...selectedSlot,
        procedureName: selectedSlot.procedureName || procedureName,
        isProcedure: true
      }
      
      // Создаем запись через сервис
      const newAppointment = await AppointmentService.createProcedureAppointment(procedureData)
      
      // Блокируем слот
      AppointmentService.blockProcedureSlot(appointmentId)
      
      // Добавляем запись в контекст пользователя
      await addAppointment({ 
        ...procedureData, 
        id: appointmentId 
      })
      
      // Удаляем использованный слот из списка отображаемых слотов
      setSlots(prevSlots => prevSlots.filter(slot => slot.id !== appointmentId))
      
      // Закрываем модальное окно подтверждения
      setIsConfirmModalOpen(false)
      
      // Пропускаем модальное окно успешной записи и сразу показываем талончик
      setIsTicketModalOpen(true)
    } catch (error) {
      console.error("Ошибка при создании записи:", error)
      setIsConfirmModalOpen(false)
      // Заменяем toast на модальное окно
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Не удалось создать запись. Попробуйте еще раз.")
      }
      setIsErrorModalOpen(true)
    }
  }

  // Обработчик закрытия талончика
  const handleTicketClose = () => {
    setIsTicketModalOpen(false)
    // Удаляем перенаправление на страницу профиля
  }

  // Функция для определения видимости нижнего меню
  const isBottomNavVisible = !isConfirmModalOpen && !isSuccessModalOpen && !isTicketModalOpen && !isErrorModalOpen;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />
      
      {/* Компонент проверки направления для процедур, требующих направление */}
      {requiresReferral && !referralChecked && (
        <ReferralCheck
          type="procedure"
          slug={procedureSlug}
          onCheckComplete={handleReferralCheckComplete}
        />
      )}
      
      <AdaptiveContainer className="flex flex-col">
        <h1 className="text-xl font-semibold text-brand-dark mt-3 mb-8">
          Запись на {procedureName}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : slots.length > 0 ? (
          <div className="space-y-4">
            {slots.map((slot) => (
              <AppointmentCard
                key={slot.id}
                id={slot.id}
                datetime={slot.datetime}
                doctorSpecialty={slot.procedureName || ""}
                doctorName={""}
                address={slot.address}
                cabinet={slot.cabinet}
                ticketNumber={slot.ticketNumber}
                onSelectAppointment={handleSelectAppointment}
                hoveredButton={hoveredButton}
                onButtonHover={setHoveredButton}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Нет доступных слотов для записи
          </div>
        )}
      </AdaptiveContainer>

      {/* Модальные окна */}
      {selectedSlot && (
        <>
          <ConfirmAppointmentModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmAppointment}
            appointment={selectedSlot}
          />
          
          <AppointmentTicketModal
            isOpen={isTicketModalOpen}
            onClose={handleTicketClose}
            appointmentData={{
              id: selectedSlot.id,
              datetime: selectedSlot.datetime,
              doctorName: '',
              doctorSpecialty: procedureName,
              procedureName: procedureName,
              address: selectedSlot.address,
              cabinet: selectedSlot.cabinet,
              ticketNumber: selectedSlot.ticketNumber,
              isProcedure: true
            }}
          />
        </>
      )}
      
      {/* Добавляем модальное окно ошибки */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
      
      {/* Нижнее меню */}
      <div 
        className={`bottom-nav-container transition-opacity duration-300 ${isBottomNavVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <BottomNav currentPage="home" showBackButton={true} className="bottom-nav-fixed" />
      </div>
    </div>
  )
} 