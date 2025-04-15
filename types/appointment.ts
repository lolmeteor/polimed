/**
 * Интерфейс для слота записи на прием
 * Используется для отображения доступных слотов в расписании
 */
export interface AppointmentSlot {
  id: string
  datetime: string
  doctorSpecialty?: string
  doctorName?: string
  procedureName?: string
  address: string
  cabinet: string
  ticketNumber: string
  isProcedure?: boolean
}

/**
 * Интерфейс для записи на прием
 * Используется для хранения информации о подтвержденных записях
 */
export interface Appointment {
  id: string
  datetime: string
  cabinet: string
  address: string
  ticketNumber: string
  doctorSpecialty?: string
  doctorName?: string
  procedureName?: string
  isProcedure?: boolean
}

/**
 * Интерфейс для специальности врача 
 * Используется для типизации списка специальностей
 */
export interface DoctorSpecialty {
  id: string
  name: string
  slug: string
} 