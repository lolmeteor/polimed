"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Интерфейс для проверки авторизации
interface AuthCheckResult {
  isAuthenticated: boolean
  hasMultipleProfiles: boolean
}

export default function RedirectHandler() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // В реальном приложении здесь будет запрос к API для проверки авторизации
        // Имитируем задержку сети
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Для демонстрации предположим, что пользователь авторизован
        // и у него только один профиль
        const authResult: AuthCheckResult = {
          isAuthenticated: true,
          hasMultipleProfiles: false,
        }

        if (authResult.isAuthenticated) {
          if (authResult.hasMultipleProfiles) {
            // Если у пользователя несколько профилей, перенаправляем на страницу выбора профиля
            router.push("/number-found")
          } else {
            // Если у пользователя один профиль, перенаправляем на домашнюю страницу
            router.push("/home")
          }
        } else {
          // Если пользователь не авторизован, перенаправляем на страницу авторизации
          router.push("/auth")
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error)
        // В случае ошибки перенаправляем на страницу авторизации
        router.push("/auth")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthStatus()
  }, [router])

  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DCECA]"></div>
      </div>
    )
  }

  return null
}

