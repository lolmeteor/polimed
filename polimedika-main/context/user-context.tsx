"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserProfile } from "@/types/user"
import { Appointment, AppointmentSlot } from "@/types/appointment"
import { AppointmentService } from "@/services/appointment-service"
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
          // Если формат непонятен, используем текущую дату (но это не должно происходить)
          newAppointmentDate = new Date();
          console.error("Неизвестный формат даты:", newAppointmentDateTime);
        }
      } catch (error) {
        console.error("Ошибка при парсинге даты записи:", error);
        newAppointmentDate = new Date();
      }
      
      // Проверка наличия существующей записи на то же время
      if (userProfile.appointments && userProfile.appointments.length > 0) {
        const conflictingAppointment = userProfile.appointments.find(app => {
          // Парсим дату существующей записи
          let existingAppDate: Date;
          try {
            const existingDateTime = app.datetime;
            const parts = existingDateTime.split(' ');
            if (parts.length === 2) {
              // Формат "YYYY-MM-DD HH:MM"
              existingAppDate = new Date(`${parts[0]}T${parts[1]}`);
            } else {
              // Если формат другой (неожиданный), пропускаем эту запись
              return false;
            }
            
            // Проверяем совпадение даты и времени с погрешностью ±30 минут
            // Это позволит исключить запись на перекрывающиеся временные слоты
            const timeDiffMs = Math.abs(existingAppDate.getTime() - newAppointmentDate.getTime());
            // 30 минут в миллисекундах = 30 * 60 * 1000 = 1 800 000
            return timeDiffMs < 1800000;
            
          } catch (error) {
            console.error("Ошибка при сравнении дат:", error);
            return false;
          }
        });
        
        if (conflictingAppointment) {
          // Если найдена запись на то же время (±30 минут)
          const errorMessage = `У вас уже есть запись к ${conflictingAppointment.doctorSpecialty || 'специалисту'} ${conflictingAppointment.doctorName || ''} на ${conflictingAppointment.datetime}. Выберите другое время для записи.`;
          throw new Error(errorMessage);
        }
      }
      
      // Проверка наличия существующей записи к этому же специалисту/на такую же процедуру
      if (userProfile.appointments && userProfile.appointments.length > 0) {
        const existingAppointment = userProfile.appointments.find(app => {
          if (isProcedure) {
            // Для процедур сравниваем по названию процедуры
            return app.isProcedure && app.procedureName === appointmentData.procedureName;
          } else {
            // Для специалистов сравниваем по специальности
            return !app.isProcedure && app.doctorSpecialty === appointmentData.doctorSpecialty;
          }
        });
        
        if (existingAppointment) {
          // Если уже есть запись к этому специалисту или на эту процедуру
          const errorMessage = isProcedure 
            ? `У вас уже есть запись на процедуру "${appointmentData.procedureName}". Для создания новой записи сначала удалите существующую.`
            : `У вас уже есть запись к специалисту "${appointmentData.doctorSpecialty}". Для создания новой записи сначала удалите существующую.`;
          
          throw new Error(errorMessage);
        }
      }
      
      // Создаем запись через соответствующий сервис
      let newAppointment: Appointment;
      
      if (isProcedure) {
        // Для процедур используем метод createProcedureAppointment
        newAppointment = await AppointmentService.createProcedureAppointment(appointmentData);
        // Блокируем слот в списке процедур
        await AppointmentService.blockProcedureSlot(appointmentData.id);
      } else {
        // Для врачей используем метод createAppointment
        newAppointment = await AppointmentService.createAppointment(appointmentData);
        // Блокируем слот во всех списках специалистов
        await AppointmentService.blockAppointmentSlot(appointmentData.id);
      }
      
      // Получаем текущие записи и добавляем новую
      const currentAppointments = userProfile.appointments || [];
      const updatedAppointments = sortAppointmentsByDateTime([...currentAppointments, newAppointment]);
      
      // Обновляем профиль пользователя
      const updatedProfile = {
        ...userProfile,
        appointments: updatedAppointments
      };

      // Обновляем профиль в списке доступных профилей
      const updatedProfiles = availableProfiles.map(profile => {
        if (profile.id === userProfile.id) {
          return {
            ...profile,
            appointments: updatedAppointments
          };
        }
        return profile;
      });

      // Сначала обновляем состояние
      setUserProfileState(updatedProfile);
      setAvailableProfilesState(updatedProfiles);

      // Затем сохраняем в localStorage
      try {
        localStorage.setItem("selectedProfile", JSON.stringify(updatedProfile));
        localStorage.setItem("availableProfiles", JSON.stringify(updatedProfiles));
      } catch (storageError) {
        console.error("Ошибка при сохранении в localStorage:", storageError);
      }

    } catch (error) {
      console.error("Ошибка при добавлении записи:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отмены записи на прием
  const cancelAppointment = async (appointmentId: string) => {
    if (!userProfile) {
      console.error("Ошибка: профиль пользователя не найден при отмене записи");
      throw new Error("Профиль пользователя не найден");
    }
    
    if (!userProfile.appointments || userProfile.appointments.length === 0) {
      console.error("Ошибка: у пользователя нет записей для отмены");
      throw new Error("У пользователя нет записей для отмены");
    }

    // Проверяем существование записи с указанным ID
    const appointment = userProfile.appointments.find(app => app.id === appointmentId);
    if (!appointment) {
      console.error(`Ошибка: запись с ID ${appointmentId} не найдена`);
      throw new Error("Запись не найдена");
    }

    try {
      // Отменяем запись через сервис
      const success = await AppointmentService.cancelAppointment(appointmentId);
      
      if (!success) {
        console.error("Сервис отмены записи вернул неуспешный результат");
        throw new Error("Не удалось отменить запись");
      }

      // Возвращаем слот в пул доступных
      if (appointment.isProcedure) {
        // Если это запись на процедуру
        await AppointmentService.unblockProcedureSlot(appointment);
      } else {
        // Если это запись к специалисту
        await AppointmentService.unblockAppointmentSlot(appointment);
      }

      // Создаем обновленный массив записей без удаленной записи
      const updatedAppointments = userProfile.appointments.filter(
        app => app.id !== appointmentId
      );
      
      console.log(`Запись ${appointmentId} отменена. Осталось записей: ${updatedAppointments.length}`);
      
      // Обновляем профиль пользователя с новым массивом записей
      const updatedProfile = {
        ...userProfile,
        appointments: updatedAppointments
      };

      // Создаем обновленный массив профилей
      const updatedProfiles = availableProfiles.map(profile => {
        if (profile.id === userProfile.id) {
          // Если это тот же профиль, обновляем его записи
          return {
            ...profile,
            appointments: updatedAppointments
          };
        }
        return profile;
      });
      
      // Последовательно обновляем состояние (сначала доступные профили, затем текущий)
      setAvailableProfilesState(updatedProfiles);
      
      // Сохраняем обновленные профили в localStorage
      try {
        localStorage.setItem("availableProfiles", JSON.stringify(updatedProfiles));
      } catch (storageError) {
        console.error("Ошибка при сохранении профилей в localStorage:", storageError);
      }
      
      // Обновляем текущий профиль
      setUserProfileState(updatedProfile);
      
      // Сохраняем обновленный профиль в localStorage
      try {
        localStorage.setItem("selectedProfile", JSON.stringify(updatedProfile));
      } catch (storageError) {
        console.error("Ошибка при сохранении профиля в localStorage:", storageError);
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при отмене записи:", error);
      throw error;
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

