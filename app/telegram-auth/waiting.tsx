'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WaitingPage() {
  const router = useRouter();
  const [counter, setCounter] = useState(20);
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    // Инициализируем Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const { WebApp } = window.Telegram;
      
      // Получаем ID пользователя из данных WebApp
      const { user } = WebApp.initDataUnsafe;
      
      if (user) {
        setUserId(user.id);
      }
    }
  }, []);
  
  // Проверка контакта и обратный отсчет
  useEffect(() => {
    if (!userId) return;
    
    // Интервал для проверки статуса контакта
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/telegram-contact?telegramId=${userId}`);
        const data = await response.json();
        
        if (data.found) {
          clearInterval(checkInterval);
          router.replace('/telegram-auth');
        }
      } catch (error) {
        console.error('Ошибка при проверке контакта:', error);
      }
    }, 2000);
    
    // Обратный отсчет
    const countdownInterval = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          clearInterval(checkInterval);
          router.replace('/telegram-auth');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(checkInterval);
      clearInterval(countdownInterval);
    };
  }, [userId, router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Авторизация</h1>
        
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{counter}</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">
          Пожалуйста, подтвердите доступ к контакту в Telegram...
        </p>
        
        <p className="text-sm text-gray-500">
          Если вы не видите запрос на доступ к контакту, отправьте команду /start в чат с ботом.
        </p>
      </div>
    </div>
  );
} 