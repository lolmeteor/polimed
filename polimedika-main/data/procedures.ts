import { ProcedureType, ProcedureGroup } from '@/types/procedure'
import { AppointmentSlot } from '@/types/appointment'
import { clinicAddresses } from './clinic-addresses'

/**
 * Список доступных процедур
 */
export const procedures: ProcedureType[] = [
  // Группа 1: Прямой доступ
  { id: '1', name: 'Забор крови', slug: 'blood-sampling', requiresReferral: false },
  { id: '2', name: 'Вакцинация', slug: 'vaccination', requiresReferral: false },
  { id: '3', name: 'ФОГ', slug: 'fog', requiresReferral: false },
  
  // Группа 2: По направлению от врача
  { id: '4', name: 'УЗИ вен/артерий нижних конечностей', slug: 'leg-vessels-ultrasound', requiresReferral: true },
  { id: '5', name: 'УЗИ брюшной полости', slug: 'abdominal-ultrasound', requiresReferral: true },
  { id: '6', name: 'УЗИ органов малого таза', slug: 'pelvic-ultrasound', requiresReferral: true },
  { id: '7', name: 'Фиброколоноскопия', slug: 'fibrocolonoscopy', requiresReferral: true },
  
  // Группа 3: По направлению доступны
  { id: '8', name: 'Рентген', slug: 'xray', requiresReferral: true },
  { id: '9', name: 'Маммография', slug: 'mammography', requiresReferral: true },
  { id: '10', name: 'Холтер', slug: 'holter', requiresReferral: true },
  { id: '11', name: 'СМАД', slug: 'smad', requiresReferral: true },
  { id: '12', name: 'ФГДС', slug: 'fgds', requiresReferral: true },
  { id: '13', name: 'УЗИ сердца', slug: 'heart-ultrasound', requiresReferral: true },
  { id: '14', name: 'УЗИ сосудов шеи', slug: 'neck-vessels-ultrasound', requiresReferral: true },
  { id: '15', name: 'ТРУЗИ', slug: 'truzi', requiresReferral: true },
  { id: '16', name: 'Функция внешнего дыхания', slug: 'external-respiration', requiresReferral: true },
  { id: '17', name: 'КТГ', slug: 'ktg', requiresReferral: true },
  { id: '18', name: 'ЭКГ', slug: 'ekg', requiresReferral: true },
  { id: '19', name: 'Инъекции', slug: 'injections', requiresReferral: true },
  { id: '20', name: 'Дневной стационар', slug: 'day-hospital', requiresReferral: true },
]

// Процедуры без направления
export const directAccessProcedures = [
  'blood-sampling', 
  'vaccination', 
  'fog'
]

// Процедуры по направлению (требуется направление)
export const referralRequiredProcedures = [
  'leg-vessels-ultrasound', 
  'abdominal-ultrasound', 
  'pelvic-ultrasound', 
  'fibrocolonoscopy'
]

// Доступные по направлению
export const referralAvailableProcedures = [
  'xray', 'mammography', 'holter', 'smad', 'fgds', 'heart-ultrasound',
  'neck-vessels-ultrasound', 'truzi', 'external-respiration', 'ktg',
  'ekg', 'injections', 'day-hospital'
]

/**
 * Получает группу процедуры
 * @param slug - слаг процедуры
 * @returns группа процедуры или null, если процедура не найдена
 */
export function getProcedureGroup(slug: string): ProcedureGroup | null {
  if (directAccessProcedures.includes(slug)) {
    return ProcedureGroup.DIRECT_ACCESS;
  } else if (referralRequiredProcedures.includes(slug)) {
    return ProcedureGroup.REFERRAL_REQUIRED;
  } else if (referralAvailableProcedures.includes(slug)) {
    return ProcedureGroup.REFERRAL_AVAILABLE;
  }
  return null;
}

/**
 * Генерирует слоты для процедуры
 * @param procedureSlug - слаг процедуры
 * @returns массив слотов
 */
export function generateProcedureSlots(procedureSlug: string): AppointmentSlot[] {
  const procedure = procedures.find(p => p.slug === procedureSlug);
  if (!procedure) return [];
  
  // Базовые даты и времена для слотов
  const dates = ['4 марта', '7 марта', '8 марта', '9 марта', '10 марта', '11 марта'];
  const times = ['08:30', '10:00', '12:30', '14:00', '16:30'];
  
  // Генерация слотов
  const slots: AppointmentSlot[] = [];
  let slotId = 1;
  
  for (let i = 0; i < 8; i++) {
    const date = dates[i % dates.length];
    const time = times[i % times.length];
    const address = clinicAddresses[i % clinicAddresses.length];
    
    slots.push({
      id: `p${procedure.id}-${slotId}`,
      datetime: `${date} ${time}`,
      procedureName: procedure.name,
      address: address,
      cabinet: '105, 1 этаж',
      ticketNumber: `П${String(slotId).padStart(3, '0')}`,
      isProcedure: true
    });
    
    slotId++;
  }
  
  return slots;
}

// Кеш слотов для процедур
const procedureSlotsCache: Record<string, AppointmentSlot[]> = {};

/**
 * Получает слоты для процедуры из кеша или генерирует новые
 * @param procedureSlug - слаг процедуры
 * @returns массив слотов
 */
export function getProcedureSlots(procedureSlug: string): AppointmentSlot[] {
  if (!procedureSlotsCache[procedureSlug]) {
    procedureSlotsCache[procedureSlug] = generateProcedureSlots(procedureSlug);
  }
  
  return [...procedureSlotsCache[procedureSlug]];
} 