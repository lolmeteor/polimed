"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Appointment, AppointmentSlot } from "@/types/appointment"
// Заменяем импорт AppointmentService на ApiAdapter
// import { AppointmentService } from "@/services/appointment-service"
import { ApiAdapter } from "@/services/api-adapter"

// Определяем тип для контекста записей
interface AppointmentContextType {
  appointments: Appointment[]
  isLoading: boolean
  fetchAppointments: (profileId: string) => Promise<void>
  addAppointment: (appointment: Appointment) => void
  cancelAppointment: (appointmentId: string) => Promise<void>
  getAvailableSlots: (specialtySlug: string, bookedAppointments?: Appointment[]) => Promise<AppointmentSlot[]>
}

// Создаем контекст с начальным значением null
const AppointmentContext = createContext<AppointmentContextType | null>(null)

// Хук для использования контекста записей
export function useAppointments() {
  const context = useContext(AppointmentContext)
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentProvider")
  }
  return context
}

// Провайдер контекста записей
export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Получение списка записей пользователя
  const fetchAppointments = useCallback(async (profileId: string) => {
    console.log("Начинаем загрузку записей для профиля:", profileId)
    setIsLoading(true)

    try {
      // Используем ApiAdapter вместо AppointmentService
      const appointmentsData = await ApiAdapter.getAppointmentHistory(profileId)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Ошибка при загрузке истории записей:", error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Функция для получения доступных слотов записи
  const getAvailableSlots = useCallback(async (
    specialtySlug: string, 
    bookedAppointments?: Appointment[]
  ): Promise<AppointmentSlot[]> => {
    try {
      // Используем ApiAdapter вместо AppointmentService
      const slots = await ApiAdapter.getAvailableSlots(specialtySlug)
      
      // Фильтруем слоты локально (эта логика была в AppointmentService)
      return filterAvailableSlots(slots, bookedAppointments || appointments)
    } catch (error) {
      console.error("Ошибка при получении доступных слотов:", error)
      return []
    }
  }, [appointments])
  
  // Функция для фильтрации доступных слотов (перенесена из AppointmentService)
  const filterAvailableSlots = (
    slots: AppointmentSlot[], 
    bookedAppointments: Appointment[]
  ): AppointmentSlot[] => {
    if (!bookedAppointments || bookedAppointments.length === 0) {
      return slots
    }
    
    return slots.filter(slot => {
      // Проверка на точное совпадение ID
      const idMatch = bookedAppointments.some(appointment => appointment.id === slot.id);
      if (idMatch) return false;
      
      // Проверка на перекрытие по времени
      try {
        // Получаем дату и время слота
        let slotDateTime: Date;
        if (slot.datetime.includes('T')) {
          // ISO формат
          slotDateTime = new Date(slot.datetime);
        } else if (slot.datetime.includes(' ')) {
          // Формат "YYYY-MM-DD HH:MM" или "день месяц HH:MM"
          const parts = slot.datetime.split(' ');
          const timePart = parts[parts.length - 1];
          let datePart: string;
          
          if (parts[0].includes('-')) {
            // Если YYYY-MM-DD
            datePart = parts[0];
            slotDateTime = new Date(`${datePart}T${timePart}`);
          } else {
            // Если "день месяц"
            const day = parts[0];
            const month = parts[1];
            const monthsRu: Record<string, number> = {
              'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
              'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
            };
            const monthIndex = monthsRu[month.toLowerCase()];
            const year = new Date().getFullYear();
            slotDateTime = new Date(year, monthIndex, parseInt(day), 
              parseInt(timePart.split(':')[0]), parseInt(timePart.split(':')[1]));
          }
        } else {
          // Непонятный формат, пропускаем проверку
          return true;
        }
        
        // Проверяем перекрытие с существующими записями (±30 минут)
        const timeOverlap = bookedAppointments.some(appointment => {
          try {
            const existingDateTime = appointment.datetime;
            const parts = existingDateTime.split(' ');
            if (parts.length !== 2) return false;
            
            const existingDateTime2 = new Date(`${parts[0]}T${parts[1]}`);
            const timeDiff = Math.abs(existingDateTime2.getTime() - slotDateTime.getTime());
            
            // 30 минут в миллисекундах = 30 * 60 * 1000 = 1 800 000
            return timeDiff < 1800000;
          } catch (err) {
            console.error("Ошибка при проверке перекрытия времени:", err);
            return false;
          }
        });
        
        return !timeOverlap;
      } catch (error) {
        console.error("Ошибка при фильтрации слотов по времени:", error);
        return true; // В случае ошибки не фильтруем слот
      }
    });
  }

  // Функция для добавления новой записи
  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments(prevAppointments => [...prevAppointments, appointment])
  }, [])

  // Функция для отмены записи
  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      setIsLoading(true)
      // Используем ApiAdapter вместо AppointmentService
      const success = await ApiAdapter.cancelAppointment(appointmentId)
      if (success) {
        setAppointments(prevAppointments => 
          prevAppointments.filter(appointment => appointment.id !== appointmentId)
        )
      }
    } catch (error) {
      console.error("Ошибка при отмене записи:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Значение контекста
  const value: AppointmentContextType = {
    appointments,
    isLoading,
    fetchAppointments,
    addAppointment,
    cancelAppointment,
    getAvailableSlots
  }

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
}

