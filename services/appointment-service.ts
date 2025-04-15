import { AppointmentSlot, Appointment } from '@/types/appointment'
import { getAppointmentSlots } from '@/data/appointments'
import { getProcedureSlots } from '@/data/procedures'

// Кеш сгенерированных слотов, используется для управления доступными слотами
const slotsCache: Record<string, AppointmentSlot[]> = {}
const procedureSlotsCache: Record<string, AppointmentSlot[]> = {}

/**
 * Сервис для работы с записями на прием
 * В будущем может быть заменен на реальные запросы к API
 */
export class AppointmentService {
  private specialistSlotsCache: Record<string, AppointmentSlot[]> = {
    "therapist": [
      {
        id: "t1",
        datetime: "2023-09-23T10:00:00",
        doctorName: "Иванова А.П.",
        doctorSpecialty: "Терапевт",
        address: "ул. Медицинская, 1",
        cabinet: "101",
        ticketNumber: "Т-001",
      },
      {
        id: "t2",
        datetime: "2023-09-23T11:30:00", 
        doctorName: "Иванова А.П.",
        doctorSpecialty: "Терапевт",
        address: "ул. Медицинская, 1",
        cabinet: "101",
        ticketNumber: "Т-002",
      },
      {
        id: "t3",
        datetime: "2023-09-23T12:45:00",
        doctorName: "Иванова А.П.",
        doctorSpecialty: "Терапевт",
        address: "ул. Медицинская, 1",
        cabinet: "101",
        ticketNumber: "Т-003",
      },
      // Добавляю еще слотов для тестирования
      {
        id: "t4",
        datetime: "2023-09-24T10:00:00",
        doctorName: "Петров И.К.",
        doctorSpecialty: "Терапевт",
        address: "ул. Медицинская, 1",
        cabinet: "102",
        ticketNumber: "Т-004",
      },
      {
        id: "t5",
        datetime: "2023-09-24T11:30:00",
        doctorName: "Петров И.К.",
        doctorSpecialty: "Терапевт",
        address: "ул. Медицинская, 1",
        cabinet: "102",
        ticketNumber: "Т-005",
      }
    ],
  }

  private blockedSlots: string[] = ["t2", "t4"]; // Блокируем некоторые слоты для тестирования

  /**
   * Получает доступные слоты записи для указанной специальности
   * @param specialtySlug - слаг специальности
   * @returns массив доступных слотов
   */
  static async getAvailableSlots(specialtySlug: string): Promise<AppointmentSlot[]> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Получаем слоты из data layer и сохраняем в кеш
    if (!slotsCache[specialtySlug]) {
      slotsCache[specialtySlug] = getAppointmentSlots(specialtySlug)
    }
    
    return [...slotsCache[specialtySlug]]
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
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Форматируем дату и время для единообразия
    const formattedDateTime = this.formatAppointmentDateTime(appointmentData.datetime);
    
    // В реальном API здесь был бы POST запрос
    // В моковой версии просто возвращаем данные
    return {
      id: appointmentData.id,
      datetime: formattedDateTime,
      cabinet: appointmentData.cabinet,
      address: appointmentData.address,
      ticketNumber: appointmentData.ticketNumber,
      doctorSpecialty: appointmentData.doctorSpecialty,
      doctorName: appointmentData.doctorName
    }
  }

  /**
   * Отменяет запись на прием
   * @param appointmentId - идентификатор записи
   * @returns успех операции
   */
  static async cancelAppointment(appointmentId: string): Promise<boolean> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // В реальном API здесь был бы DELETE запрос
    // В моковой версии просто возвращаем успех
    return true
  }

  /**
   * Получает историю записей для указанного профиля
   * @param profileId - идентификатор профиля пользователя
   * @returns массив записей
   */
  static async getAppointmentHistory(profileId: string): Promise<Appointment[]> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // В реальном API здесь был бы GET запрос
    // В моковой версии возвращаем пустой массив
    return []
  }

  /**
   * Блокирует слот в кеше после записи
   * @param appointmentId - идентификатор слота
   * @returns успех операции
   */
  static blockAppointmentSlot(appointmentId: string): boolean {
    // Проходим по всем сохраненным слотам и удаляем слот с указанным ID
    Object.keys(slotsCache).forEach(specialtySlug => {
      slotsCache[specialtySlug] = slotsCache[specialtySlug].filter(
        (slot: AppointmentSlot) => slot.id !== appointmentId
      )
    })
    
    return true
  }

  /**
   * Разблокирует слот в кеше после отмены записи
   * @param appointmentData - данные записи для восстановления слота
   * @returns успех операции
   */
  static unblockAppointmentSlot(appointmentData: Appointment): boolean {
    try {
      // Определяем специальность для восстановления слота
      if (!appointmentData.doctorSpecialty) {
        console.error("Ошибка при разблокировке слота: не указана специальность");
        return false;
      }

      const specialtySlug = appointmentData.doctorSpecialty.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
      
      // Проверяем наличие кеша для данной специальности
      if (!slotsCache[specialtySlug]) {
        // Если кеша нет, создаем его
        slotsCache[specialtySlug] = [];
      }
      
      // Преобразуем данные записи в формат слота
      const slotToRestore: AppointmentSlot = {
        id: appointmentData.id,
        datetime: appointmentData.datetime,
        doctorName: appointmentData.doctorName || "",
        doctorSpecialty: appointmentData.doctorSpecialty,
        address: appointmentData.address,
        cabinet: appointmentData.cabinet,
        ticketNumber: appointmentData.ticketNumber
      };
      
      // Добавляем слот в кеш, избегая дубликатов
      const slotExists = slotsCache[specialtySlug].some(
        (slot: AppointmentSlot) => slot.id === slotToRestore.id
      );
      
      if (!slotExists) {
        slotsCache[specialtySlug].push(slotToRestore);
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при разблокировке слота:", error);
      return false;
    }
  }

  public filterAvailableSlots(
    slots: AppointmentSlot[],
    bookedAppointments?: Appointment[]
  ): AppointmentSlot[] {
    // Фильтрация занятых слотов
    return slots.filter(slot => !this.blockedSlots.includes(slot.id));
  }

  /**
   * Получает доступные слоты для процедуры
   * @param procedureSlug - слаг процедуры
   * @returns массив доступных слотов
   */
  static async getProcedureSlots(procedureSlug: string): Promise<AppointmentSlot[]> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Получаем слоты из data layer и сохраняем в кеш
    if (!procedureSlotsCache[procedureSlug]) {
      procedureSlotsCache[procedureSlug] = getProcedureSlots(procedureSlug)
    }
    
    return [...procedureSlotsCache[procedureSlug]]
  }

  /**
   * Создает новую запись на процедуру
   * @param appointmentData - данные записи
   * @returns созданная запись
   */
  static async createProcedureAppointment(appointmentData: AppointmentSlot): Promise<Appointment> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Проверим, есть ли имя процедуры и добавим его, если необходимо
    let procedureName = appointmentData.procedureName;
    if (!procedureName && appointmentData.doctorSpecialty) {
      procedureName = appointmentData.doctorSpecialty;
    }
    
    // Форматируем дату и время для единообразия
    const formattedDateTime = this.formatAppointmentDateTime(appointmentData.datetime);
    
    // В реальном API здесь был бы POST запрос
    // В моковой версии просто возвращаем данные
    return {
      id: appointmentData.id,
      datetime: formattedDateTime,
      cabinet: appointmentData.cabinet,
      address: appointmentData.address,
      ticketNumber: appointmentData.ticketNumber,
      procedureName: procedureName,
      isProcedure: true
    }
  }

  /**
   * Блокирует слот процедуры в кеше после записи
   * @param appointmentId - идентификатор слота
   * @returns успех операции
   */
  static blockProcedureSlot(appointmentId: string): boolean {
    // Проходим по всем сохраненным слотам и удаляем слот с указанным ID
    Object.keys(procedureSlotsCache).forEach(procedureSlug => {
      procedureSlotsCache[procedureSlug] = procedureSlotsCache[procedureSlug].filter(
        (slot: AppointmentSlot) => slot.id !== appointmentId
      )
    })
    
    return true
  }

  /**
   * Разблокирует слот процедуры в кеше после отмены записи
   * @param appointmentData - данные записи для восстановления слота
   * @returns успех операции
   */
  static unblockProcedureSlot(appointmentData: Appointment): boolean {
    try {
      // Определяем тип процедуры для восстановления слота
      if (!appointmentData.procedureName) {
        console.error("Ошибка при разблокировке слота процедуры: не указано название процедуры");
        return false;
      }

      const procedureSlug = appointmentData.procedureName.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
      
      // Проверяем наличие кеша для данной процедуры
      if (!procedureSlotsCache[procedureSlug]) {
        // Если кеша нет, создаем его
        procedureSlotsCache[procedureSlug] = [];
      }
      
      // Преобразуем данные записи в формат слота
      const slotToRestore: AppointmentSlot = {
        id: appointmentData.id,
        datetime: appointmentData.datetime,
        procedureName: appointmentData.procedureName,
        address: appointmentData.address,
        cabinet: appointmentData.cabinet,
        ticketNumber: appointmentData.ticketNumber,
        isProcedure: true
      };
      
      // Добавляем слот в кеш, избегая дубликатов
      const slotExists = procedureSlotsCache[procedureSlug].some(
        (slot: AppointmentSlot) => slot.id === slotToRestore.id
      );
      
      if (!slotExists) {
        procedureSlotsCache[procedureSlug].push(slotToRestore);
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при разблокировке слота процедуры:", error);
      return false;
    }
  }

  /**
   * Форматирует дату и время для корректного отображения
   * @param datetime - строка с датой и временем
   * @returns отформатированная строка даты и времени
   */
  static formatAppointmentDateTime(datetime: string): string {
    try {
      // Если дата уже в нужном формате (YYYY-MM-DD HH:MM), возвращаем как есть
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(datetime)) {
        return datetime;
      }

      // Если дата в формате ISO (YYYY-MM-DDTHH:MM:SS)
      if (datetime.includes('T')) {
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }

      // Если дата в формате "день месяц HH:MM" (например, "4 марта 09:00")
      if (datetime.includes(' ')) {
        const parts = datetime.split(' ');
        const timePart = parts[parts.length - 1];
        const datePart = parts.slice(0, -1).join(' ');

        const monthsRu = {
          'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
          'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };

        const [day, monthName] = datePart.split(' ');
        const month = monthsRu[monthName.toLowerCase() as keyof typeof monthsRu];
        
        if (!isNaN(Number(day)) && month !== undefined) {
          const year = new Date().getFullYear();
          const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${Number(day).toString().padStart(2, '0')}`;
          
          if (/^\d{2}:\d{2}$/.test(timePart)) {
            return `${formattedDate} ${timePart}`;
          }
        }
      }

      // Если не удалось распарсить, возвращаем как есть
      return datetime;
    } catch (error) {
      console.error("Ошибка форматирования даты:", error);
      return datetime;
    }
  }
} 