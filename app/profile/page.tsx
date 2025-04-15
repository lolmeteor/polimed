"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal"
import { SuccessModal } from "@/components/success-modal"
import { cn } from "@/lib/utils"
import { useUser } from "@/context/user-context"
import { useAppointments } from "@/context/appointment-context"
import type { UserProfile } from "@/types/user"
import type { Appointment } from "@/types/appointment"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { userProfile, availableProfiles, isLoading, setUserProfile, cancelAppointment: cancelUserAppointment, setAvailableProfiles, logout } = useUser()
  const { appointments, isLoading: isAppointmentsLoading, fetchAppointments } = useAppointments()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  const router = useRouter()

  // Состояния для модальных окон
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<NonNullable<NonNullable<UserProfile['appointments']>[number]> | null>(null)

  // Загружаем историю записей при монтировании компонента или изменении профиля
  useEffect(() => {
    if (userProfile?.id && !hasAttemptedFetch) {
      console.log("Fetching appointments for profile:", userProfile.id)
      fetchAppointments(userProfile.id)
      setHasAttemptedFetch(true)
    }
  }, [userProfile?.id, fetchAppointments, hasAttemptedFetch])

  // Добавляем отладочный вывод для отслеживания состояния
  useEffect(() => {
    console.log("Current state:", {
      userProfileId: userProfile?.id,
      appointmentsCount: appointments?.length,
      isAppointmentsLoading,
      hasAttemptedFetch,
    })
  }, [userProfile?.id, appointments, isAppointmentsLoading, hasAttemptedFetch])

  const formatShortName = (profile: UserProfile) => {
    if (!profile) return ""
    const firstNameInitial = profile.firstName ? profile.firstName.charAt(0) + "." : ""
    const patronymicInitial = profile.patronymic ? profile.patronymic.charAt(0) + "." : ""
    return `${profile.lastName} ${firstNameInitial} ${patronymicInitial}`
  }

  const handleProfileSelect = (profile: UserProfile) => {
    // Сохраняем текущие записи перед переключением профиля
    if (userProfile && userProfile.appointments) {
      // Найдем текущий профиль в списке доступных профилей
      const currentProfileIndex = availableProfiles.findIndex(p => p.id === userProfile.id);
      if (currentProfileIndex !== -1) {
        // Создаем копию списка профилей
        const updatedProfiles = [...availableProfiles];
        // Обновляем записи текущего профиля
        updatedProfiles[currentProfileIndex] = {
          ...updatedProfiles[currentProfileIndex],
          appointments: userProfile.appointments
        };
        // Сохраняем обновленный список профилей
        setAvailableProfiles(updatedProfiles);
      }
    }

    // Переключаемся на новый профиль
    setUserProfile(profile);
    setIsProfileDropdownOpen(false);
    // При смене профиля сбрасываем флаг и загружаем новые записи
    setHasAttemptedFetch(false);
  }

  // Обработчик для открытия модального окна отмены
  const handleOpenCancelModal = (appointment: NonNullable<NonNullable<UserProfile['appointments']>[number]>) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  // Обработчик для закрытия модального окна отмены
  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false)
    setSelectedAppointment(null)
  }

  // Обработчик для подтверждения отмены записи
  const handleConfirmCancel = async (appointmentId: string) => {
    try {
      // Отменяем запись в контексте пользователя
      await cancelUserAppointment(appointmentId)
  
      // Закрываем модальное окно отмены
      setIsCancelModalOpen(false)
  
      // Принудительно обновляем список записей
      if (userProfile?.id) {
        await fetchAppointments(userProfile.id)
      }
  
      // Открываем модальное окно успешной отмены
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error("Ошибка при отмене записи:", error)
      toast.error("Не удалось отменить запись. Попробуйте еще раз.")
    }
  }

  // Обработчик для закрытия модального окна успешной отмены
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false)
    setSelectedAppointment(null)
  }

  // Добавляем кнопку для принудительной загрузки записей
  const handleManualFetch = () => {
    if (userProfile?.id) {
      console.log("Manually fetching appointments for profile:", userProfile.id)
      fetchAppointments(userProfile.id)
    }
  }

  // Вспомогательные функции для работы с датами
  const formatAppointmentDate = (datetime: string) => {
    try {
      // Разбираем строку даты и времени
      const [datePart, timePart] = datetime.split(' ');
      
      if (!datePart || !timePart) return datetime;

      // Разбираем дату
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Массив месяцев в родительном падеже
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];

      // Форматируем дату в "10 марта 10:00"
      return `${day} ${months[month - 1]} ${timePart}`;
    } catch (error) {
      console.error("Ошибка форматирования даты:", error);
      return datetime;
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-white">
        <HeaderLogo />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
        <BottomNav className="bottom-nav-fixed" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-[107px]">
      <HeaderLogo />

      <AdaptiveContainer>
        {/* Блок с выбором профиля */}
        <div className="relative mb-8">
          {/* Контейнер для иконки и селектора */}
          <div className="relative flex items-center">
            {/* Иконка профиля */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.85 17.1C6.7 16.45 7.65 15.9375 8.7 15.5625C9.75 15.1875 10.85 15 12 15C13.15 15 14.25 15.1875 15.3 15.5625C16.35 15.9375 17.3 16.45 18.15 17.1C18.7333 16.4167 19.1875 15.6417 19.5125 14.775C19.8375 13.9083 20 12.9833 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 12.9833 4.1625 13.9083 4.4875 14.775C4.8125 15.6417 5.26667 16.4167 5.85 17.1ZM12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z"
                  fill="var(--text-primary)"
                />
              </svg>
            </div>

            {/* Селектор профиля - уменьшаем ширину и добавляем отступ слева */}
            <div className="relative w-[275px] h-[44px]">
              <div
                className="box-border w-[220px] h-full bg-white border-2 border-brand rounded-pill flex items-center px-4 cursor-pointer ml-[55px]"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <span className="font-medium text-[16px] leading-[20px] text-txt-primary ml-2">
                  {userProfile ? formatShortName(userProfile) : "Выберите профиль"}
                </span>
                <svg
                  className="w-5 h-5 text-txt-primary ml-auto"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="var(--text-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Выпадающий список профилей */}
              {isProfileDropdownOpen && availableProfiles.length > 1 && (
                <div className="absolute z-10 w-[220px] mt-1 bg-white border-2 border-brand rounded-btn shadow-lg overflow-hidden ml-[55px]">
                  {availableProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={cn(
                        "px-4 py-2 cursor-pointer transition-colors",
                        "hover:bg-brand hover:text-white",
                      )}
                      onClick={() => handleProfileSelect(profile)}
                    >
                      <span className="font-medium text-[14px] leading-[17px]">{formatShortName(profile)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Личная информация */}
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold text-txt-primary mb-4 leading-[18px]">Личная информация</h2>
          <div className="space-y-3">
            <div className="box-border w-[275px] h-[40px] bg-white border-2 border-brand rounded-pill flex items-center px-6">
              <span className="font-medium text-[16px] leading-[20px] text-txt-primary">
                {userProfile?.lastName || ""}
              </span>
            </div>

            <div className="box-border w-[275px] h-[40px] bg-white border-2 border-brand rounded-pill flex items-center px-6">
              <span className="font-medium text-[16px] leading-[20px] text-txt-primary">
                {userProfile?.firstName || ""}
              </span>
            </div>

            <div className="box-border w-[275px] h-[40px] bg-white border-2 border-brand rounded-pill flex items-center px-6">
              <span className="font-medium text-[16px] leading-[20px] text-txt-primary">
                {userProfile?.patronymic || ""}
              </span>
            </div>
            
            {/* Кнопка выхода из аккаунта */}
            <div className="mt-6">
              <button
                onClick={() => {
                  logout();
                  router.push("/auth");
                }}
                className="w-[275px] h-[40px] border-2 border-red-500 rounded-pill flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <span className="font-medium text-[16px] leading-[20px]">
                  Выйти из аккаунта
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Номер телефона */}
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold text-txt-primary mb-4 leading-[18px]">Номер телефона</h2>
          <div className="box-border w-[275px] h-[40px] bg-white border-2 border-brand rounded-pill flex items-center px-6">
            <span className="font-medium text-[16px] leading-[20px] text-txt-primary">
              {userProfile?.phone || "+7 (___) ___-__-__"}
            </span>
          </div>
        </div>

        {/* Дата рождения */}
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold text-txt-primary mb-4 leading-[18px]">Дата рождения</h2>
          <div className="box-border w-[275px] h-[40px] bg-white border-2 border-brand rounded-pill flex items-center px-6">
            <span className="font-medium text-[16px] leading-[20px] text-txt-primary">
              {userProfile?.birthDate?.replace(/\//g, " / ") || ""}
            </span>
          </div>
        </div>

        {/* История записей */}
        <div>
          <h2 className="text-[15px] font-semibold text-txt-primary mb-4 leading-[18px]">История записей</h2>

          {isAppointmentsLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            </div>
          ) : userProfile?.appointments && userProfile.appointments.length > 0 ? (
            <div className="space-y-4">
              {userProfile.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="box-border w-full max-w-[275px] bg-white border-2 border-brand rounded-[20px] p-4 relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex flex-col mb-4">
                        <p className="font-bold text-[20px] leading-[24px] text-brand-dark">{formatAppointmentDate(appointment.datetime)}</p>
                      </div>
                      {appointment.isProcedure ? (
                        // Отображение процедуры
                        <>
                          <p className="text-[14px] leading-[17px] text-txt-secondary">Процедура</p>
                          <p className="text-[16px] font-medium leading-[20px] text-brand-dark mb-2">{appointment.procedureName}</p>
                        </>
                      ) : (
                        // Отображение приема у врача
                        <>
                          <p className="text-[14px] leading-[17px] text-txt-secondary">{appointment.doctorSpecialty}</p>
                          <p className="text-[16px] font-medium leading-[20px] text-brand-dark mb-2">{appointment.doctorName}</p>
                        </>
                      )}
                      <p className="text-[14px] leading-[17px] text-txt-secondary">
                        {appointment.address}{appointment.cabinet ? `, каб. ${appointment.cabinet}` : ''}
                      </p>
                    </div>
                    <button
                      className="text-orange-500"
                      onClick={() => handleOpenCancelModal(appointment)}
                      aria-label="Отменить запись"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-txt-secondary py-6">Нет активных записей</div>
          )}
        </div>

        {/* Результаты анализов и исследований */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-txt-primary leading-[18px]">
            Результаты анализов и исследований
          </h2>
        </div>
      </AdaptiveContainer>

      {/* Модальное окно подтверждения отмены записи */}
      <CancelAppointmentModal
        appointment={selectedAppointment}
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />

      {/* Модальное окно успешной отмены записи */}
      <SuccessModal isOpen={isSuccessModalOpen} onClose={handleCloseSuccessModal} message="Запись успешно отменена" />

      {/* Нижнее меню */}
      <BottomNav className="bottom-nav-fixed" />
    </div>
  )
}

