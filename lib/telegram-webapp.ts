/**
 * Утилиты для работы с Telegram WebApp API
 */

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
          };
        };
        ready: () => void;
        close: () => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        onEvent: (eventType: string, callback: (event: any) => void) => void;
        offEvent: (eventType: string, callback: (event: any) => void) => void;
      };
    };
  }
}

/**
 * Проверяет, запущено ли приложение в Telegram WebApp
 */
export const isTelegramWebApp = (): boolean => {
  try {
    return window && window.Telegram && window.Telegram.WebApp !== undefined;
  } catch (error) {
    console.warn('Ошибка при проверке Telegram WebApp:', error);
    return false;
  }
};

/**
 * Получает информацию о пользователе из WebApp
 */
export const getTelegramUser = (): {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
} | null => {
  try {
    if (!isTelegramWebApp()) return null;

    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name
    };
  } catch (error) {
    console.warn('Ошибка при получении данных пользователя Telegram:', error);
    return null;
  }
};

/**
 * Показывает всплывающее сообщение в Telegram WebApp
 */
export const showTelegramAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (!isTelegramWebApp()) {
        console.warn('Telegram WebApp не доступен для показа сообщения:', message);
        alert(message);
        resolve();
        return;
      }

      window.Telegram.WebApp.showAlert(message, () => {
        resolve();
      });
    } catch (error) {
      console.error('Ошибка при показе Telegram Alert:', error);
      alert(`${message} (Резервный alert - Telegram WebApp недоступен)`);
      resolve();
    }
  });
};

/**
 * Показывает диалог подтверждения в Telegram WebApp
 */
export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (!isTelegramWebApp()) {
        console.warn('Telegram WebApp не доступен для показа подтверждения:', message);
        const result = confirm(message);
        resolve(result);
        return;
      }

      window.Telegram.WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    } catch (error) {
      console.error('Ошибка при показе Telegram Confirm:', error);
      const result = confirm(`${message} (Резервный confirm - Telegram WebApp недоступен)`);
      resolve(result);
    }
  });
};

/**
 * Настраивает главную кнопку Telegram WebApp
 */
export const setupMainButton = (
  text: string,
  onClick: () => void,
  color?: string,
  textColor?: string
): void => {
  try {
    if (!isTelegramWebApp()) {
      console.warn('Telegram WebApp не доступен для настройки кнопки');
      return;
    }

    const button = window.Telegram.WebApp.MainButton;
    button.setText(text);
    
    if (color) {
      button.color = color;
    }
    
    if (textColor) {
      button.textColor = textColor;
    }
    
    button.onClick(onClick);
    button.show();
  } catch (error) {
    console.error('Ошибка при настройке MainButton:', error);
  }
};

/**
 * Закрывает Telegram WebApp
 */
export const closeTelegramWebApp = (): void => {
  try {
    if (!isTelegramWebApp()) {
      console.warn('Telegram WebApp не доступен для закрытия');
      return;
    }
    
    window.Telegram.WebApp.close();
  } catch (error) {
    console.error('Ошибка при закрытии Telegram WebApp:', error);
  }
};

/**
 * Инициализирует Telegram WebApp
 */
export const initTelegramWebApp = (): void => {
  try {
    if (!isTelegramWebApp()) {
      console.warn('Telegram WebApp не доступен для инициализации');
      return;
    }
    
    // Сообщаем Telegram, что приложение готово
    window.Telegram.WebApp.ready();
    
    // Добавляем обработчики ошибок для WebSockets
    window.addEventListener('error', (event) => {
      if (event.message && (
          event.message.includes('WebSocket') || 
          event.message.includes('Socket') ||
          event.message.includes('connection')
        )) {
        console.warn('Перехвачена ошибка WebSocket:', event.message);
        // Предотвращаем показ ошибки пользователю
        event.preventDefault();
      }
    });
    
    console.log('Telegram WebApp успешно инициализирован');
  } catch (error) {
    console.error('Ошибка при инициализации Telegram WebApp:', error);
  }
};

export default {
  isTelegramWebApp,
  getTelegramUser,
  showTelegramAlert,
  showTelegramConfirm,
  setupMainButton,
  closeTelegramWebApp,
  initTelegramWebApp
}; 