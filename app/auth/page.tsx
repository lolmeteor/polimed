"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { useUser } from "@/context/user-context"
import { ConsentForm } from "@/components/consent-form"
import { PhoneInputForm } from "@/components/phone-input-form"
import type { UserProfile } from "@/types/user"

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConsentForm, setShowConsentForm] = useState(true)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const router = useRouter()
  const { saveUserPhone, setAvailableProfiles, setUserProfile } = useUser()

  // Проверяем, было ли уже дано согласие
  useEffect(() => {
    // Проверяем, было ли уже дано согласие
    const hasConsent = localStorage.getItem("dataConsent") === "true"

    // Показываем форму согласия или форму ввода номера в зависимости от наличия согласия
    if (hasConsent) {
      setShowConsentForm(false)
      setShowPhoneForm(true)
    }
  }, [])

  const handleConsent = () => {
    // Сохраняем информацию о согласии
    try {
      localStorage.setItem("dataConsent", "true")
      localStorage.setItem("dataConsentDate", new Date().toISOString())
    } catch (error) {
      console.error("Ошибка при сохранении согласия:", error)
    }

    // Переходим к форме ввода номера
    setShowConsentForm(false)
    setShowPhoneForm(true)
  }

  const handleDecline = () => {
    // Показываем сообщение о необходимости согласия
    setError("Для использования приложения необходимо дать согласие на обработку персональных данных")
    setShowConsentForm(false)
  }

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Отправка номера телефона:", phoneNumber)
      
      // Отправляем запрос на проверку номера телефона
      const response = await fetch("/api/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error(`Ошибка при проверке номера телефона: ${response.status}`)
      }

      const data = await response.json()
      console.log("Результат проверки номера:", data)

      if (data.exists) {
        // Сохраняем номер телефона
        saveUserPhone(phoneNumber)

        // Сохраняем состояние авторизации
        localStorage.setItem("isAuthenticated", "true")

        // Если есть профили, сохраняем их
        if (data.profiles && data.profiles.length > 0) {
          // Сохраняем профили как есть, без изменения ID
          setAvailableProfiles(data.profiles)

          // Если только один профиль, сохраняем его и перенаправляем на домашнюю страницу
          if (data.profiles.length === 1) {
            setUserProfile(data.profiles[0])
            router.push("/home")
          } else {
            // Если несколько профилей, перенаправляем на страницу выбора профиля
            router.push("/number-found")
          }
        } else {
          // Если профили не найдены
          router.push("/number-not-found")
        }
      } else {
        setError(data.message || "Номер телефона не найден в системе клиники")
      }
    } catch (error) {
      console.error("Ошибка при проверке номера телефона:", error)
      setError(error instanceof Error ? error.message : "Произошла ошибка при проверке номера телефона")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col min-h-[calc(100vh-120px)]">
      <AdaptiveContainer withPadding={false} className="px-4 sm:px-page-x pt-4 sm:pt-page-y">
        <h1 className="text-xl sm:text-[24px] leading-[29px] font-semibold text-txt-primary mb-8">
          {showConsentForm ? "Согласие на обработку данных" : "Авторизация"}
        </h1>

        {showConsentForm && <ConsentForm onConsent={handleConsent} onDecline={handleDecline} />}

        {showPhoneForm && (
          <div className="mb-8">
            <p className="text-[14px] leading-[20px] text-txt-secondary mb-6">
              Для использования приложения необходимо указать номер телефона, который зарегистрирован в&nbsp;клинике
              "Полимедика". Это позволит нам идентифицировать вас и&nbsp;предоставить доступ к&nbsp;вашим медицинским данным.
            </p>
            <PhoneInputForm onSubmit={handlePhoneSubmit} isLoading={isLoading} />
          </div>
        )}

        {error && !showConsentForm && !showPhoneForm && (
          <div className="mt-4">
            <p className="text-brand-error text-[14px] mb-4">{error}</p>
            {error.includes("согласие") ? (
              <button
                onClick={() => setShowConsentForm(true)}
                className="w-full sm:w-[275px] h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white"
              >
                Вернуться к форме согласия
              </button>
            ) : (
              <button
                onClick={() => {
                  setError(null)
                  setShowPhoneForm(true)
                }}
                className="w-full sm:w-[275px] h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white"
              >
                Повторить
              </button>
            )}
          </div>
        )}
      </AdaptiveContainer>
    </main>
  )
}

