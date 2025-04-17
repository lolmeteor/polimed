"use client"

import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { Phone, MapPin } from "lucide-react"
import { CLINIC_ADDRESSES } from "@/data/clinic-addresses"
import { UserProvider } from "@/context/user-context"

export default function BranchesPage() {
  return (
    <UserProvider>
      <BranchesContent />
    </UserProvider>
  )
}

function BranchesContent() {
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

  // Функция для форматирования адреса в ссылку на карты
  const formatMapLink = (address: string) => {
    // Проверяем, находимся ли мы в браузере
    const isBrowser = typeof window !== 'undefined' && 
                     typeof window.document !== 'undefined' && 
                     typeof window.navigator !== 'undefined';

    // Если мы не в браузере (например, при SSR)
    if (!isBrowser) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    // Определяем iOS через userAgent
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    if (isIOS) {
      // Используем Apple Maps для iOS
      return `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
    }
    
    // Google Maps для всех остальных платформ
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-32">
      <HeaderLogo />

      <AdaptiveContainer>
        {/* Телефоны */}
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4 leading-[18px]">Телефоны</h2>
          
          {/* Телефон для вызова неотложной помощи */}
          <div className="mb-6">
            <p className="text-[14px] text-[var(--text-secondary)] mb-2">Телефон для вызова неотложной помощи</p>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-[var(--brand-primary)]" strokeWidth={2} />
              <a href={formatPhoneLink("8 (351) 240-99-77")} 
                 onClick={(e) => handlePhoneClick(e, "8 (351) 240-99-77")}
                 className="text-[14px] font-semibold text-[var(--text-primary)] underline">
                8 (351) 240-99-77
              </a>
            </div>
          </div>

          {/* Телефон для записи */}
          <div className="mb-6">
            <p className="text-[14px] text-[var(--text-secondary)] mb-2">Телефон для записи</p>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-[var(--brand-primary)]" strokeWidth={2} />
              <a href={formatPhoneLink("8 (351) 240-99-77")} 
                 onClick={(e) => handlePhoneClick(e, "8 (351) 240-99-77")}
                 className="text-[14px] font-semibold text-[var(--text-primary)] underline">
                8 (351) 240-99-77
              </a>
            </div>
          </div>

          {/* Служба контроля качества */}
          <div className="mb-6">
            <p className="text-[14px] text-[var(--text-secondary)] mb-2">Служба контроля качества</p>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-[var(--brand-primary)]" strokeWidth={2} />
              <div>
                <a href={formatPhoneLink("+7 (351) 240-99-00")} 
                   onClick={(e) => handlePhoneClick(e, "+7 (351) 240-99-00")}
                   className="text-[14px] font-semibold text-[var(--text-primary)] underline block">
                  +7 (351) 240-99-00
                </a>
                <p className="text-[11px] text-[var(--text-secondary)]">info74@mnogomed.ru</p>
              </div>
            </div>
          </div>
        </div>

        {/* Разделительная линия */}
        <div className="w-full h-[1px] bg-[var(--brand-primary)] mb-8" />

        {/* Адреса */}
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4 leading-[18px]">Адреса поликлиник</h2>
          
          <div className="space-y-6">
            {CLINIC_ADDRESSES.map((clinic, index) => (
              <div key={index} className="flex gap-4">
                <MapPin className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" strokeWidth={2} />
                <div>
                  <a href={formatMapLink(clinic.fullAddress)}
                     className="text-[14px] font-semibold text-[var(--text-primary)] mb-2 block hover:underline"
                     target="_blank"
                     rel="noopener noreferrer">
                    {clinic.shortAddress}
                  </a>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-[13px]">
                    {clinic.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdaptiveContainer>

      <BottomNav className="bottom-nav-fixed" />
    </div>
  )
}

