'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          }
        };
        ready: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
          isActive: boolean;
          isVisible: boolean;
          isProgressVisible: boolean;
        }
        close: () => void;
        expand: () => void;
      }
    }
  }
}

export default function TelegramAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Инициализируем Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const { WebApp } = window.Telegram;
      
      WebApp.ready();
      
      // Расширяем мини-приложение на весь экран
      WebApp.expand();
      
      // Получаем ID пользователя из данных WebApp
      const { user } = WebApp.initDataUnsafe;
      
      if (user) {
        setUserId(user.id);
        checkContact(user.id);
      } else {
        setError('Не удалось получить данные пользователя');
        setIsLoading(false);
      }
    } else {
      setError('Это приложение должно открываться из Telegram');
      setIsLoading(false);
    }
  }, []);

  // Проверяем, сохранен ли контакт пользователя
  const checkContact = async (telegramId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/telegram-contact?telegramId=${telegramId}`);
      const data = await response.json();
      
      if (data.found) {
        setContact(data);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при проверке контакта:', error);
      setError('Не удалось проверить статус авторизации');
      setIsLoading(false);
    }
  }

  // Обработка нажатия на кнопку "Отправить контакт"
  const handleSendContact = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Здесь бот автоматически запросит контакт у пользователя
      // и отправит его через вебхук
      // Мы перенаправляем пользователя на страницу ожидания
      router.push('/telegram-auth/waiting');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-brand mb-6">Авторизация Полимедика</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Проверка авторизации...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : contact ? (
          <div className="text-center py-4">
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              <p className="font-semibold">Вы успешно авторизованы!</p>
              <p>Телефон: {contact.phoneNumber}</p>
            </div>
            <Link 
              href="/" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Перейти в приложение
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-700 mb-6">
              Для использования приложения необходимо предоставить доступ к номеру телефона.
            </p>
            <button 
              onClick={handleSendContact}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Отправить контакт
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 