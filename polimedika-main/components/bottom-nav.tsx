"use client"

import { useState, useEffect, useRef } from "react"
import { Home, User, ArrowLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser } from "@/context/user-context"

interface BottomNavProps {
  showBackButton?: boolean
  currentPage?: "home" | "profile"
  className?: string
}

export function BottomNav({ showBackButton = true, currentPage, className }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading } = useUser()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  // Определяем iOS устройство один раз при монтировании компонента
  const [isIOS, setIsIOS] = useState(false)
  
  // Определяем iOS при монтировании компонента
  useEffect(() => {
    const iosDetected = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iosDetected);
    console.log('iOS устройство:', iosDetected ? 'Да' : 'Нет');
  }, []);

  // Проверяем активные пути
  const isHomeActive = currentPage === "home" || (!currentPage && pathname === "/home")
  const isProfileActive = currentPage === "profile" || (!currentPage && pathname === "/profile")
  const shouldShowBackButton = !pathname.startsWith("/home") && showBackButton

  // Очищаем hoveredButton при изменении пути
  useEffect(() => {
    setHoveredButton(null);
    setIsNavigating(false);
    
    return () => {
      setIsNavigating(false);
      setHoveredButton(null);
    };
  }, [pathname]);

  // Логирование для отладки
  useEffect(() => {
    console.log('Current path:', pathname);
    console.log('Navigation state:', isNavigating);
    if (!isIOS) {
      console.log('Hovered button:', hoveredButton);
    }
  }, [pathname, isNavigating, hoveredButton, isIOS]);

  // Функция для установки состояния hoveredButton только на не-iOS устройствах
  const setHoveredButtonSafe = (button: string | null) => {
    if (!isIOS) {
      setHoveredButton(button);
    }
  };

  const handleNavigation = (handler: () => void) => async (e: React.MouseEvent) => {
    if (isLoading || isNavigating) return // Предотвращаем двойную навигацию
    
    setIsNavigating(true)
    
    try {
      await handler()
      // Добавляем небольшую задержку перед сбросом состояния
      setTimeout(() => {
        setIsNavigating(false)
      }, 500)
    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
    }
  }

  const forceNavigation = (url: string) => {
    console.log(`Запуск навигации на ${url}`);
    
    // Помечаем, что навигация началась
    setIsNavigating(true);
    
    try {
      // Сначала пробуем через router.push
      router.push(url);
      
      // Даже если router.push не выбросил исключение, можем проверить,
      // действительно ли произошла навигация через небольшой таймаут
      setTimeout(() => {
        if (window.location.pathname !== url) {
          console.log(`Резервная навигация на ${url}`);
          // Если навигация не произошла, используем window.location
          window.location.href = url;
        }
        
        // В любом случае, сбрасываем флаг навигации после попытки
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      }, 100);
    } catch (error) {
      console.error('Ошибка навигации:', error);
      
      // В случае ошибки, используем прямую навигацию
      window.location.href = url;
      
      // Сбрасываем флаг навигации
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }
  };

  const handleBack = async () => {
    try {
      // Проверяем, находимся ли мы на странице с ошибкой направления
      if (pathname.includes('referral-not-found')) {
        // Если да, перенаправляем на домашнюю страницу
        forceNavigation('/home');
      } else {
        // Просто используем стандартную навигацию назад
        router.back();
      }
    } catch (error) {
      console.error('Ошибка при возврате назад:', error);
      // Запасной вариант - перенаправление на домашнюю страницу
      forceNavigation('/home');
    }
  }

  const handleHomeClick = async () => {
    forceNavigation("/home");
  }

  const handleProfileClick = async () => {
    forceNavigation("/profile");
  }

  // Для не-iOS устройств добавляем эффект hover с помощью классов
  const hoverClass = !isIOS ? "hover:bg-[#8DCECA]" : "";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[342px] h-[67px] bg-white",
        "shadow-[0px_1px_6.5px_3px_rgba(141,206,202,0.15)]",
        "rounded-[100px] flex justify-between items-center px-6",
        "z-50",
        className,
      )}
    >
      {/* Кнопка Главная */}
      <button
        className={cn(
          "flex flex-col items-center justify-center w-[96px] h-[51px] rounded-[100px]",
          (isLoading || isNavigating) ? "pointer-events-none opacity-50" : "",
          hoverClass // Применяем hover эффект только для не-iOS
        )}
        onClick={handleNavigation(handleHomeClick)}
        onMouseEnter={() => setHoveredButtonSafe("home")}
        onMouseLeave={() => setHoveredButtonSafe(null)}
        tabIndex={0}
        role="button"
        aria-label="Главная"
      >
        <Home
          className={cn(
            "home-icon w-[30px] h-[30px]",
            "stroke-[#8DCECA]",
            (!isIOS && hoveredButton === "home") ? "stroke-white" : ""
          )}
          strokeWidth={4}
        />
        <span
          className={cn(
            "nav-text",
            "text-[#8DCECA]",
            (!isIOS && hoveredButton === "home") ? "text-white" : ""
          )}
        >
          Главная
        </span>
      </button>

      {/* Кнопка Профиль */}
      <button
        className={cn(
          "flex flex-col items-center justify-center w-[96px] h-[51px] rounded-[100px]",
          (isLoading || isNavigating) ? "pointer-events-none opacity-50" : "",
          hoverClass // Применяем hover эффект только для не-iOS
        )}
        onClick={handleNavigation(handleProfileClick)}
        onMouseEnter={() => setHoveredButtonSafe("profile")}
        onMouseLeave={() => setHoveredButtonSafe(null)}
        tabIndex={0}
        role="button"
        aria-label="Профиль"
      >
        <User
          className={cn(
            "profile-icon w-[29px] h-[29px]",
            "stroke-[#8DCECA]",
            (!isIOS && hoveredButton === "profile") ? "stroke-white" : ""
          )}
          strokeWidth={4}
        />
        <span
          className={cn(
            "nav-text",
            "text-[#8DCECA]",
            (!isIOS && hoveredButton === "profile") ? "text-white" : ""
          )}
        >
          Профиль
        </span>
      </button>

      {/* Кнопка Назад */}
      {shouldShowBackButton && (
        <button
          className={cn(
            "flex flex-col items-center justify-center w-[96px] h-[51px] rounded-[100px]",
            (isLoading || isNavigating) ? "pointer-events-none opacity-50" : "",
            hoverClass // Применяем hover эффект только для не-iOS
          )}
          onClick={handleNavigation(handleBack)}
          onMouseEnter={() => setHoveredButtonSafe("back")}
          onMouseLeave={() => setHoveredButtonSafe(null)}
          tabIndex={0}
          role="button"
          aria-label="Назад"
        >
          <ArrowLeft
            className={cn(
              "back-icon w-[31px] h-[31px]",
              "stroke-[#8DCECA]",
              (!isIOS && hoveredButton === "back") ? "stroke-white" : ""
            )}
            strokeWidth={4}
          />
          <span
            className={cn(
              "nav-text",
              "text-[#8DCECA]",
              (!isIOS && hoveredButton === "back") ? "text-white" : ""
            )}
          >
            Назад
          </span>
        </button>
      )}
    </div>
  )
}

