"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { useUser } from "@/context/user-context"
import { ConsentForm } from "@/components/consent-form"
import { isTelegramWebApp, initTelegramWebApp, getTelegramUser } from "@/lib/telegram"
import type { UserProfile } from "@/types/user"

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConsentForm, setShowConsentForm] = useState(true)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isChecking, setIsChecking] = useState(false)
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

    // Показываем форму согласия или форму ввода номера в зависимости от наличия согласия
    if (hasConsent) {
      setShowConsentForm(false)
      setShowPhoneForm(true)
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

  // Функция для форматирования номера телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы, кроме +
    const cleaned = value.replace(/[^\d+]/g, "");
    
    // Проверяем, начинается ли номер с +
    const hasPlus = cleaned.startsWith("+");
    
    // Если номер пустой, возвращаем пустую строку
    if (cleaned.length === 0) {
      return "";
    }
    
    // Если номер начинается с +, форматируем его
    if (hasPlus) {
      // Получаем только цифры
      const digits = cleaned.substring(1);
      
      // Форматируем в зависимости от количества цифр
      if (digits.length <= 1) {
        return `+${digits}`;
      } else if (digits.length <= 4) {
        return `+${digits.substring(0, 1)} (${digits.substring(1)}`;
      } else if (digits.length <= 7) {
        return `+${digits.substring(0, 1)} (${digits.substring(1, 4)}) ${digits.substring(4)}`;
      } else if (digits.length <= 9) {
        return `+${digits.substring(0, 1)} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
      } else {
        return `+${digits.substring(0, 1)} (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
      }
    } 
    // Если нет +, то добавляем его и форматируем
    else {
      // Если первая цифра введена, добавляем +
      if (cleaned.length >= 1) {
        return formatPhoneNumber("+" + cleaned);
      }
      return cleaned;
    }
  };

  // Обработчик изменения номера телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Не допускаем более 12 символов (+7 и 10 цифр)
    if (value.replace(/\D/g, "").length <= 11) {
      const formatted = formatPhoneNumber(value);
      setPhoneNumber(formatted);
    }
  };

  // Проверка номера на валидность
  const isValidPhone = () => {
    // Форматы для России +7 (XXX) XXX-XX-XX или для других стран
    const phonePattern = /^\+\d \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return phonePattern.test(phoneNumber);
  };

  // Обработчик отправки формы
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone()) {
      setError("Пожалуйста, введите корректный номер телефона");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsChecking(true);
    
    try {
      const telegramId = getTelegramId();
      
      // Отправляем запрос на проверку номера телефона
      const response = await fetch("/api/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId,
          phoneNumber,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при проверке номера телефона: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Результат проверки номера:", data);
      
      if (data.authenticated) {
        // Сохраняем номер телефона
        saveUserPhone(phoneNumber);
        
        // Сохраняем состояние авторизации
        localStorage.setItem("isAuthenticated", "true");
        
        // Если есть профили, сохраняем их
        if (data.profiles && data.profiles.length > 0) {
          setAvailableProfiles(data.profiles);
          
          // Если только один профиль, сохраняем его и перенаправляем на домашнюю страницу
          if (data.profiles.length === 1) {
            setUserProfile(data.profiles[0]);
            router.push("/home");
          } else {
            // Если несколько профилей, перенаправляем на страницу выбора профиля
            router.push("/number-found");
          }
        } else {
          // Если профили не найдены
          router.push("/number-not-found");
        }
      } else {
        setError("Номер телефона не найден в системе клиники. Пожалуйста, проверьте номер и попробуйте снова.");
      }
    } catch (error) {
      console.error("Ошибка при проверке номера телефона:", error);
      setError(error instanceof Error ? error.message : "Произошла ошибка при проверке номера телефона");
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

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
          {showConsentForm ? "Согласие на обработку данных" : "Авторизация"}
        </h1>

        {showConsentForm && <ConsentForm onConsent={handleConsent} onDecline={handleDecline} />}

        {showPhoneForm && (
          <div className="mb-8">
            <p className="text-[14px] leading-[20px] text-txt-secondary mb-6">
              Для использования приложения необходимо ввести номер телефона, который зарегистрирован в&nbsp;клинике
              "Полимедика". Это позволит нам идентифицировать вас и&nbsp;предоставить доступ к&nbsp;вашим медицинским данным.
            </p>
            
            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-txt-secondary mb-1">
                  Номер телефона
                </label>
                <input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+_ (___) ___-__-__"
                  className="w-full sm:w-[300px] px-4 py-3 border-2 border-brand rounded-crd focus:outline-none focus:ring-2 focus:ring-brand"
                  disabled={isLoading || isChecking}
                  required
                />
                {error && !showConsentForm && (
                  <p className="text-brand-error text-sm mt-1">{error}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading || isChecking || !phoneNumber}
                className="w-full sm:w-[300px] h-[50px] rounded-btn font-semibold text-[16px] text-center transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Загрузка..." : isChecking ? "Проверка..." : "Проверить номер телефона"}
              </button>
            </form>

            {isChecking && (
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

