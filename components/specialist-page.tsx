"use client"

import { useState, useEffect } from "react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { ConfirmAppointmentModal } from "@/components/confirm-appointment-modal"
import { SuccessModal } from "@/components/success-modal"
import { AppointmentTicketModal } from "@/components/appointment-ticket-modal"
import { AppointmentCard } from "@/components/appointment-card"
import { useUser } from "@/context/user-context"
import { AppointmentSlot } from "@/types/appointment"
import { AppointmentService } from "@/services/appointment-service"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Расширяем тип AppointmentSlot для страницы специалиста
interface SpecialistAppointmentSlot extends Omit<AppointmentSlot, 'doctorSpecialty' | 'doctorName'> {
  doctorSpecialty: string
  doctorName: string
}

interface SpecialistPageProps {
  specialtyName: string // Название специальности для отображения (например, "кардиолог")
  specialtySlug: string // Слаг специальности для запросов (например, "cardiologist")
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

/**
 * Шаблонная страница специалиста
 * @param specialtyName - название специальности
 * @param specialtySlug - слаг специальности для запросов к API
 */
export function SpecialistPage({ specialtyName, specialtySlug }: SpecialistPageProps) {
  const { addAppointment, userProfile } = useUser()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<SpecialistAppointmentSlot | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [availableAppointments, setAvailableAppointments] = useState<SpecialistAppointmentSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Добавляем состояние для модального окна ошибки
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Загружаем доступные слоты при монтировании
  useEffect(() => {
    async function loadAppointmentSlots() {
      setIsLoading(true)
      try {
        const slots = await AppointmentService.getAvailableSlots(specialtySlug)
        // Приводим слоты к типу SpecialistAppointmentSlot
        const specialistSlots = slots.map(slot => ({
          ...slot,
          doctorSpecialty: slot.doctorSpecialty || specialtyName,
          doctorName: slot.doctorName || ""
        })) as SpecialistAppointmentSlot[]
        setAvailableAppointments(specialistSlots)
      } catch (error) {
        console.error("Ошибка при загрузке слотов записи:", error)
        setAvailableAppointments([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointmentSlots()
  }, [specialtySlug])

  // Обновляем список доступных слотов при изменении записей пользователя
  useEffect(() => {
    if (userProfile?.appointments && availableAppointments.length > 0) {
      // Фильтруем слоты, исключая те, на которые уже есть запись
      const updatedSlots = AppointmentService.filterAvailableSlots(
        availableAppointments, 
        userProfile.appointments
      ).map(slot => ({
        ...slot,
        doctorSpecialty: slot.doctorSpecialty || specialtyName,
        doctorName: slot.doctorName || ""
      })) as SpecialistAppointmentSlot[]
      setAvailableAppointments(updatedSlots)
    }
  }, [userProfile?.appointments, availableAppointments])

  const handleAppointment = (appointment: SpecialistAppointmentSlot) => {
    setSelectedAppointment(appointment)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (selectedAppointment) {
      try {
        // Добавляем запись в профиль пользователя
        await addAppointment(selectedAppointment)
        
        setIsConfirmModalOpen(false)
        setIsTicketModalOpen(true) // Сразу показываем талон, пропуская окно успешной записи
      } catch (error) {
        // Закрываем модальное окно подтверждения
        setIsConfirmModalOpen(false)
        
        // Показываем сообщение об ошибке в модальном окне
        if (error instanceof Error) {
          setErrorMessage(error.message)
          setIsErrorModalOpen(true)
        } else {
          setErrorMessage("Произошла ошибка при создании записи. Пожалуйста, попробуйте позже.")
          setIsErrorModalOpen(true)
        }
      }
    }
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedAppointment(null)
  }
  
  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false)
    setSelectedAppointment(null)
  }

  // Функция для определения видимости нижнего меню
  const isBottomNavVisible = !isConfirmModalOpen && !isSuccessModalOpen && !isTicketModalOpen && !isErrorModalOpen;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />

      <AdaptiveContainer className="flex flex-col items-start pb-20">
        <h1 className="text-[15px] font-semibold text-txt-primary mb-8 max-w-[245px]">
          Ближайшая свободная запись к {specialtyName}:
        </h1>

        {isLoading ? (
          <div className="w-full text-center py-4">Загрузка доступных слотов...</div>
        ) : availableAppointments.length === 0 ? (
          <div className="w-full text-center py-4">Нет доступных слотов для записи</div>
        ) : (
          <div className="w-full space-y-4">
            {availableAppointments.map((appointment) => (
              <div key={appointment.id}>
                <AppointmentCard
                  id={appointment.id}
                  datetime={appointment.datetime}
                  doctorSpecialty={appointment.doctorSpecialty || specialtyName}
                  doctorName={appointment.doctorName || ""}
                  address={appointment.address}
                  cabinet={appointment.cabinet}
                  ticketNumber={appointment.ticketNumber}
                  onSelectAppointment={() => handleAppointment(appointment)}
                  hoveredButton={hoveredButton}
                  onButtonHover={setHoveredButton}
                />
              </div>
            ))}
          </div>
        )}
      </AdaptiveContainer>

      {/* Модальное окно подтверждения записи */}
      <ConfirmAppointmentModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAppointment}
        appointment={selectedAppointment}
      />
      
      {/* Модальное окно с талоном */}
      <AppointmentTicketModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        appointmentData={selectedAppointment}
      />
      
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
        <BottomNav showBackButton={true} currentPage="home" className="bottom-nav-fixed" />
      </div>
    </div>
  )
} 