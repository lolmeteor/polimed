"use client"

import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { Phone } from "lucide-react"
import Link from "next/link"
import { H1, P } from "@/components/ui/text-elements"

// Стили для предотвращения разрыва фраз
const noBreak = { whiteSpace: "nowrap" as const };

export default function AppointmentRulesPage() {
  // Функция для форматирования телефона в ссылку
  const formatPhoneLink = (phone: string) => {
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    // Добавляем + если его нет
    return `tel:${cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone}`;
  }

  // Функция для обработки кликов по телефону
  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>, phone: string) => {
    // Проверяем, находимся ли мы в браузере
    const isBrowser = typeof window !== 'undefined' && 
                     typeof window.document !== 'undefined' && 
                     typeof window.navigator !== 'undefined';
    
    if (!isBrowser) return;
    
    // Проверяем, является ли устройство iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIOS) {
      e.preventDefault();
      const cleanPhone = phone.replace(/[\s()-]/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
      
      // Пробуем использовать и location.href, и window.open для iOS
      window.location.href = `tel:${formattedPhone}`;
      setTimeout(() => {
        window.open(`tel:${formattedPhone}`, '_system');
      }, 100);
    }
  };

  return (
    <div className="relative min-h-screen max-w-lg mx-auto bg-white">
      <HeaderLogo />

      <AdaptiveContainer className="mt-4">
        <H1 className="text-xl sm:text-[20px] font-semibold text-txt-primary mb-8 leading-[24px] max-w-[400px]">
          Правила записи
          <br />
          на прием к узким 
          <br />
          специалистам
          <br />
          и на лабораторную/
          <br />
          инструментальную 
          <br />
          диагностику
        </H1>

        <div className="relative pl-2 mb-8">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-brand"></div>

          <P className="text-[12px] font-semibold text-txt-primary leading-[122.11%]">
            Запись к узким специалистам
            <br />
            и на лабораторную/инструментальную 
            <br />
            диагностику возможна при наличии
            <br />
            действующего направления от врача 
            <br />
            ООО "Полимедика Челябинск".
          </P>
          <P className="text-[12px] font-semibold text-txt-primary leading-[122.11%] mt-4">
            Срок действия направления
            <br />
            30 календарных дней.
          </P>
        </div>

        {/* Phone contact section - reduced margin-top */}
        <div className="flex items-start mt-6 mb-24">
          <div className="flex-shrink-0 mt-0.5">
            <Phone className="w-5 h-5 text-brand" />
          </div>
          <div className="ml-3">
            <a
              href={formatPhoneLink("+7 (351) 240-99-00")}
              onClick={(e) => handlePhoneClick(e, "+7 (351) 240-99-00")}
              className="text-[14px] font-semibold text-txt-primary underline leading-[17px]"
            >
              +7 (351) 240-99-00
            </a>
            <P className="text-[11px] font-medium text-txt-secondary leading-[13px] mt-1">
              Служба контроля качества
            </P>
          </div>
        </div>
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <BottomNav showBackButton={true} className="bottom-nav-fixed" />
    </div>
  )
}

