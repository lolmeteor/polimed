import { 
  MisDistrictListResponse, 
  MisLPUListResponse, 
  MisSpecialityListResponse, 
  MisDoctorListResponse, 
  MisAvailableDatesResponse, 
  MisAvailableAppointmentsResponse, 
  MisSetAppointmentResponse,
  MisSearchPatientResponse
} from '@/types/mis-api';
import { AppointmentSlot, DoctorSpecialty } from '@/types/appointment';
import { convertMisDateToJsDate } from '@/utils/date-utils';

/**
 * Сервис для преобразования данных из API МИС в формат приложения
 */
export class MisMappingService {
  /**
   * Преобразует список районов из API МИС в формат приложения
   */
  static mapDistrictList(response: MisDistrictListResponse): Array<{ id: string, name: string }> {
    if (!response.Success || !response.Districts?.District) {
      return [];
    }
    
    const districts = Array.isArray(response.Districts.District) 
      ? response.Districts.District
      : [response.Districts.District];
    
    return districts.map(district => ({
      id: district.IdDistrict,
      name: district.DistrictName
    }));
  }
  
  /**
   * Преобразует список ЛПУ из API МИС в формат приложения
   */
  static mapLPUList(response: MisLPUListResponse): Array<{ id: string, name: string, address?: string, phone?: string }> {
    if (!response.Success || !response.LPUs?.LPU) {
      return [];
    }
    
    const lpus = Array.isArray(response.LPUs.LPU) 
      ? response.LPUs.LPU
      : [response.LPUs.LPU];
    
    return lpus.map(lpu => ({
      id: lpu.IdLPU,
      name: lpu.LPUName,
      address: lpu.LPUAddress,
      phone: lpu.LPUPhone
    }));
  }
  
  /**
   * Преобразует список специальностей из API МИС в формат приложения
   */
  static mapSpecialityList(response: MisSpecialityListResponse): DoctorSpecialty[] {
    if (!response.Success || !response.Specialities?.Speciality) {
      return [];
    }
    
    const specialities = Array.isArray(response.Specialities.Speciality) 
      ? response.Specialities.Speciality
      : [response.Specialities.Speciality];
    
    return specialities.map(spec => ({
      id: spec.IdSpeciality,
      name: spec.SpecialityName,
      slug: this.generateSlug(spec.SpecialityName)
    }));
  }
  
  /**
   * Преобразует список врачей из API МИС в формат приложения
   */
  static mapDoctorList(response: MisDoctorListResponse): Array<{ id: string, name: string, info?: string, phone?: string }> {
    if (!response.Success || !response.Doctors?.Doctor) {
      return [];
    }
    
    const doctors = Array.isArray(response.Doctors.Doctor) 
      ? response.Doctors.Doctor
      : [response.Doctors.Doctor];
    
    return doctors.map(doctor => ({
      id: doctor.IdDoc,
      name: doctor.DocName,
      info: doctor.DocInfo,
      phone: doctor.DocPhone
    }));
  }
  
  /**
   * Преобразует список доступных дат из API МИС в формат приложения
   */
  static mapAvailableDates(response: MisAvailableDatesResponse): Array<{ date: Date }> {
    if (!response.Success || !response.Dates?.Date) {
      return [];
    }
    
    if (Array.isArray(response.Dates.Date)) {
      if (typeof response.Dates.Date[0] === 'string') {
        // Если даты приходят как массив строк
        return (response.Dates.Date as string[]).map(dateStr => ({
          date: new Date(dateStr)
        }));
      } else {
        // Если даты приходят как массив объектов
        return (response.Dates.Date as { Date: string }[]).map(dateObj => ({
          date: new Date(dateObj.Date)
        }));
      }
    } else if (typeof response.Dates.Date === 'string') {
      // Если пришла одна дата как строка
      return [{
        date: new Date(response.Dates.Date)
      }];
    } else {
      // Если пришел один объект даты
      return [{
        date: new Date((response.Dates.Date as { Date: string }).Date)
      }];
    }
  }
  
  /**
   * Преобразует список доступных записей из API МИС в формат приложения
   */
  static mapAppointmentSlots(
    response: MisAvailableAppointmentsResponse,
    doctorName: string,
    doctorSpecialty: string,
    address: string
  ): AppointmentSlot[] {
    if (!response.Success || !response.Appointments?.Appointment) {
      return [];
    }
    
    const appointments = Array.isArray(response.Appointments.Appointment) 
      ? response.Appointments.Appointment
      : [response.Appointments.Appointment];
    
    return appointments.map(appointment => {
      const dateTime = convertMisDateToJsDate(appointment.VisitStart);
      
      // Форматируем дату для отображения
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
      
      return {
        id: appointment.IdAppointment,
        datetime: formattedDateTime,
        doctorName: appointment.DocName || doctorName,
        doctorSpecialty: doctorSpecialty,
        address: address,
        cabinet: appointment.RoomNumber || 'Не указан',
        ticketNumber: 'Не указан'
      };
    });
  }

  /**
   * Преобразует результат поиска пациента из API МИС в формат приложения
   */
  static mapSearchPatientResult(response: MisSearchPatientResponse): Array<{ id: string, name: string, birthDate: string }> {
    if (!response.Success || !response.Patients?.Patient) {
      return [];
    }
    
    const patients = Array.isArray(response.Patients.Patient) 
      ? response.Patients.Patient
      : [response.Patients.Patient];
    
    return patients.map(patient => {
      const birthDate = patient.BirthDate ? convertMisDateToJsDate(patient.BirthDate) : new Date();
      
      // Форматируем дату для отображения
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      
      // Формируем полное имя из отдельных частей
      const fullName = [
        patient.LastName,
        patient.FirstName,
        patient.MiddleName
      ].filter(Boolean).join(' ');
      
      return {
        id: patient.IdPat,
        name: fullName,
        birthDate: `${year}-${month}-${day}`
      };
    });
  }
  
  /**
   * Генерирует slug из названия
   */
  private static generateSlug(name: string): string {
    if (!name) return '';
    
    // Транслитерация русских символов
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return name.toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
} 