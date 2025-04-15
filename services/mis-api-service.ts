import soap from 'soap';
import { MIS_API_CONFIG } from '@/constants/api-config';
import {
  MisDistrictListResponse,
  MisLPUListResponse,
  MisSpecialityListResponse,
  MisDoctorListResponse,
  MisAvailableDatesResponse,
  MisAvailableAppointmentsResponse,
  MisSetAppointmentResponse,
  MisSearchPatientResponse,
  MisPatient
} from '@/types/mis-api';

/**
 * Класс для работы с SOAP API МИС через HubService
 */
export class MisApiService {
  private static soapClient: any = null;
  private static WSDL_URL = MIS_API_CONFIG.WSDL_URL;
  private static TOKEN_URL = MIS_API_CONFIG.TOKEN_URL;
  private static GUID = MIS_API_CONFIG.GUID;
  
  /**
   * Инициализирует SOAP клиент, если он еще не создан
   */
  private static async getClient() {
    if (!this.soapClient) {
      try {
        console.log('Initializing SOAP client...');
        this.soapClient = await soap.createClientAsync(this.WSDL_URL);
        console.log('SOAP client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SOAP client:', error);
        throw new Error('Не удалось подключиться к сервису МИС');
      }
    }
    return this.soapClient;
  }
  
  /**
   * Получает идентификатор процесса (Process ID) для авторизации запросов
   */
  private static async getProcessId() {
    try {
      const response = await fetch(this.TOKEN_URL);
      const data = await response.json();
      
      if (!data.success || !data.content) {
        throw new Error('Не удалось получить идентификатор процесса');
      }
      
      return data.content;
    } catch (error) {
      console.error('Failed to get Process ID:', error);
      throw new Error('Не удалось получить идентификатор процесса');
    }
  }
  
  /**
   * Подготавливает клиент для выполнения запроса:
   * - Получает SOAP клиент
   * - Получает Process ID
   * - Устанавливает SOAP заголовок с Process ID
   */
  private static async prepareClient() {
    const client = await this.getClient();
    const processId = await this.getProcessId();
    
    // Очищаем предыдущие заголовки и устанавливаем новый
    client.clearSoapHeaders();
    client.addSoapHeader('<Authorization xmlns="http://tempuri.org/">' + processId + '</Authorization>');
    
    return client;
  }
  
  /**
   * Получает список районов
   */
  static async getDistrictList(): Promise<MisDistrictListResponse> {
    try {
      const client = await this.prepareClient();
      const params = { guid: this.GUID, idHistory: null };
      
      const [result] = await client.GetDistrictListAsync(params);
      return result.GetDistrictListResult;
    } catch (error) {
      console.error('Error getting district list:', error);
      throw new Error('Не удалось получить список районов');
    }
  }
  
  /**
   * Получает список ЛПУ по району
   */
  static async getLPUList(idDistrict: string): Promise<MisLPUListResponse> {
    try {
      const client = await this.prepareClient();
      const params = { idDistrict, guid: this.GUID, idHistory: null };
      
      const [result] = await client.GetLPUListAsync(params);
      return result.GetLPUListResult;
    } catch (error) {
      console.error('Error getting LPU list:', error);
      throw new Error('Не удалось получить список ЛПУ');
    }
  }
  
  /**
   * Получает список специальностей по ЛПУ
   */
  static async getSpecialityList(idLpu: string): Promise<MisSpecialityListResponse> {
    try {
      const client = await this.prepareClient();
      const params = { idLpu, guid: this.GUID, idHistory: null };
      
      const [result] = await client.GetSpesialityListAsync(params);
      return result.GetSpesialityListResult;
    } catch (error) {
      console.error('Error getting speciality list:', error);
      throw new Error('Не удалось получить список специальностей');
    }
  }
  
  /**
   * Получает список врачей по ЛПУ и специальности
   */
  static async getDoctorList(idLpu: string, idSpesiality: string): Promise<MisDoctorListResponse> {
    try {
      const client = await this.prepareClient();
      const params = { idLpu, idSpesiality, guid: this.GUID, idHistory: null };
      
      const [result] = await client.GetDoctorListAsync(params);
      return result.GetDoctorListResult;
    } catch (error) {
      console.error('Error getting doctor list:', error);
      throw new Error('Не удалось получить список врачей');
    }
  }
  
  /**
   * Получает доступные даты для записи
   */
  static async getAvailableDates(
    idLpu: string, 
    idDoc: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<MisAvailableDatesResponse> {
    try {
      const client = await this.prepareClient();
      
      // Форматируем даты в формат /Date(timestamp)/
      const startVisit = `/Date(${startDate.getTime()}+0300)/`;
      const endVisit = `/Date(${endDate.getTime()}+0300)/`;
      
      const params = {
        idLpu, 
        idDoc, 
        startVisit,
        endVisit,
        guid: this.GUID, 
        idHistory: null
      };
      
      const [result] = await client.GetAvailableDatesAsync(params);
      return result.GetAvailableDatesResult;
    } catch (error) {
      console.error('Error getting available dates:', error);
      throw new Error('Не удалось получить доступные даты');
    }
  }
  
  /**
   * Получает доступные слоты для записи
   */
  static async getAvailableAppointments(
    idLpu: string, 
    idDoc: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<MisAvailableAppointmentsResponse> {
    try {
      const client = await this.prepareClient();
      
      // Форматируем даты в формат /Date(timestamp)/
      const startVisit = `/Date(${startDate.getTime()}+0300)/`;
      const endVisit = `/Date(${endDate.getTime()}+0300)/`;
      
      const params = {
        idLpu, 
        idDoc, 
        startVisit,
        endVisit,
        guid: this.GUID, 
        idHistory: null
      };
      
      const [result] = await client.GetAvaibleAppointmentsAsync(params);
      return result.GetAvaibleAppointmentsResult;
    } catch (error) {
      console.error('Error getting available appointments:', error);
      throw new Error('Не удалось получить доступные слоты записи');
    }
  }
  
  /**
   * Создает запись на прием
   */
  static async setAppointment(
    idAppointment: string, 
    idLpu: string, 
    idPat: string, 
    idHistory: string | null = null
  ): Promise<MisSetAppointmentResponse> {
    try {
      const client = await this.prepareClient();
      const params = { idAppointment, idLpu, idPat, guid: this.GUID, idHistory };
      
      const [result] = await client.SetAppointmentAsync(params);
      return result.SetAppointmentResult;
    } catch (error) {
      console.error('Error setting appointment:', error);
      throw new Error('Не удалось создать запись на прием');
    }
  }
  
  /**
   * Поиск пациента в системе
   */
  static async searchPatient(patientData: Partial<MisPatient>, idLpu: string = MIS_API_CONFIG.DEFAULT_LPU_ID): Promise<MisSearchPatientResponse> {
    try {
      const client = await this.prepareClient();
      
      const params = {
        patient: patientData,
        idLpu, 
        guid: this.GUID,
        idHistory: null
      };
      
      const [result] = await client.SearchTop10PatientAsync(params);
      return result.SearchTop10PatientResult;
    } catch (error) {
      console.error('Error searching patient:', error);
      throw new Error('Не удалось найти пациента');
    }
  }
} 