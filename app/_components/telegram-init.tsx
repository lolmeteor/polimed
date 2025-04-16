"use client";

import { useEffect } from "react";

/**
 * Компонент для инициализации Telegram WebApp и перехвата ошибок
 */
export function TelegramInit() {
  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram WebApp
    const isTelegramWebApp = window && 
      window.Telegram && 
      window.Telegram.WebApp !== undefined;
    
    if (isTelegramWebApp) {
      console.log("Telegram WebApp обнаружен, инициализация...");
      
      try {
        // Сообщаем Telegram, что приложение готово
        window.Telegram.WebApp.ready();
        
        // Добавляем глобальный перехватчик ошибок для подавления ошибок WebSocket
        const originalConsoleError = console.error;
        console.error = function(...args) {
          // Фильтруем ошибки WebSocket
          const errorMessage = args.length > 0 ? String(args[0]) : '';
          if (
            errorMessage.includes('WebSocket') || 
            errorMessage.includes('Socket') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('Not connected')
          ) {
            // Для WebSocket ошибок используем warn вместо error
            console.warn('Подавлена WebSocket ошибка:', ...args);
            return;
          }
          
          // Остальные ошибки обрабатываем как обычно
          originalConsoleError.apply(console, args);
        };
        
        // Подавляем вывод ошибок в консоль для WebSocket
        window.addEventListener('unhandledrejection', (event) => {
          if (
            event.reason && 
            (String(event.reason).includes('WebSocket') || 
             String(event.reason).includes('Socket') ||
             String(event.reason).includes('connection'))
          ) {
            console.warn('Подавлена необработанная WebSocket ошибка:', event.reason);
            event.preventDefault();
          }
        });
      } catch (error) {
        console.warn("Ошибка при инициализации Telegram WebApp:", error);
      }
    } else {
      console.log("Telegram WebApp не обнаружен, работаем в обычном режиме");
    }
    
    return () => {
      // Восстанавливаем оригинальный console.error при размонтировании
      if (window.console && window.console.error !== console.error) {
        console.error = window.console.error;
      }
    };
  }, []);
  
  // Компонент не рендерит ничего в DOM
  return null;
}

export default TelegramInit; 