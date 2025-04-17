"use client";

// Сервис для работы с API МИС через прокси-сервер
// Содержит методы для всех доступных API-методов МИС

// Константы для работы с прокси
const PROXY_BASE_URL = "http://51.250.34.77:3001/proxy";
const MIS_GUID = process.env.MIS_GUID || "";
const DEFAULT_LPU_ID = parseInt(process.env.DEFAULT_LPU_ID || "0", 10);

// Типы данных для работы с API
export interface MISError {
  code: string;
  message: string;
}

export interface MISResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface District {
  id: string;
  name: string;
}

export interface MedicalInstitution {
  id: string;
  name: string;
  address: string;
  districtId: string;
  phone?: string;
  website?: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photo?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicId: string;
  clinicName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Класс для работы с API
class MISApiService {
  private baseUrl = 'https://api.misservice.example';
  private token: string | null = null;

  // Авторизация
  async login(username: string, password: string): Promise<MISResponse<{token: string; userProfile: UserProfile}>> {
    // В реальном приложении здесь был бы запрос к API
    console.log('Попытка входа с логином:', username);
    
    // Имитация ответа от сервера
    await this.delay(800);
    
    if (username === 'test' && password === 'test123') {
      this.token = 'sample-token-12345';
      
      return {
        status: 200,
        message: 'Вход выполнен успешно',
        data: {
          token: this.token,
          userProfile: {
            id: '1',
            name: 'Иван Иванов',
            email: 'ivan@example.com'
          }
        }
      };
    } else {
      throw {
        status: 401,
        message: 'Неверный логин или пароль',
        data: null
      };
    }
  }

  // Выход
  async logout(): Promise<MISResponse<null>> {
    await this.delay(300);
    this.token = null;
    return {
      status: 200,
      message: 'Выход выполнен успешно',
      data: null
    };
  }

  // Получение списка районов
  async getDistricts(): Promise<District[]> {
    // В реальном приложении здесь будет запрос к API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Центральный район' },
          { id: '2', name: 'Адмиралтейский район' },
          { id: '3', name: 'Василеостровский район' },
          { id: '4', name: 'Выборгский район' },
          { id: '5', name: 'Калининский район' }
        ]);
      }, 500);
    });
  }

  // Получение списка медицинских учреждений по id района
  async getMedicalInstitutionsByDistrict(districtId: string): Promise<MedicalInstitution[]> {
    // В реальном приложении здесь будет запрос к API
    return new Promise((resolve) => {
      setTimeout(() => {
        const institutionsByDistrict: Record<string, MedicalInstitution[]> = {
          '1': [
            { id: '101', name: 'Поликлиника №1', address: 'ул. Пушкина, 10', districtId: '1', phone: '+7 (812) 123-45-67' },
            { id: '102', name: 'Городская больница №1', address: 'Невский пр., 15', districtId: '1', phone: '+7 (812) 234-56-78' }
          ],
          '2': [
            { id: '201', name: 'Поликлиника №2', address: 'ул. Гоголя, 5', districtId: '2', phone: '+7 (812) 345-67-89' },
            { id: '202', name: 'Детская поликлиника №1', address: 'ул. Садовая, 20', districtId: '2', phone: '+7 (812) 456-78-90' }
          ],
          '3': [
            { id: '301', name: 'Городская поликлиника №3', address: 'Большой пр. В.О., 35', districtId: '3', phone: '+7 (812) 567-89-01' },
          ],
          '4': [
            { id: '401', name: 'Выборгская поликлиника', address: 'пр. Энгельса, 50', districtId: '4', phone: '+7 (812) 678-90-12' },
            { id: '402', name: 'Медицинский центр "Здоровье"', address: 'Выборгское шоссе, 15', districtId: '4', phone: '+7 (812) 789-01-23' }
          ],
          '5': [
            { id: '501', name: 'Калининская поликлиника', address: 'Гражданский пр., 25', districtId: '5', phone: '+7 (812) 890-12-34' },
            { id: '502', name: 'Медицинский центр "Доктор"', address: 'пр. Науки, 10', districtId: '5', phone: '+7 (812) 901-23-45' }
          ]
        };
        
        resolve(institutionsByDistrict[districtId] || []);
      }, 700);
    });
  }

  // Получение списка специальностей по медицинскому учреждению
  async getSpecialtiesByInstitution(institutionId: string): Promise<MISResponse<Specialty[]>> {
    this.checkAuth();
    await this.delay(500);
    
    const specialties: Specialty[] = [
      { id: '1', name: 'Терапевт' },
      { id: '2', name: 'Педиатр' },
      { id: '3', name: 'Хирург' },
      { id: '4', name: 'Офтальмолог' },
      { id: '5', name: 'Невролог' },
      { id: '6', name: 'Кардиолог' },
      { id: '7', name: 'Эндокринолог' },
      { id: '8', name: 'Гастроэнтеролог' }
    ];
    
    // Фильтрация по учреждению (в реальном API)
    return {
      status: 200,
      message: 'Список специальностей получен успешно',
      data: specialties.slice(0, Number(institutionId) + 3)
    };
  }

  // Получение списка врачей по специальности и учреждению
  async getDoctorsBySpecialtyAndInstitution(specialtyId: string, institutionId: string): Promise<MISResponse<Doctor[]>> {
    this.checkAuth();
    await this.delay(800);
    
    const doctors: Doctor[] = [
      { id: '1', name: 'Петров Петр Петрович', specialty: 'Терапевт', photo: '/images/doctors/doctor1.jpg' },
      { id: '2', name: 'Сидорова Анна Ивановна', specialty: 'Терапевт', photo: '/images/doctors/doctor2.jpg' },
      { id: '3', name: 'Кузнецов Иван Сергеевич', specialty: 'Педиатр', photo: '/images/doctors/doctor3.jpg' },
      { id: '4', name: 'Николаева Мария Александровна', specialty: 'Хирург', photo: '/images/doctors/doctor4.jpg' },
      { id: '5', name: 'Соколов Дмитрий Игоревич', specialty: 'Офтальмолог', photo: '/images/doctors/doctor5.jpg' },
      { id: '6', name: 'Волкова Ольга Викторовна', specialty: 'Невролог', photo: '/images/doctors/doctor6.jpg' }
    ];
    
    // Фильтрация по специальности и учреждению (в реальном API)
    const filteredDoctors = doctors.filter((_, index) => index % (Number(specialtyId) + 1) === 0);
    return {
      status: 200,
      message: 'Список врачей получен успешно',
      data: filteredDoctors.length > 0 ? filteredDoctors : doctors.slice(0, 2)
    };
  }

  // Получение доступных слотов времени для записи к врачу
  async getAvailableTimeSlots(doctorId: string, date: string): Promise<MISResponse<TimeSlot[]>> {
    this.checkAuth();
    await this.delay(600);
    
    // Генерация слотов времени
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Некоторые слоты помечаем как недоступные
        const available = Math.random() > 0.3;
        
        slots.push({
          id: `${date}-${timeString}`,
          time: timeString,
          date: date,
          available: available
        });
      }
    }
    
    return {
      status: 200,
      message: 'Список доступных слотов времени получен успешно',
      data: slots
    };
  }

  // Запись на прием
  async createAppointment(
    doctorId: string, 
    clinicId: string, 
    date: string, 
    timeSlotId: string
  ): Promise<MISResponse<Appointment>> {
    this.checkAuth();
    await this.delay(1000);
    
    // Получение информации о враче, специальности и клинике
    const doctorsResponse = await this.getDoctorsBySpecialtyAndInstitution('1', clinicId);
    const doctor = doctorsResponse.data.find(d => d.id === doctorId) || doctorsResponse.data[0];
    
    // Получаем медицинские учреждения
    const institutions = await this.getMedicalInstitutionsByDistrict('1');
    const clinic = institutions.find((c: MedicalInstitution) => c.id === clinicId) || institutions[0];
    
    // Имитация ответа от сервера
    return {
      status: 200,
      message: 'Запись на прием создана успешно',
      data: {
        id: Math.random().toString(36).substring(2, 15),
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        clinicId: clinic.id,
        clinicName: clinic.name,
        date: date,
        time: timeSlotId.split('-')[1],
        status: 'confirmed'
      }
    };
  }

  // Получение истории записей
  async getAppointmentHistory(): Promise<MISResponse<Appointment[]>> {
    this.checkAuth();
    await this.delay(700);
    
    return {
      status: 200,
      message: 'История записей получена успешно',
      data: [
        {
          id: '1',
          doctorId: '1',
          doctorName: 'Петров Петр Петрович',
          specialty: 'Терапевт',
          clinicId: '1',
          clinicName: 'Городская поликлиника №1',
          date: '2023-05-15',
          time: '10:00',
          status: 'completed'
        },
        {
          id: '2',
          doctorId: '5',
          doctorName: 'Соколов Дмитрий Игоревич',
          specialty: 'Офтальмолог',
          clinicId: '3',
          clinicName: 'Медицинский центр "Здоровье"',
          date: '2023-06-22',
          time: '14:30',
          status: 'confirmed'
        }
      ]
    };
  }

  // Проверка авторизации
  private checkAuth() {
    if (!this.token) {
      throw {
        status: 401,
        message: 'Не авторизован',
        data: null
      };
    }
  }

  // Вспомогательный метод для имитации задержки
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Экспортируем экземпляр сервиса
export const misApiService = new MISApiService(); 