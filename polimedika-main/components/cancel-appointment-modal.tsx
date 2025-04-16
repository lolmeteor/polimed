"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  datetime: string
  cabinet: string
  address: string
  ticketNumber: string
  doctorSpecialty?: string
  doctorName?: string
}

interface CancelAppointmentModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (appointmentId: string) => void
}

export function CancelAppointmentModal({ appointment, isOpen, onClose, onConfirm }: CancelAppointmentModalProps) {
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

  // Форматируем дату и время для отображения
  const formatDate = (dateTimeStr: string) => {
    // Ожидаем формат "YYYY-MM-DD HH:MM" или "день месяц год HH:MM"
    try {
      let datePart, timePart;
      
      if (dateTimeStr.includes("-")) {
        // Формат "YYYY-MM-DD HH:MM"
        const [dateStr, timeStr] = dateTimeStr.split(" ");
        const [year, month, day] = dateStr.split("-");
        
        const months = [
          "января", "февраля", "марта", "апреля", "мая", "июня",
          "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];
        
        datePart = `${parseInt(day)} ${months[parseInt(month) - 1]}`;
        timePart = timeStr;
      } else {
        // Формат "день месяц год HH:MM" или "день месяц HH:MM"
        const parts = dateTimeStr.split(" ");
        if (parts.length >= 3) {
          // Если есть год, пропускаем его
          if (parts.length === 4) {
            datePart = `${parts[0]} ${parts[1]}`;
            timePart = parts[3];
          } else {
            datePart = `${parts[0]} ${parts[1]}`;
            timePart = parts[2];
          }
        } else {
          // Неизвестный формат, возвращаем исходную строку
          return dateTimeStr;
        }
      }
      
      return `${datePart} ${timePart}`;
    } catch (e) {
      console.error("Ошибка при форматировании даты:", e);
      return dateTimeStr;
    }
  };

  const formattedDateTime = formatDate(appointment.datetime);

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
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
          <h2 className="text-[20px] font-bold text-brand-dark mb-6">
            Отмена записи на прием:
          </h2>

          {/* Информация о записи */}
          <div className="mb-6">
            <p className="font-bold text-[20px] leading-[24px] text-brand-dark mb-4">{formattedDateTime}</p>
            <p className="text-[14px] leading-[17px] text-txt-secondary mb-1">{appointment.doctorSpecialty}</p>
            <p className="text-[16px] font-medium leading-[20px] text-brand-dark mb-2">{appointment.doctorName}</p>
            <p className="text-[14px] leading-[17px] text-txt-secondary">{appointment.address}</p>
          </div>

          {/* Кнопка подтверждения отмены */}
          <button
            onClick={() => onConfirm(appointment.id)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={cn(
              "w-full h-[39px] rounded-full font-bold text-[14px] transition-colors duration-200",
              isButtonHovered ? "bg-brand text-white" : "bg-white text-brand border-2 border-brand"
            )}
          >
            Отменить запись
          </button>
        </div>
      </div>
    </div>
  )
}

