// Определение типов для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          auth_date: number
          hash: string
          query_id?: string
          start_param?: string
        }
        ready: () => void
        expand: () => void
        close: () => void
        isVersionAtLeast: (version: string) => boolean
        openTelegramLink: (url: string) => void
        openLink: (url: string) => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive: boolean) => void
          hideProgress: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          setText: (text: string) => void
        }
        // Добавляем метод requestContact
        requestContact: (callback: (success: boolean) => void) => void
      }
    }
  }
}

// Проверка, открыто ли приложение в Telegram
export function isTelegramWebApp(): boolean {
  return typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
}

// Инициализация Telegram WebApp
export function initTelegramWebApp(): void {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.ready()
    window.Telegram.WebApp.expand()
  }
}

// Получение данных пользователя из Telegram
export function getTelegramUser() {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initDataUnsafe.user
  }
  return null
}

// Запрос контакта пользователя через Telegram WebApp
export function requestContact(callback: (success: boolean) => void): void {
  if (isTelegramWebApp() && window.Telegram.WebApp.requestContact) {
    window.Telegram.WebApp.requestContact(callback)
  } else {
    // Если метод не поддерживается, вызываем callback с false
    callback(false)
  }
}

// Форматирование номера телефона
export function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы
  let digits = phone.replace(/\D/g, "")

  // Если номер начинается с 8 или 7, заменяем на 7
  if (digits.startsWith("8")) {
    digits = "7" + digits.substring(1)
  }

  // Если номер не начинается с 7, добавляем 7 в начало
  if (!digits.startsWith("7") && digits.length <= 10) {
    digits = "7" + digits
  }

  // Убеждаемся, что у нас есть 11 цифр
  if (digits.length < 11) {
    digits = digits.padEnd(11, "0")
  } else if (digits.length > 11) {
    digits = digits.substring(0, 11)
  }

  // Форматируем номер в виде +7 (XXX) XXX-XX-XX
  return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`
}

