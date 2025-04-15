"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckIcon } from "lucide-react"
import { AdaptiveContainer } from "@/components/adaptive-container"
import type { UserProfile } from "@/types/user"
import { useUser } from "@/context/user-context"

export default function NumberFound() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const router = useRouter()

  // Получаем все необходимые функции и данные из контекста
  const {
    setUserProfile,
    setAvailableProfiles,
    getUserPhone,
    availableProfiles, // Добавляем получение списка профилей из контекста
    isLoading, // Используем состояние загрузки из контекста
  } = useUser()

  // Загружаем профили только если их еще нет в контексте
  useEffect(() => {
    const fetchProfiles = async () => {
      // Если профили уже загружены, не делаем повторный запрос
      if (availableProfiles.length > 0) {
        // Удаляем автоматический выбор первого профиля
        return
      }

      try {
        const savedPhone = getUserPhone()

        // This is mock data - in a real app, you would fetch from an API
        const mockProfiles: UserProfile[] = [
          {
            id: "1",
            fullName: "Антонов Алексей Юрьевич",
            firstName: "Алексей",
            patronymic: "Юрьевич",
            lastName: "Антонов",
            birthDate: "10 / 10 / 1988",
            age: 36,
            phone: savedPhone,
          },
          {
            id: "2",
            fullName: "Антонов Юрий Анатольевич",
            firstName: "Юрий",
            patronymic: "Анатольевич",
            lastName: "Антонов",
            birthDate: "12 / 03 / 1949",
            age: 76,
            phone: savedPhone,
          },
          {
            id: "3",
            fullName: "Антонова Мария Сергеевна",
            firstName: "Мария",
            patronymic: "Сергеевна",
            lastName: "Антонова",
            birthDate: "05 / 07 / 1992",
            age: 32,
            phone: savedPhone,
          },
          {
            id: "4",
            fullName: "Антонов Сергей Петрович",
            firstName: "Сергей",
            patronymic: "Петрович",
            lastName: "Антонов",
            birthDate: "15 / 03 / 1975",
            age: 49,
            phone: savedPhone,
          },
        ]

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Сохраняем список профилей в контексте
        setAvailableProfiles(mockProfiles)

        // Удаляем автоматический выбор первого профиля
      } catch (error) {
        console.error("Error fetching profiles:", error)
      }
    }

    fetchProfiles()
  }, [availableProfiles.length, getUserPhone, setAvailableProfiles])

  const handleProfileSelect = (profileId: string) => {
    console.log("Выбран профиль с ID:", profileId);
    setSelectedProfileId(profileId);
    
    // Находим выбранный профиль
    const selectedProfile = availableProfiles.find((profile) => profile.id === profileId);
    if (selectedProfile) {
      console.log("Сохраняем профиль:", selectedProfile);
      // Сохраняем выбранный профиль в контексте
      setUserProfile(selectedProfile);
    }
  };

  // Функция для проверки, выбран ли профиль
  const isProfileSelected = (profileId: string) => {
    return selectedProfileId === profileId;
  };

  const handleContinue = () => {
    if (selectedProfileId) {
      // Перенаправляем на домашнюю страницу
      router.push("/home")
    }
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white">
      {/* Шапка с логотипом */}
      <div className="relative w-full h-[120px]">
        <div className="absolute left-[54px] top-[82px] w-[169px] h-[36px]">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%9F%D0%BE%D0%BB%D0%B8%D0%BC%D0%B5%D0%B4%D0%B8%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B7%D1%80%D0%B0%D1%87%201-ODxZYD4yDlA6j4HxCXp3Q0urrX6KQK.svg"
            alt="Полимедика"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Основной контент */}
      <AdaptiveContainer className="pb-[100px]">
        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="font-semibold text-xl sm:text-[24px] leading-[29px] text-txt-primary">
            Ваш номер
            <br />
            найден
          </h1>
        </div>

        {/* Иконка успеха */}
        <div className="mb-6">
          <div className="w-6 h-6 rounded-full border-2 border-brand flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-brand" />
          </div>
        </div>

        {/* Текст сообщения */}
        <div className="mb-8">
          <p className="font-medium text-[14px] leading-[122.28%] text-txt-secondary">
            Ваш номер привязан к нескольким профилям, пожалуйста, выберите, нужный профиль
          </p>
        </div>

        {/* Список профилей */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[270px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {availableProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`box-border w-full h-auto sm:h-[135px] rounded-crd p-4 cursor-pointer transition-colors duration-200 ${
                  isProfileSelected(profile.id) ? "bg-brand border-2 border-brand" : "bg-white border-2 border-brand"
                }`}
                onClick={() => handleProfileSelect(profile.id)}
              >
                <h2
                  className={`font-semibold text-[16px] leading-[20px] mb-4 ${
                    isProfileSelected(profile.id) ? "text-white" : "text-txt-primary"
                  }`}
                >
                  {profile.fullName}
                </h2>
                <p
                  className={`font-medium text-[16px] leading-[20px] mb-2 ${
                    isProfileSelected(profile.id) ? "text-white" : "text-txt-primary"
                  }`}
                >
                  {profile.birthDate}
                </p>
                <p
                  className={`font-medium text-[12px] leading-[15px] ${
                    isProfileSelected(profile.id) ? "text-white" : "text-txt-secondary"
                  }`}
                >
                  {profile.age} лет
                </p>
              </div>
            ))}

            {/* Кнопка продолжить с эффектом наведения */}
            {availableProfiles.length > 0 && (
              <button
                onClick={handleContinue}
                disabled={!selectedProfileId}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className={`mt-6 w-full h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200 border-2 
                  ${!selectedProfileId 
                    ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : isButtonHovered 
                      ? "border-brand bg-brand text-white" 
                      : "border-brand bg-white text-txt-primary"}`}
              >
                Продолжить
              </button>
            )}

            {/* Ссылка на адреса филиалов */}
            <div className="mt-16 text-center">
              <Link href="/branches" className="font-medium text-[13px] leading-[16px] text-txt-primary underline">
                Адреса филиалов
              </Link>
            </div>
          </div>
        )}
      </AdaptiveContainer>
    </div>
  )
}

