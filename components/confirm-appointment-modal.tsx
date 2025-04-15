"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AppointmentSlot } from "@/types/appointment"

interface ConfirmAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (appointmentId: string) => void
  appointment: AppointmentSlot | null
}

export function ConfirmAppointmentModal({ isOpen, onClose, onConfirm, appointment }: ConfirmAppointmentModalProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Обработка монтирования компонента для избежания ошибок SSR
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // Предотвращаем скролл на заднем фоне при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Если компонент не смонтирован или нет данных о записи, не рендерим ничего
  if (!mounted || !appointment) return null

  // Если модальное окно закрыто, не рендерим его
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
      {/* Затемненный фон с размытием */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[5px]" onClick={onClose} />

      {/* Модальное окно */}
      <div className="relative w-[275px] bg-white border-2 border-brand rounded-crd shadow-[0px_0px_25.8px_-5px_rgba(141,206,202,0.3)] z-10">
        <div className="p-6">
          {/* Заголовок */}
          <h2 className="text-[15px] font-semibold text-txt-primary mb-6">
            Подтверждение записи
            <br />
            на прием:
          </h2>

          {/* Информация о записи */}
          <div className="mb-6">
            <p className="font-bold text-[20px] leading-[24px] text-txt-primary mb-4">{appointment.datetime}</p>
            <p className="text-[12px] leading-[15px] text-txt-secondary mb-1">{appointment.doctorSpecialty}</p>
            <p className="text-[16px] font-medium leading-[20px] text-txt-primary mb-2">{appointment.doctorName}</p>
            <p className="text-[12px] leading-[15px] text-txt-secondary">{appointment.address}</p>
          </div>

          {/* Кнопка подтверждения */}
          <button
            onClick={() => onConfirm(appointment.id)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={cn(
              "w-full h-[39px] rounded-circle font-bold text-[14px] transition-colors duration-200 border-2 border-brand",
              isButtonHovered ? "bg-brand text-white" : "bg-white text-txt-primary",
            )}
          >
            Подтвердить запись
          </button>
        </div>
      </div>
    </div>
  )
}

