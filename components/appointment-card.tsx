"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AppointmentCardProps {
  id: string
  datetime: string
  doctorSpecialty: string
  doctorName: string
  address: string
  cabinet: string
  ticketNumber: string
  onSelectAppointment: (id: string) => void
  hoveredButton: string | null
  onButtonHover: (id: string | null) => void
}

/**
 * Унифицированный компонент карточки записи к специалисту
 * Используется для отображения доступных слотов записи на странице специалиста
 */
export function AppointmentCard({
  id,
  datetime,
  doctorSpecialty,
  doctorName,
  address,
  cabinet,
  ticketNumber,
  onSelectAppointment,
  hoveredButton,
  onButtonHover
}: AppointmentCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [minCardHeight, setMinCardHeight] = useState<number>(220); // Начальная минимальная высота
  
  // Отслеживаем изменения размеров контента
  useEffect(() => {
    if (contentRef.current) {
      const updateHeight = () => {
        const height = contentRef.current?.scrollHeight || 0;
        setContentHeight(height);
        
        // Вычисляем минимальную высоту карточки (контент + кнопка + отступы)
        // Кнопка 39px + верхний отступ кнопки 16px + отступы карточки сверху и снизу ~48px
        const minHeight = height + 39 + 16 + 48;
        setMinCardHeight(Math.max(220, minHeight)); // Не меньше чем 220px
      };
      
      updateHeight();
      
      // Обновляем при изменении размера окна
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [address]); // Пересчитываем при изменении адреса

  return (
    <div
      key={id}
      className="w-full max-w-[275px] min-h-[220px] bg-white border-2 border-brand rounded-btn p-6 pb-4 relative flex flex-col"
      style={{ height: 'auto', zIndex: 1 }}
    >
      {/* Дата и время */}
      <p className="font-bold text-[20px] leading-[24px] text-txt-primary mb-4">{datetime}</p>

      {/* Информация о враче и адресе */}
      <div className="flex flex-col gap-2 mb-6">
        {/* Специальность */}
        <p className="font-medium text-[12px] leading-[15px] text-txt-secondary">
          {doctorSpecialty}
        </p>

        {/* ФИО врача */}
        <p className="font-medium text-[16px] leading-[20px] text-txt-primary">{doctorName}</p>

        {/* Адрес */}
        <p className="font-medium text-[11px] leading-[13px] text-txt-secondary break-words">
          {address}
        </p>
      </div>

      {/* Кнопка записи */}
      <button
        className={cn(
          "mt-auto", // Кнопка всегда внизу
          "h-[39px] rounded-circle border-2 border-brand",
          "font-bold text-[14px] leading-[17px] text-center w-full",
          "transition-colors duration-200",
          hoveredButton === id ? "bg-brand text-white" : "text-txt-primary",
        )}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onButtonHover(id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          onButtonHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAppointment(id);
        }}
      >
        Записаться
      </button>
    </div>
  )
} 