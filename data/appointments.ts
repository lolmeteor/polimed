import { AppointmentSlot, DoctorSpecialty } from '@/types/appointment'
import { clinicAddresses } from './clinic-addresses'

/**
 * Список специальностей врачей
 */
export const specialties: DoctorSpecialty[] = [
  {
    id: '1',
    name: 'Кардиолог',
    slug: 'cardiologist'
  },
  {
    id: '2',
    name: 'Невролог',
    slug: 'neurologist'
  },
  {
    id: '3',
    name: 'Эндокринолог',
    slug: 'endocrinologist'
  },
  {
    id: '4',
    name: 'Гинеколог',
    slug: 'gynecologist'
  },
  {
    id: '5',
    name: 'Офтальмолог',
    slug: 'ophthalmologist'
  },
  {
    id: '6',
    name: 'Отоларинголог',
    slug: 'otolaryngologist'
  },
  {
    id: '7',
    name: 'Пульмонолог',
    slug: 'pulmonologist'
  },
  {
    id: '8',
    name: 'Терапевт',
    slug: 'therapist'
  },
  {
    id: '9',
    name: 'Уролог',
    slug: 'urologist'
  },
  {
    id: '10',
    name: 'Хирург',
    slug: 'surgeon'
  },
  {
    id: '11',
    name: 'Ревматолог',
    slug: 'rheumatologist'
  },
  {
    id: '12',
    name: 'Гастроэнтеролог',
    slug: 'gastroenterologist'
  }
]

/**
 * Список врачей по специальностям
 */
export const doctors = {
  cardiologist: [
    { id: '1', name: 'Кузнецов А. И.' },
    { id: '2', name: 'Попов А. И.' }
  ],
  neurologist: [
    { id: '3', name: 'Смирнов А. И.' },
    { id: '4', name: 'Федоров А. И.' }
  ],
  endocrinologist: [
    { id: '5', name: 'Иванова М. П.' },
    { id: '6', name: 'Петрова С. В.' }
  ],
  gynecologist: [
    { id: '7', name: 'Соколова А. Н.' },
    { id: '8', name: 'Новикова Е. А.' }
  ],
  ophthalmologist: [
    { id: '9', name: 'Морозов В. С.' },
    { id: '10', name: 'Волков Д. И.' }
  ],
  otolaryngologist: [
    { id: '11', name: 'Алексеев И. Г.' },
    { id: '12', name: 'Козлов Н. К.' }
  ],
  pulmonologist: [
    { id: '13', name: 'Лебедева О. В.' },
    { id: '14', name: 'Семенова А. М.' }
  ],
  therapist: [
    { id: '15', name: 'Конев А. И.' },
    { id: '16', name: 'Светов А. И.' }
  ],
  urologist: [
    { id: '17', name: 'Петров А. И.' },
    { id: '18', name: 'Иванов А. И.' }
  ],
  surgeon: [
    { id: '19', name: 'Белов А. И.' },
    { id: '20', name: 'Чернов А. И.' }
  ],
  rheumatologist: [
    { id: '21', name: 'Козлов А. И.' },
    { id: '22', name: 'Морозов А. И.' }
  ],
  gastroenterologist: [
    { id: '23', name: 'Михайлов А. И.' },
    { id: '24', name: 'Лебедев А. И.' }
  ]
}

/**
 * Генерирует слоты записи для указанной специальности
 * @param specialty - специальность врача
 * @returns массив слотов записи
 */
export function generateAppointmentSlots(specialtySlug: string): AppointmentSlot[] {
  const specialty = specialties.find(s => s.slug === specialtySlug)
  if (!specialty) return []
  
  const specialtyDoctors = doctors[specialtySlug as keyof typeof doctors] || []
  
  // Базовые даты и времена для слотов
  const dates = ['4 марта', '7 марта', '8 марта', '9 марта', '10 марта', '11 марта']
  const times = ['09:00', '11:00', '14:30', '15:30', '17:00']
  
  // Генерация слотов
  const slots: AppointmentSlot[] = []
  let slotId = 1
  
  for (let i = 0; i < 6; i++) {
    const doctor = specialtyDoctors[i % specialtyDoctors.length]
    const date = dates[i % dates.length]
    const time = times[i % times.length]
    const address = clinicAddresses[i % clinicAddresses.length]
    
    slots.push({
      id: String(slotId),
      datetime: `${date} ${time}`,
      doctorSpecialty: specialty.name,
      doctorName: doctor.name,
      address: address,
      cabinet: '111, 1 этаж',
      ticketNumber: `ЕН${String(slotId + 2).padStart(3, '0')}`
    })
    
    slotId++
  }
  
  return slots
}

/**
 * Кеш сгенерированных слотов
 * Используется для сохранения стабильных данных между рендерами
 */
const slotsCache: Record<string, AppointmentSlot[]> = {}

/**
 * Возвращает сгенерированные или кешированные слоты для указанной специальности
 * @param specialtySlug - слаг специальности врача
 * @returns массив слотов записи
 */
export function getAppointmentSlots(specialtySlug: string): AppointmentSlot[] {
  if (!slotsCache[specialtySlug]) {
    slotsCache[specialtySlug] = generateAppointmentSlots(specialtySlug)
  }
  
  return [...slotsCache[specialtySlug]]
} 