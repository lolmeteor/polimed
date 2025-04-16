"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  buttonText?: string
}

export function SuccessModal({ isOpen, onClose, message, buttonText = "Закрыть" }: SuccessModalProps) {
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

  // Если компонент не смонтирован, не рендерим ничего
  if (!mounted) return null

  // Если модальное окно закрыто, не рендерим его
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center">
      {/* Затемненный фон с размытием */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[5px]" onClick={onClose} />

      {/* Модальное окно */}
      <div className="relative w-[275px] bg-white border-2 border-brand rounded-crd shadow-[0px_0px_25.8px_-5px_rgba(141,206,202,0.3)] z-10">
        {/* Содержимое модального окна */}
        <div className="p-6 flex flex-col items-center">
          {/* Сообщение об успешной отмене */}
          <p className="text-[16px] font-semibold text-txt-primary text-center mb-6">{message}</p>

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={cn(
              "w-full h-[39px] rounded-circle font-bold text-[14px] transition-colors duration-200 border-2 border-brand",
              isButtonHovered ? "bg-brand text-white" : "bg-white text-txt-primary",
            )}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
} 