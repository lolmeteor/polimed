"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Компонент загрузки
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DCECA]"></div>
    </div>
  )
}

// Старый компонент Home переименован в AuthRedirect
function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Проверяем авторизацию пользователя
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    const savedProfile = localStorage.getItem("selectedProfile")
    
    if (isAuthenticated && savedProfile) {
      // Если пользователь авторизован, сразу перенаправляем на домашнюю страницу
      router.push("/home")
    } else {
      // Если не авторизован, перенаправляем на страницу авторизации
      router.push("/auth")
    }
  }, [router])

  // Показываем загрузку, пока проверяем статус и не выполнен редирект
  return <LoadingScreen />
}

// Делаем HomePage основным экспортом
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Поликлиника</h1>
      <p className="text-xl mb-6">Добро пожаловать в систему управления.</p>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link 
          href="/admin"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
        >
          Панель администратора
        </Link>
        
        <Link 
          href="/debug-auth"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-center transition-colors"
        >
          Отладка авторизации
        </Link>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          Для прохождения авторизации используйте Telegram бот или страницу отладки
        </p>
      </div>
    </div>
  );
}

// Экспортируем AuthRedirect как именованный экспорт для возможного использования в других местах
export { AuthRedirect };

