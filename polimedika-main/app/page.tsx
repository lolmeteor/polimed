"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Компонент загрузки
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DCECA]"></div>
    </div>
  )
}

export default function Home() {
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

