"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Appointment, AppointmentSlot } from "@/types/appointment"
import { AppointmentService } from "@/services/appointment-service"

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
      const appointmentsData = await AppointmentService.getAppointmentHistory(profileId)
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
      const slots = await AppointmentService.getAvailableSlots(specialtySlug)
      return AppointmentService.filterAvailableSlots(slots, bookedAppointments || appointments)
    } catch (error) {
      console.error("Ошибка при получении доступных слотов:", error)
      return []
    }
  }, [appointments])

  // Функция для добавления новой записи
  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments(prevAppointments => [...prevAppointments, appointment])
  }, [])

  // Функция для отмены записи
  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      setIsLoading(true)
      const success = await AppointmentService.cancelAppointment(appointmentId)
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

