"use client"

import React, { useState, useEffect, useRef } from "react"
import { useUser } from "@/context/user-context"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AppointmentSlot, Appointment } from "@/types/appointment"

// Исправляем типы для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
          query_id?: string;
          start_param?: string;
        };
      };
    };
  }
}

interface AppointmentTicketModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentData: AppointmentSlot | Appointment | null
}

export function AppointmentTicketModal({ isOpen, onClose, appointmentData }: AppointmentTicketModalProps) {
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false)
  const [isSaveButtonHovered, setIsSaveButtonHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)
  const printableAreaRef = useRef<HTMLDivElement>(null)
  const { userProfile, getTelegramId } = useUser()
  const [deliveryMethod, setDeliveryMethod] = useState<'screenshot' | 'chat'>('screenshot')
  const [shortTicketRef] = useState<React.RefObject<HTMLDivElement>>(React.createRef())

  // Определяем, показываем информацию о процедуре или враче
  const isProcedure = appointmentData?.isProcedure || !!appointmentData?.procedureName

  useEffect(() => {
    setMounted(true)
    // Определяем, является ли устройство мобильным
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    return () => setMounted(false)
  }, [])

  // Предотвращаем скролл на заднем фоне при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Сообщаем WebApp, что приложение готово
      window.Telegram.WebApp.ready();
      // Расширяем окно на весь экран
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Добавляем дополнительную проверку на наличие профиля
  if (!mounted || !isOpen) return null

  // Проверка профиля перед отрисовкой
  if (!userProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-[2.6px]" onClick={onClose} />
        <div className="relative w-full max-w-[400px] bg-white border-2 border-brand rounded-crd p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-4">Ошибка</h2>
          <p className="text-txt-secondary mb-6">
            Не удалось загрузить данные профиля. Пожалуйста, авторизуйтесь снова.
          </p>
          <button
            onClick={onClose}
            className="w-full h-[39px] rounded-circle font-bold text-[14px] bg-white text-brand border-2 border-brand hover:bg-brand hover:text-white transition-colors duration-200"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  // Восстанавливаем прежнюю функцию создания изображения
  const createTicketImage = async () => {
    if (!shortTicketRef.current) {
      console.error("Ошибка: элемент талона не найден в DOM");
      throw new Error("Не удалось найти элемент талона");
    }
    
    if (!userProfile || !userProfile.fullName || !userProfile.id) {
      console.error("Ошибка: недостаточно данных профиля", { userProfile });
      throw new Error("Недостаточно данных для создания талона. Проверьте данные профиля.");
    }

    try {
      console.log("Начало создания canvas...");
      const canvas = await html2canvas(shortTicketRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: true,
        useCORS: true,
        allowTaint: false
      });
      
      console.log("Canvas создан успешно");
      
      return new Promise<Blob>((resolve, reject) => {
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              console.log("Blob создан успешно, размер:", blob.size);
              resolve(blob);
            } else {
              console.error("Ошибка: не удалось создать Blob из canvas");
              reject(new Error("Не удалось создать изображение"));
            }
          }, 'image/png', 0.95);
        } catch (error) {
          console.error("Ошибка при конвертации canvas в Blob:", error);
          reject(error);
        }
      });
    } catch (error) {
      console.error("Ошибка при создании изображения:", error);
      throw error;
    }
  };

  // Улучшенная логика отправки талона в чат с улучшенной обработкой ошибок
  const handleSendToChat = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      console.log("Начало отправки талона в чат...");
      
      // Получаем данные пользователя
      const telegramId = getTelegramId();
      console.log("Полученный Telegram ID:", telegramId);
      
      if (!telegramId) {
        throw new Error("Telegram ID не найден. Пожалуйста, авторизуйтесь через Telegram.");
      }
      
      console.log("Начало создания изображения талона...");
      // Создаем изображение талона
      const imageBlob = await createTicketImage();
      console.log("Изображение талона создано, размер:", imageBlob.size);
      
      // Отправляем данные через серверный API
      const formData = new FormData();
      formData.append('chat_id', telegramId.toString());
      formData.append('photo', imageBlob, `Талон_${appointmentData?.ticketNumber || "приема"}.png`);
      formData.append('fileName', `Талон_${appointmentData?.ticketNumber || "приема"}.png`);
      
      console.log("Отправка запроса на сервер...");
      // Используем серверный API эндпоинт с обработкой ошибок сети
      try {
        const response = await fetch('/api/send-telegram-image', {
          method: 'POST',
          body: formData
        });
        
        console.log("Получен ответ от сервера:", response.status);
        const responseData = await response.json();
        console.log("Данные ответа:", responseData);
        
        if (response.ok && responseData.success) {
          console.log("Талон успешно отправлен в Telegram");
          onClose();
        } else {
          const errorMsg = responseData.error || "Ошибка при отправке талона в Telegram";
          console.error("Ошибка при отправке талона:", errorMsg);
          
          // Обработка конкретных ошибок с понятными сообщениями
          if (errorMsg.includes("Токен бота не настроен")) {
            setErrorMessage("Сервис временно недоступен. Пожалуйста, сохраните талон как скриншот или попробуйте позже.");
            toast.error("Сервис отправки временно недоступен");
          } else {
            setErrorMessage(`Произошла ошибка при отправке: ${errorMsg}`);
            toast.error("Не удалось отправить талон в чат");
          }
        }
      } catch (networkError: any) {
        console.error("Ошибка сети при отправке талона:", networkError);
        setErrorMessage("Проблема с интернет-соединением. Пожалуйста, проверьте подключение.");
        toast.error("Проблема с интернет-соединением");
      }
    } catch (error: any) {
      console.error("Детальная информация об ошибке:", {
        message: error.message,
        stack: error.stack,
        error
      });
      setErrorMessage(`Произошла ошибка при отправке талона в чат: ${error.message}`);
      toast.error("Не удалось отправить талон в чат");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (deliveryMethod === 'chat') {
      await handleSendToChat()
    }
    // Для скриншота ничего не делаем, пользователь делает его сам
  }

  return (
    <div className="fixed inset-0" style={{ 
      zIndex: 1001, 
      isolation: 'isolate',
      pointerEvents: 'auto' 
    }}>
      {/* Затемненный фон с размытием */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-[5px]" 
        onClick={onClose} 
        style={{ pointerEvents: 'auto' }}
      />

      {/* Модальное окно */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-white border-2 border-brand rounded-crd shadow-[0px_0px_25.8px_-5px_rgba(141,206,202,0.3)] overflow-hidden"
        style={{ 
          zIndex: 10000, 
          pointerEvents: 'auto' 
        }}
      >
        <div className="max-h-[calc(80vh-160px)] overflow-y-auto">
          <div className="p-4 pb-6" ref={printableAreaRef} data-printable="true">
            {/* Область для отправки в чат */}
            <div ref={ticketRef}>
              {/* Короткая версия талона для отправки в чат */}
              <div 
                ref={shortTicketRef} 
                className="fixed left-[-9999px] top-[-9999px] bg-white"
                style={{ 
                  width: "350px", 
                  maxWidth: "100%", 
                  boxSizing: "border-box",
                  wordWrap: "break-word" 
                }}
              >
                <div className="p-6 bg-white">
                  <h2 className="text-[20px] font-bold text-primary-dark mb-2">
                    Запись на {isProcedure ? "процедуру" : "прием"}
                  </h2>
                  <p className="text-[20px] font-bold text-primary-dark mb-4">{appointmentData?.ticketNumber}</p>

                  <p className="text-[20px] font-bold text-primary-dark mb-2">{appointmentData?.datetime}</p>
                  <p className="text-[14px] text-primary-dark mb-1">Кабинет {appointmentData?.cabinet}</p>
                  <p className="text-[14px] text-primary-dark mb-2" style={{ 
                    wordWrap: "break-word", 
                    overflowWrap: "break-word", 
                    whiteSpace: "pre-line" 
                  }}>
                    {appointmentData?.address?.replace(/(ул\.|пр\.|пер\.|д\.|кв\.|корп\.) /g, '$1\u00A0')}
                  </p>
                  
                  {isProcedure ? (
                    <p className="text-[14px] text-primary-dark mb-4" style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                      Процедура: {appointmentData?.procedureName || appointmentData?.doctorSpecialty}
                    </p>
                  ) : (
                    <p className="text-[14px] text-primary-dark mb-4" style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                      <span>{appointmentData?.doctorSpecialty}</span>
                      {appointmentData?.doctorName && (
                        <>
                          <span className="mx-1">-</span>
                          <span className="block sm:inline">{appointmentData?.doctorName}</span>
                        </>
                      )}
                    </p>
                  )}

                  <p className="text-[14px] text-primary-dark mb-1">Пациент</p>
                  <p className="text-[16px] font-medium text-primary-dark">{userProfile.fullName}</p>
                  <p className="text-[16px] font-medium text-primary-dark">{userProfile.id}</p>
                </div>
              </div>

              {/* Полная версия талона для отображения в модальном окне */}
              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-brand-dark">
                  Запись на {isProcedure ? "процедуру" : "прием"}
                </h2>
                <p className="text-[16px] font-bold text-brand-dark">{appointmentData?.ticketNumber}</p>
              </div>

              <div className="mb-4">
                <p className="text-[14px] font-bold text-brand-dark">{appointmentData?.datetime}</p>
                <p className="text-[14px] font-medium text-brand-dark">Кабинет {appointmentData?.cabinet}</p>
                <p className="text-[12px] font-medium text-txt-secondary mb-2" style={{ 
                  wordWrap: "break-word", 
                  overflowWrap: "break-word", 
                  whiteSpace: "pre-line" 
                }}>
                  {appointmentData?.address?.replace(/(ул\.|пр\.|пер\.|д\.|кв\.|корп\.) /g, '$1\u00A0')}
                </p>
                
                {isProcedure ? (
                  <p className="text-[12px] font-medium text-txt-secondary mb-4" style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                    Процедура: {appointmentData?.procedureName || appointmentData?.doctorSpecialty}
                  </p>
                ) : (
                  <p className="text-[12px] font-medium text-txt-secondary mb-4" style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                    <span>{appointmentData?.doctorSpecialty}</span>
                    {appointmentData?.doctorName && (
                      <>
                        <span className="mx-1">-</span>
                        <span className="block sm:inline">{appointmentData?.doctorName}</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="w-full h-[1px] bg-brand mb-4" />

              <div>
                <p className="text-[12px] font-medium text-txt-secondary">Пациент</p>
                <p className="text-[16px] font-medium text-brand-dark">{userProfile.fullName}</p>
                <p className="text-[15px] font-medium text-brand-dark">{userProfile.id}</p>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="w-full h-[1px] bg-brand my-4" />

            <p className="text-[11px] leading-[13px] text-brand-dark mb-2">
              В связи с возможной необходимостью оказания врачом неотложной помощи другим пациентам, время вашего приема
              может отличаться от запланированного
            </p>

            <div className="text-[12px] font-medium text-txt-secondary mt-4">
              <p>ООО «Полимедика Челябинск»</p>
              <p style={{ 
                wordWrap: "break-word", 
                overflowWrap: "break-word", 
                whiteSpace: "pre-line" 
              }}>
                {"454003, Россия, Челябинская область, г. Челябинск, ул.\u00A0Братьев Кашириных, д.\u00A0130 А, помещение № 1;"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 pt-2 border-t border-brand bg-white">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <input 
                type="radio" 
                id="screenshot" 
                name="deliveryMethod" 
                value="screenshot" 
                checked={deliveryMethod === 'screenshot'} 
                onChange={() => setDeliveryMethod('screenshot')}
                className="w-4 h-4 text-brand border-brand focus:ring-brand"
              />
              <label htmlFor="screenshot" className="text-[14px] text-brand-dark">
                Сделать скриншот самостоятельно
              </label>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <input 
                type="radio" 
                id="chat" 
                name="deliveryMethod" 
                value="chat" 
                checked={deliveryMethod === 'chat'} 
                onChange={() => setDeliveryMethod('chat')}
                className="w-4 h-4 text-brand border-brand focus:ring-brand"
              />
              <label htmlFor="chat" className="text-[14px] text-brand-dark">
                Отправить талон в чат "Полимедика"
              </label>
            </div>

            <button
              onClick={onClose}
              onMouseEnter={() => setIsCloseButtonHovered(true)}
              onMouseLeave={() => setIsCloseButtonHovered(false)}
              className={cn(
                "w-full h-[39px] rounded-circle font-bold text-[14px] transition-colors duration-200 border-2 border-brand",
                isCloseButtonHovered ? "bg-brand text-white" : "bg-white text-brand"
              )}
            >
              Закрыть
            </button>

            {deliveryMethod === 'chat' && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                onMouseEnter={() => setIsSaveButtonHovered(true)}
                onMouseLeave={() => setIsSaveButtonHovered(false)}
                className={cn(
                  "w-full h-[39px] rounded-circle font-bold text-[14px] transition-colors duration-200 border-2 border-brand mt-2",
                  isSaving
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : isSaveButtonHovered
                      ? "bg-brand text-white"
                      : "bg-white text-brand"
                )}
              >
                {isSaving ? "Отправка..." : "Отправить в чат"}
              </button>
            )}

            {deliveryMethod === 'screenshot' && (
              <p className="text-[12px] text-txt-secondary text-center mt-2">
                Используйте функцию скриншота вашего устройства, чтобы сохранить талон
              </p>
            )}

            {errorMessage && (
              <div className="mt-2 text-brand-error text-[12px] text-center">Ошибка: {errorMessage}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

