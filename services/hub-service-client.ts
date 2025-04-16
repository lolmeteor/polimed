import { hubServiceConfig } from './api-config';

/**
 * Интерфейс для ответа от HubService
 */
interface HubServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Базовый интерфейс для запросов HubService
 */
interface BaseHubServiceRequest {
  guid: string;
  idHistory?: number;
}

/**
 * Интерфейс для запроса списка районов
 */
interface GetDistrictListRequest extends BaseHubServiceRequest {}

/**
 * Интерфейс для запроса списка ЛПУ
 */
interface GetLPUListRequest extends BaseHubServiceRequest {
  idDistrict: string;
}

/**
 * Интерфейс для запроса списка специальностей
 */
interface GetSpecialityListRequest extends BaseHubServiceRequest {
  idLpu: string;
}

/**
 * Интерфейс для запроса списка врачей
 */
interface GetDoctorListRequest extends BaseHubServiceRequest {
  idLpu: string;
  idSpesiality: string;
}

/**
 * Интерфейс для запроса доступных дат
 */
interface GetAvailableDatesRequest extends BaseHubServiceRequest {
  idLpu: string;
  idDoc: string;
  startVisit: string;
  endVisit: string;
}

/**
 * Интерфейс для запроса доступных слотов записи
 */
interface GetAvailableAppointmentsRequest extends BaseHubServiceRequest {
  idLpu: string;
  idDoc: string;
  startVisit: string;
  endVisit: string;
}

/**
 * Интерфейс для запроса на запись к врачу
 */
interface SetAppointmentRequest extends BaseHubServiceRequest {
  idLpu: string;
  idAppointment: string;
  idPat: string;
}

/**
 * Интерфейс для поиска пациента
 */
interface SearchTop10PatientRequest extends BaseHubServiceRequest {
  idLpu: string;
  patient: {
    CellPhone?: string;
    BirthYear?: string;
    FirstName?: string;
    LastName?: string;
    SecondName?: string;
    PolicyNumber?: string;
  };
}

/**
 * Класс клиента для работы с HubService API
 */
export class HubServiceClient {
  private baseUrl: string;
  private guid: string;
  private defaultLpuId: string;
  private idHistory: number;

  constructor() {
    this.baseUrl = hubServiceConfig.wsdlUrl.replace('?singleWsdl', '');
    this.guid = hubServiceConfig.guid;
    this.defaultLpuId = hubServiceConfig.defaultLpuId;
    this.idHistory = Math.floor(Math.random() * 100000); // Генерируем случайный idHistory
  }

  /**
   * Выполняет запрос к HubService JSON API
   * @param endpoint - конечная точка API
   * @param data - данные запроса
   * @returns результат запроса
   */
  private async makeRequest<T, R>(endpoint: string, data: T): Promise<HubServiceResponse<R>> {
    try {
      const url = `${this.baseUrl}Json.svc/${endpoint}`;
      
      console.log(`HubService: Выполняем запрос к ${endpoint}`, { url, data });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`HubService: Получен ответ от ${endpoint}`, result);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`HubService: Ошибка при запросе к ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Получает список районов
   * @returns список районов
   */
  public async getDistrictList(): Promise<HubServiceResponse<any>> {
    const request: GetDistrictListRequest = {
      guid: this.guid,
      idHistory: this.idHistory
    };
    
    return this.makeRequest<GetDistrictListRequest, any>('GetDistrictList', request);
  }

  /**
   * Получает список ЛПУ
   * @param idDistrict - идентификатор района
   * @returns список ЛПУ
   */
  public async getLPUList(idDistrict: string): Promise<HubServiceResponse<any>> {
    const request: GetLPUListRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idDistrict
    };
    
    return this.makeRequest<GetLPUListRequest, any>('GetLPUList', request);
  }

  /**
   * Получает список специальностей
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns список специальностей
   */
  public async getSpecialityList(idLpu: string = this.defaultLpuId): Promise<HubServiceResponse<any>> {
    const request: GetSpecialityListRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu
    };
    
    return this.makeRequest<GetSpecialityListRequest, any>('GetSpesialityList', request);
  }

  /**
   * Получает список врачей
   * @param idSpesiality - идентификатор специальности
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns список врачей
   */
  public async getDoctorList(idSpesiality: string, idLpu: string = this.defaultLpuId): Promise<HubServiceResponse<any>> {
    const request: GetDoctorListRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu,
      idSpesiality
    };
    
    return this.makeRequest<GetDoctorListRequest, any>('GetDoctorList', request);
  }

  /**
   * Получает доступные даты для записи
   * @param idDoc - идентификатор врача
   * @param startVisit - начальная дата (ISO формат)
   * @param endVisit - конечная дата (ISO формат)
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns доступные даты
   */
  public async getAvailableDates(
    idDoc: string, 
    startVisit: Date, 
    endVisit: Date, 
    idLpu: string = this.defaultLpuId
  ): Promise<HubServiceResponse<any>> {
    // Конвертируем даты в формат /Date(timestamp+0300)/
    const startTimestamp = startVisit.getTime();
    const endTimestamp = endVisit.getTime();
    
    const request: GetAvailableDatesRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu,
      idDoc,
      startVisit: `/Date(${startTimestamp}+0300)/`,
      endVisit: `/Date(${endTimestamp}+0300)/`
    };
    
    return this.makeRequest<GetAvailableDatesRequest, any>('GetAvailableDates', request);
  }

  /**
   * Получает доступные слоты для записи
   * @param idDoc - идентификатор врача
   * @param startVisit - начальная дата (ISO формат)
   * @param endVisit - конечная дата (ISO формат)
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns доступные слоты
   */
  public async getAvailableAppointments(
    idDoc: string, 
    startVisit: Date, 
    endVisit: Date, 
    idLpu: string = this.defaultLpuId
  ): Promise<HubServiceResponse<any>> {
    // Конвертируем даты в формат /Date(timestamp+0300)/
    const startTimestamp = startVisit.getTime();
    const endTimestamp = endVisit.getTime();
    
    const request: GetAvailableAppointmentsRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu,
      idDoc,
      startVisit: `/Date(${startTimestamp}+0300)/`,
      endVisit: `/Date(${endTimestamp}+0300)/`
    };
    
    return this.makeRequest<GetAvailableAppointmentsRequest, any>('GetAvaibleAppointments', request);
  }

  /**
   * Выполняет запись на приём
   * @param idAppointment - идентификатор слота для записи
   * @param idPat - идентификатор пациента
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns результат записи
   */
  public async setAppointment(
    idAppointment: string, 
    idPat: string, 
    idLpu: string = this.defaultLpuId
  ): Promise<HubServiceResponse<any>> {
    const request: SetAppointmentRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu,
      idAppointment,
      idPat
    };
    
    return this.makeRequest<SetAppointmentRequest, any>('SetAppointment', request);
  }

  /**
   * Поиск пациентов по параметрам
   * @param searchParams - параметры поиска
   * @param idLpu - идентификатор ЛПУ (по умолчанию из конфигурации)
   * @returns найденные пациенты
   */
  public async searchTop10Patient(
    searchParams: {
      cellPhone?: string;
      birthYear?: string;
      firstName?: string;
      lastName?: string;
      secondName?: string;
      policyNumber?: string;
    },
    idLpu: string = this.defaultLpuId
  ): Promise<HubServiceResponse<any>> {
    const patient: any = {};
    
    if (searchParams.cellPhone) patient.CellPhone = searchParams.cellPhone;
    if (searchParams.birthYear) patient.BirthYear = searchParams.birthYear;
    if (searchParams.firstName) patient.FirstName = searchParams.firstName;
    if (searchParams.lastName) patient.LastName = searchParams.lastName;
    if (searchParams.secondName) patient.SecondName = searchParams.secondName;
    if (searchParams.policyNumber) patient.PolicyNumber = searchParams.policyNumber;
    
    const request: SearchTop10PatientRequest = {
      guid: this.guid,
      idHistory: this.idHistory,
      idLpu,
      patient
    };
    
    return this.makeRequest<SearchTop10PatientRequest, any>('SearchTop10Patient', request);
  }
}

// Экспортируем экземпляр клиента для использования в приложении
export const hubServiceClient = new HubServiceClient();

// Экспортируем клиент по умолчанию
export default hubServiceClient; 