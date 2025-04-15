import { AppointmentSlot, Appointment, DoctorSpecialty } from '@/types/appointment'
// Удаляю импорты из моковых данных
//import { getAppointmentSlots } from '@/data/appointments'
//import { getProcedureSlots } from '@/data/procedures'
import { MisApiService } from './mis-api-service'
import { MisMappingService } from './mis-mapping-service'
import { MIS_API_CONFIG } from '@/constants/api-config'

// Кеш данных для оптимизации запросов
const slotsCache: Record<string, AppointmentSlot[]> = {}
const procedureSlotsCache: Record<string, AppointmentSlot[]> = {}

// Кеш ЛПУ и специальностей для быстрого доступа
const lpuCache: { id: string, name: string, address?: string, phone?: string }[] = [];
const specialtyCache: DoctorSpecialty[] = [];
const doctorCache: Record<string, { id: string, name: string, info?: string, phone?: string }[]> = {};

/**
 * Сервис для работы с записями на прием через API МИС
 */
export class AppointmentService {
  /**
   * Получает доступные слоты записи для указанной специальности или процедуры
   * @param specialtySlug - слаг специальности или процедуры
   * @returns массив доступных слотов
   */
  static async getAvailableSlots(specialtySlug: string): Promise<AppointmentSlot[]> {
    // Проверяем кеш
    if (slotsCache[specialtySlug]) {
      return [...slotsCache[specialtySlug]];
    }
    
    // Проверяем, является ли запрос процедурой
    const isProcedure = specialtySlug.startsWith('procedure-');
    
    if (isProcedure) {
      // Для процедур используем логику получения слотов через подходящие специальности
      // Получаем ID процедуры из слага
      const procedureId = specialtySlug.replace('procedure-', '');
      
      // Если это процедура, получаем слоты для соответствующей специальности
      // Например, для УЗИ используем слоты терапевта
      // В реальном приложении нужна таблица соответствия процедур и специальностей
      const mappedSpecialtySlug = this.mapProcedureToSpecialty(procedureId);
      
      // Рекурсивно вызываем метод для получения слотов по специальности
      const slots = await this.getAvailableSlots(mappedSpecialtySlug);
      
      // Модифицируем слоты, добавляя информацию о процедуре
      const procedureSlots = slots.map(slot => ({
        ...slot,
        isProcedure: true,
        procedureName: this.getProcedureName(procedureId),
        // Очищаем информацию о враче для процедур
        doctorName: 'Специалист',
        doctorSpecialty: this.getProcedureName(procedureId)
      }));
      
      // Сохраняем в кеш
      slotsCache[specialtySlug] = procedureSlots;
      return [...procedureSlots];
    }
    
    // Стандартная логика для специальностей
    // Если в кеше нет данных о специальностях, загружаем их
    if (specialtyCache.length === 0) {
      await this.loadSpecialties();
    }

    // Находим ID специальности по слагу
    const specialty = specialtyCache.find(s => s.slug === specialtySlug);
    if (!specialty) {
      throw new Error(`Специальность "${specialtySlug}" не найдена`);
    }

    // Если в кеше нет данных о врачах для этой специальности, загружаем их
    if (!doctorCache[specialty.id]) {
      await this.loadDoctors(specialty.id);
    }

    // Если нет врачей для этой специальности, возвращаем пустой массив
    const doctors = doctorCache[specialty.id];
    if (!doctors || doctors.length === 0) {
      slotsCache[specialtySlug] = [];
      return [];
    }

    // Для демонстрации берем первого врача
    const doctor = doctors[0];

    // Получаем доступные записи для этого врача
    const slots = await this.getAppointmentSlotsForDoctor(
      doctor.id, 
      doctor.name, 
      specialty.name
    );

    // Сохраняем в кеш
    slotsCache[specialtySlug] = slots;
    return [...slots];
  }

  /**
   * Загружает список специальностей из API МИС
   */
  private static async loadSpecialties(): Promise<void> {
    // Используем ID ЛПУ из конфигурации
    const lpuId = MIS_API_CONFIG.DEFAULT_LPU_ID;
    
    const response = await MisApiService.getSpecialityList(lpuId);
    const specialties = MisMappingService.mapSpecialityList(response);
    
    // Сохраняем в кеш
    specialtyCache.length = 0;
    specialtyCache.push(...specialties);
  }

  /**
   * Загружает список врачей для указанной специальности из API МИС
   */
  private static async loadDoctors(specialityId: string): Promise<void> {
    // Используем ID ЛПУ из конфигурации
    const lpuId = MIS_API_CONFIG.DEFAULT_LPU_ID;
    
    const response = await MisApiService.getDoctorList(lpuId, specialityId);
    const doctors = MisMappingService.mapDoctorList(response);
    
    // Сохраняем в кеш
    doctorCache[specialityId] = doctors;
  }

  /**
   * Получает доступные слоты записи для указанного врача
   */
  private static async getAppointmentSlotsForDoctor(
    doctorId: string, 
    doctorName: string, 
    doctorSpecialty: string
  ): Promise<AppointmentSlot[]> {
    // Используем ID ЛПУ из конфигурации
    const lpuId = MIS_API_CONFIG.DEFAULT_LPU_ID;
    // Получаем адрес ЛПУ
    const address = await this.getLpuAddress(lpuId);

    // Устанавливаем диапазон дат на ближайшие 30 дней
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Получаем доступные слоты
    const response = await MisApiService.getAvailableAppointments(
      lpuId, 
      doctorId, 
      startDate, 
      endDate
    );

    // Преобразуем в формат приложения
    return MisMappingService.mapAppointmentSlots(
      response, 
      doctorName, 
      doctorSpecialty, 
      address
    );
  }

  /**
   * Получает адрес ЛПУ по его ID
   */
  private static async getLpuAddress(lpuId: string): Promise<string> {
    // Если в кеше нет данных о ЛПУ, загружаем их
    if (lpuCache.length === 0) {
      // Получаем список районов
      const districtResponse = await MisApiService.getDistrictList();
      const districts = MisMappingService.mapDistrictList(districtResponse);
      
      if (districts.length > 0) {
        // Берем первый район и получаем список ЛПУ
        const lpuResponse = await MisApiService.getLPUList(districts[0].id);
        const lpus = MisMappingService.mapLPUList(lpuResponse);
        
        lpuCache.push(...lpus);
      }
    }
    
    // Находим ЛПУ по ID
    const lpu = lpuCache.find(l => l.id === lpuId);
    return lpu?.address || "Адрес не указан";
  }

  /**
   * Фильтрует доступные слоты, исключая те, на которые уже есть запись
   * @param slots - все доступные слоты
   * @param bookedAppointments - уже забронированные записи
   * @returns массив доступных слотов без забронированных
   */
  static filterAvailableSlots(
    slots: AppointmentSlot[], 
    bookedAppointments?: Appointment[]
  ): AppointmentSlot[] {
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

  /**
   * Создает новую запись на прием
   * @param appointmentData - данные записи
   * @returns созданная запись
   */
  static async createAppointment(appointmentData: AppointmentSlot): Promise<Appointment> {
    // Используем ID ЛПУ из конфигурации и фиксированный ID пациента
    const lpuId = MIS_API_CONFIG.DEFAULT_LPU_ID;
    const patientId = "7453"; // ID, которое указано в примере Postman
    
    // Создаем запись через API МИС
    const response = await MisApiService.setAppointment(
      appointmentData.id,
      lpuId,
      patientId
    );
    
    if (!response.Success) {
      const errors = response.ErrorList?.Error;
      const errorMessage = Array.isArray(errors) 
        ? errors.map(e => e.ErrorDescription).join('; ')
        : errors?.ErrorDescription || 'Неизвестная ошибка при создании записи';
      
      throw new Error(errorMessage);
    }
    
    // Форматируем дату и время для единообразия
    const formattedDateTime = this.formatAppointmentDateTime(appointmentData.datetime);
    
    // Удаляем использованный слот из кеша всех специальностей
    Object.keys(slotsCache).forEach(key => {
      slotsCache[key] = slotsCache[key].filter(slot => slot.id !== appointmentData.id);
    });
    
    return {
      id: appointmentData.id,
      datetime: formattedDateTime,
      cabinet: appointmentData.cabinet,
      address: appointmentData.address,
      ticketNumber: appointmentData.ticketNumber,
      doctorSpecialty: appointmentData.doctorSpecialty,
      doctorName: appointmentData.doctorName
    };
  }

  /**
   * Отменяет запись на прием
   * @param appointmentId - идентификатор записи
   * @returns успех операции
   */
  static async cancelAppointment(appointmentId: string): Promise<boolean> {
    // В текущей версии API МИС нет метода для отмены записи
    // Здесь должен быть запрос к API МИС, когда он будет реализован
    
    throw new Error('Метод отмены записи еще не реализован в API МИС');
  }

  /**
   * Получает историю записей на прием для указанного профиля
   * @param profileId - идентификатор профиля
   * @returns массив записей на прием
   */
  static async getAppointmentHistory(profileId: string): Promise<Appointment[]> {
    // В текущей версии API МИС нет метода для получения истории записей
    // Здесь должен быть запрос к API МИС, когда он будет реализован
    
    throw new Error('Метод получения истории записей еще не реализован в API МИС');
  }
  
  /**
   * Форматирует дату и время записи для единообразия
   * @param datetime - строка даты и времени
   * @returns форматированная строка
   */
  static formatAppointmentDateTime(datetime: string): string {
    try {
      if (!datetime) return "";
      
      // Если формат уже YYYY-MM-DD HH:MM, оставляем как есть
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(datetime)) {
        return datetime;
      }
      
      const date = new Date(datetime);
      
      // Форматируем дату в YYYY-MM-DD
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      
      // Форматируем время в HH:MM
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return datetime; // В случае ошибки возвращаем исходную строку
    }
  }

  /**
   * Сопоставляет ID процедуры с соответствующей специальностью
   * @param procedureId - ID процедуры
   * @returns слаг специальности
   */
  private static mapProcedureToSpecialty(procedureId: string): string {
    // Временная жесткая привязка процедур к специальностям
    const procedureMap: Record<string, string> = {
      'uzi': 'terapevt',
      'ekg': 'kardiolog',
      'analizy': 'terapevt',
      'diagnostika': 'terapevt',
      'default': 'terapevt'
    };
    
    return procedureMap[procedureId] || procedureMap.default;
  }
  
  /**
   * Возвращает название процедуры по её ID
   * @param procedureId - ID процедуры
   * @returns название процедуры
   */
  private static getProcedureName(procedureId: string): string {
    // Временное сопоставление ID и названий процедур
    const procedureNames: Record<string, string> = {
      'uzi': 'УЗИ',
      'ekg': 'ЭКГ',
      'analizy': 'Анализы',
      'diagnostika': 'Диагностика',
      'default': 'Процедура'
    };
    
    return procedureNames[procedureId] || procedureNames.default;
  }
} 