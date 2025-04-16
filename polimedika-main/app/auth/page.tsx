"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { useUser } from "@/context/user-context"
import { ConsentForm } from "@/components/consent-form"
import { isTelegramWebApp, initTelegramWebApp, getTelegramUser, requestContact } from "@/lib/telegram"
import type { UserProfile } from "@/types/user"

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConsentForm, setShowConsentForm] = useState(true)
  const [showContactRequest, setShowContactRequest] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const router = useRouter()
  const { saveUserPhone, saveTelegramId, setAvailableProfiles, setUserProfile } = useUser()

  // Инициализируем Telegram WebApp
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp()
    }
  }, [])

  // Проверяем, было ли уже дано согласие
  useEffect(() => {
    // Проверяем, было ли уже дано согласие
    const hasConsent = localStorage.getItem("dataConsent") === "true"

    // Показываем форму согласия или запрос контакта в зависимости от наличия согласия
    if (hasConsent) {
      setShowConsentForm(false)
      setShowContactRequest(true)
    }
  }, [])

  // Получаем Telegram ID пользователя
  useEffect(() => {
    const telegramUser = getTelegramUser()
    if (telegramUser) {
      saveTelegramId(telegramUser.id)
      console.log("Telegram ID сохранен:", telegramUser.id)
    }
  }, [saveTelegramId])

  // Функция для периодической проверки статуса авторизации
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const checkAuthStatus = async () => {
      if (!checkingAuth) return

      try {
        const telegramId = getTelegramId()
        if (!telegramId) {
          console.error("Telegram ID не найден")
          return
        }

        const response = await fetch("/api/check-auth-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegramId }),
        })

        if (!response.ok) {
          throw new Error(`Ошибка при проверке статуса авторизации: ${response.status}`)
        }

        const data = await response.json()
        console.log("Статус авторизации:", data)

        if (data.authenticated) {
          // Сохраняем номер телефона
          saveUserPhone(data.phoneNumber)

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

          // Останавливаем проверку
          setCheckingAuth(false)
          if (intervalId) clearInterval(intervalId)
        }
      } catch (error) {
        console.error("Ошибка при проверке статуса авторизации:", error)
      }
    }

    if (checkingAuth) {
      // Проверяем статус сразу
      checkAuthStatus()

      // Затем проверяем каждые 3 секунды
      intervalId = setInterval(checkAuthStatus, 3000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [checkingAuth, router, saveUserPhone, setAvailableProfiles, setUserProfile])

  const handleConsent = () => {
    // Сохраняем информацию о согласии
    try {
      localStorage.setItem("dataConsent", "true")
      localStorage.setItem("dataConsentDate", new Date().toISOString())
    } catch (error) {
      console.error("Ошибка при сохранении согласия:", error)
    }

    // Переходим к запросу контакта
    setShowConsentForm(false)
    setShowContactRequest(true)
  }

  const handleDecline = () => {
    // Показываем сообщение о необходимости согласия
    setError("Для использования приложения необходимо дать согласие на обработку персональных данных")
    setShowConsentForm(false)
  }

  const handleRequestContact = () => {
    setIsLoading(true)
    setError(null)

    try {
      // Получаем Telegram ID пользователя
      const telegramUser = getTelegramUser()
      if (!telegramUser) {
        throw new Error("Не удалось получить данные пользователя Telegram")
      }

      // Запрашиваем контакт через Telegram WebApp API
      requestContact((success) => {
        if (success) {
          console.log("Контакт успешно запрошен")
          // Начинаем проверять статус авторизации
          setCheckingAuth(true)
        } else {
          console.error("Пользователь отказался предоставить контакт или метод не поддерживается")
          setError("Не удалось получить контакт. Пожалуйста, попробуйте еще раз.")
        }
        setIsLoading(false)
      })
    } catch (error) {
      console.error("Ошибка при запросе контакта:", error)
      setError(error instanceof Error ? error.message : "Произошла ошибка при запросе контакта")
      setIsLoading(false)
    }
  }

  // Вспомогательная функция для получения Telegram ID
  const getTelegramId = (): number | null => {
    const telegramUser = getTelegramUser()
    if (telegramUser) {
      return telegramUser.id
    }

    // Если не удалось получить из WebApp, пробуем из localStorage
    try {
      const id = localStorage.getItem("telegramId")
      return id ? Number.parseInt(id, 10) : null
    } catch (error) {
      console.error("Ошибка при получении Telegram ID из localStorage:", error)
      return null
    }
  }

  return (
    <main className="flex flex-col min-h-[calc(100vh-120px)]">
      <AdaptiveContainer withPadding={false} className="px-4 sm:px-page-x pt-4 sm:pt-page-y">
        <h1 className="text-xl sm:text-[24px] leading-[29px] font-semibold text-txt-primary mb-8">
          {showConsentForm ? "Согласие на обработку данных" : "Авторизация через Telegram"}
        </h1>

        {showConsentForm && <ConsentForm onConsent={handleConsent} onDecline={handleDecline} />}

        {showContactRequest && (
          <div className="mb-8">
            <p className="text-[14px] leading-[20px] text-txt-secondary mb-6">
              Для использования приложения необходимо предоставить номер телефона, который зарегистрирован в&nbsp;клинике
              "Полимедика". Это позволит нам идентифицировать вас и&nbsp;предоставить доступ к&nbsp;вашим медицинским данным.
            </p>
            <button
              onClick={handleRequestContact}
              disabled={isLoading || checkingAuth}
              className="w-full sm:w-[300px] h-[50px] rounded-btn font-semibold text-[16px] text-center transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Загрузка..." : checkingAuth ? "Проверка..." : "Предоставить номер телефона"}
            </button>

            {checkingAuth && (
              <div className="mt-4">
                <p className="text-[14px] leading-[20px] text-txt-secondary">
                  Пожалуйста, подождите, мы&nbsp;проверяем ваш номер телефона...
                </p>
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && !showConsentForm && !showContactRequest && (
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
                  setShowContactRequest(true)
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

