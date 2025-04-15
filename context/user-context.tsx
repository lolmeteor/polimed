"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserProfile } from "@/types/user"
import { Appointment, AppointmentSlot } from "@/types/appointment"
import { ApiAdapter } from "@/services/api-adapter"
import { ReferralService, ReferralType } from "@/services/referral-service"

// Определяем тип для контекста пользователя
interface UserContextType {
  userProfile: UserProfile | null
  availableProfiles: UserProfile[]
  isLoading: boolean
  setUserProfile: (profile: UserProfile) => void
  setAvailableProfiles: (profiles: UserProfile[]) => void
  saveUserPhone: (phone: string) => void
  getUserPhone: () => string
  loadUserData: () => Promise<void>
  saveTelegramId: (id: number) => void
  getTelegramId: () => number | null
  logout: () => void
  addAppointment: (appointmentData: AppointmentSlot) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<boolean>
  checkReferral: (type: ReferralType, slug: string) => Promise<boolean>
  getAvailableSpecialists: () => Promise<string[]>
  getAvailableProcedures: () => Promise<string[]>
}

// Создаем контекст с начальным значением null
const UserContext = createContext<UserContextType | null>(null)

// Хук для использования контекста пользователя
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Провайдер контекста пользователя
export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [availableProfiles, setAvailableProfilesState] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Функция для сохранения профиля пользователя
  const setUserProfile = (profile: UserProfile) => {
    // Если у профиля нет записей, попробуем найти их в списке доступных профилей
    if (!profile.appointments || profile.appointments.length === 0) {
      const savedProfile = availableProfiles.find(p => p.id === profile.id);
      if (savedProfile && savedProfile.appointments && savedProfile.appointments.length > 0) {
        // Используем записи из сохраненного профиля
        profile = {
          ...profile,
          appointments: savedProfile.appointments
        };
      }
    }

    // Убедимся, что записи уникальны для каждого профиля
    if (availableProfiles.length > 0 && profile.appointments && profile.appointments.length > 0) {
      // Для тестовых пользователей модифицируем ID записей, чтобы они были уникальны для каждого профиля
      if (profile.id.startsWith('user') || profile.id === '1' || profile.id === '2' || profile.id === '3' || profile.id === '4') {
        profile = {
          ...profile,
          appointments: profile.appointments.map(app => ({
            ...app,
            id: `${app.id}_${profile.id}` // Добавляем ID профиля к ID записи
          }))
        };
      }
    }

    // Сортируем записи по дате и времени, если они есть
    if (profile.appointments && profile.appointments.length > 0) {
      profile = {
        ...profile,
        appointments: sortAppointmentsByDateTime(profile.appointments)
      };
    }

    setUserProfileState(profile);
    try {
      localStorage.setItem("selectedProfile", JSON.stringify(profile));
      // Сохраняем состояние авторизации
      localStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
    }
  };

  // Функция для сохранения доступных профилей
  const setAvailableProfiles = (profiles: UserProfile[]) => {
    setAvailableProfilesState(profiles)
    try {
      localStorage.setItem("availableProfiles", JSON.stringify(profiles))
    } catch (error) {
      console.error("Ошибка при сохранении списка профилей:", error)
    }
  }

  // Функция для сохранения номера телефона
  const saveUserPhone = (phone: string) => {
    try {
      localStorage.setItem("userPhone", phone)
    } catch (error) {
      console.error("Ошибка при сохранении номера телефона:", error)
    }
  }

  // Функция для получения номера телефона
  const getUserPhone = (): string => {
    try {
      return localStorage.getItem("userPhone") || "+7 (___) ___-__-__"
    } catch (error) {
      console.error("Ошибка при получении номера телефона:", error)
      return "+7 (___) ___-__-__"
    }
  }

  // Функция для загрузки данных пользователя
  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Загрузка профиля из localStorage
      const savedProfile = localStorage.getItem("selectedProfile")
      const savedProfiles = localStorage.getItem("availableProfiles")

      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile) as UserProfile
          setUserProfileState(parsedProfile)
        } catch (error) {
          console.error("Ошибка при парсинге профиля:", error)
        }
      }

      if (savedProfiles) {
        try {
          const parsedProfiles = JSON.parse(savedProfiles) as UserProfile[]
          setAvailableProfilesState(parsedProfiles)
        } catch (error) {
          console.error("Ошибка при парсинге списка профилей:", error)
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем данные пользователя при первом рендере
  useEffect(() => {
    loadUserData()
  }, [])

  // Функция для сохранения Telegram ID
  const saveTelegramId = (id: number) => {
    try {
      localStorage.setItem("telegramId", id.toString())
    } catch (error) {
      console.error("Ошибка при сохранении Telegram ID:", error)
    }
  }

  // Функция для получения Telegram ID
  const getTelegramId = (): number | null => {
    try {
      const id = localStorage.getItem("telegramId")
      return id ? Number.parseInt(id, 10) : null
    } catch (error) {
      console.error("Ошибка при получении Telegram ID:", error)
      return null
    }
  }

  // Функция для выхода из аккаунта
  const logout = () => {
    setUserProfileState(null)
    setAvailableProfilesState([])
    try {
      localStorage.removeItem("selectedProfile")
      localStorage.removeItem("availableProfiles")
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("dataConsent") // Удаляем согласие на обработку данных
      // Не удаляем Telegram ID, так как он может быть полезен при повторной авторизации
    } catch (error) {
      console.error("Ошибка при выходе из аккаунта:", error)
    }
  }

  // Функция для сортировки записей по дате и времени
  const sortAppointmentsByDateTime = (appointments: Appointment[]): Appointment[] => {
    return [...appointments].sort((a, b) => {
      // Парсим дату из строки
      const datePartsA = a.datetime.split(' ');
      const datePartsB = b.datetime.split(' ');
      
      // Получаем дату в формате YYYY-MM-DD
      const dateA = datePartsA[0];
      const dateB = datePartsB[0];
      
      // Получаем время в формате HH:MM
      const timeA = datePartsA[1] || "00:00";
      const timeB = datePartsB[1] || "00:00";
      
      // Создаем объекты Date для сравнения
      const dateTimeA = new Date(`${dateA}T${timeA}`);
      const dateTimeB = new Date(`${dateB}T${timeB}`);
      
      // Сортируем по возрастанию (ближайшие даты вверху)
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  };

  // Функция для добавления записи на прием
  const addAppointment = async (appointmentData: AppointmentSlot) => {
    if (!userProfile) return;

    try {
      setIsLoading(true);

      // Определяем, является ли это записью на процедуру
      const isProcedure = appointmentData.isProcedure || !!appointmentData.procedureName;
      
      // Получаем дату и время новой записи
      const newAppointmentDateTime = appointmentData.datetime;
      // Парсим дату и время
      let newAppointmentDate: Date;
      
      try {
        if (newAppointmentDateTime.includes('T')) {
          // Если формат ISO
          newAppointmentDate = new Date(newAppointmentDateTime);
        } else if (newAppointmentDateTime.includes(' ')) {
          // Если формат "YYYY-MM-DD HH:MM" или "день месяц HH:MM"
          const parts = newAppointmentDateTime.split(' ');
          const timePart = parts[parts.length - 1];
          let datePart: string;
          
          // Проверяем, в каком формате дата
          if (parts[0].includes('-')) {
            // Если YYYY-MM-DD
            datePart = parts[0];
            newAppointmentDate = new Date(`${datePart}T${timePart}`);
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
            newAppointmentDate = new Date(year, monthIndex, parseInt(day), 
              parseInt(timePart.split(':')[0]), parseInt(timePart.split(':')[1]));
          }
        } else {
          // Если формат неизвестен, используем текущую дату
          console.warn("Неизвестный формат даты, используем текущую дату");
          newAppointmentDate = new Date();
        }
      } catch (err) {
        console.error("Ошибка при парсинге даты:", err);
        newAppointmentDate = new Date();
      }
      
      // Проверяем наличие перекрывающихся записей
      if (userProfile.appointments && userProfile.appointments.length > 0) {
        const hasConflict = userProfile.appointments.some(appointment => {
          try {
            const existingDateTime = appointment.datetime;
            const parts = existingDateTime.split(' ');
            if (parts.length !== 2) return false;
            
            const existingDateTime2 = new Date(`${parts[0]}T${parts[1]}`);
            const timeDiff = Math.abs(existingDateTime2.getTime() - newAppointmentDate.getTime());
            
            // 30 минут в миллисекундах = 30 * 60 * 1000 = 1 800 000
            // Если разница во времени меньше 30 минут, считаем что есть конфликт
            return timeDiff < 1800000;
          } catch (err) {
            console.error("Ошибка при проверке конфликта времени:", err);
            return false;
          }
        });
        
        if (hasConflict) {
          throw new Error("У вас уже есть запись на это время или близкое к нему. Выберите другое время.");
        }
      }
      
      // Создаем новую запись через API
      let newAppointment: Appointment;
      
      // Используем единый API-метод вместо разных для процедур и врачей
      newAppointment = await ApiAdapter.createAppointment(appointmentData);
      
      // Обновляем список записей в профиле пользователя
      const updatedAppointments = userProfile.appointments
        ? [...userProfile.appointments, newAppointment]
        : [newAppointment];
      
      // Сортируем записи по дате и времени
      const sortedAppointments = sortAppointmentsByDateTime(updatedAppointments);
      
      // Обновляем профиль пользователя
      setUserProfile({
        ...userProfile,
        appointments: sortedAppointments
      });
      
      // Обновляем список доступных профилей
      if (availableProfiles.length > 0) {
        setAvailableProfiles(
          availableProfiles.map(profile => {
            if (profile.id === userProfile.id) {
              return {
                ...profile,
                appointments: sortedAppointments
              };
            }
            return profile;
          })
        );
      }
    } catch (error) {
      console.error("Ошибка при добавлении записи:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отмены записи на прием
  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
    if (!userProfile) return false;
    
    try {
      setIsLoading(true);
      
      // Отменяем запись через сервис
      // Используем ApiAdapter вместо AppointmentService
      const success = await ApiAdapter.cancelAppointment(appointmentId);
      
      if (success) {
        // Обновляем список записей в профиле пользователя
        const updatedAppointments = userProfile.appointments
          ? userProfile.appointments.filter(appointment => appointment.id !== appointmentId)
          : [];
        
        setUserProfile({
          ...userProfile,
          appointments: updatedAppointments
        });
        
        // Обновляем список доступных профилей
        if (availableProfiles.length > 0) {
          setAvailableProfiles(
            availableProfiles.map(profile => {
              if (profile.id === userProfile.id) {
                return {
                  ...profile,
                  appointments: updatedAppointments
                };
              }
              return profile;
            })
          );
        }
      }
      
      return success;
    } catch (error) {
      console.error("Ошибка при отмене записи:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для проверки наличия направления
  const checkReferral = async (type: ReferralType, slug: string): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      // В тестовом режиме всегда возвращаем true
      if (userProfile.id === 'user1') {
        return true;
      }

      // Проверяем наличие направления через сервис
      const hasReferral = await ReferralService.checkReferral(userProfile.id, type, slug);
      return hasReferral;
    } catch (error) {
      console.error('Ошибка при проверке направления:', error);
      return false;
    }
  };

  // Функция для получения списка доступных специалистов
  const getAvailableSpecialists = async (): Promise<string[]> => {
    if (!userProfile) return [];

    try {
      // В тестовом режиме возвращаем все специальности
      if (userProfile.id === 'user1') {
        return [
          'cardiologist',
          'endocrinologist',
          'gastroenterologist',
          'neurologist',
          'urologist',
          'rheumatologist',
          'pulmonologist'
        ];
      }

      // Получаем список доступных специалистов через сервис
      const specialists = await ReferralService.getAvailableSpecialists(userProfile.id);
      return specialists;
    } catch (error) {
      console.error('Ошибка при получении списка специалистов:', error);
      return [];
    }
  };

  // Функция для получения списка доступных процедур
  const getAvailableProcedures = async (): Promise<string[]> => {
    if (!userProfile) return [];

    try {
      // В тестовом режиме возвращаем все процедуры
      if (userProfile.id === 'user1') {
        return [
          'xray',
          'mammography',
          'holter',
          'smad',
          'fgds',
          'heart-ultrasound',
          'neck-vessels-ultrasound',
          'truzi',
          'external-respiration',
          'ktg',
          'ekg',
          'injections',
          'day-hospital'
        ];
      }

      // Получаем список доступных процедур через сервис
      const procedures = await ReferralService.getAvailableProcedures(userProfile.id);
      return procedures;
    } catch (error) {
      console.error('Ошибка при получении списка процедур:', error);
      return [];
    }
  };

  // Значение контекста
  const value: UserContextType = {
    userProfile,
    availableProfiles,
    isLoading,
    setUserProfile,
    setAvailableProfiles,
    saveUserPhone,
    getUserPhone,
    loadUserData,
    saveTelegramId,
    getTelegramId,
    logout,
    addAppointment,
    cancelAppointment,
    checkReferral,
    getAvailableSpecialists,
    getAvailableProcedures
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

