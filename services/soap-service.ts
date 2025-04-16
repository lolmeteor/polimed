import * as soap from 'soap';
import { hubServiceConfig } from './api-config';
import axios from 'axios';

/**
 * Класс для работы с SOAP-сервисом МИС
 */
export class SoapService {
  private wsdlUrl: string;
  private proxyUrl: string;
  private guid: string;
  private defaultLpuId: string;
  private useProxy: boolean;

  constructor() {
    this.wsdlUrl = hubServiceConfig.wsdlUrl;
    this.proxyUrl = hubServiceConfig.proxyUrl;
    this.guid = hubServiceConfig.guid;
    this.defaultLpuId = hubServiceConfig.defaultLpuId;
    this.useProxy = hubServiceConfig.useProxy;
  }

  /**
   * Создает SOAP-клиент для прямого подключения к МИС
   * @returns SOAP-клиент
   */
  private async createClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.wsdlUrl, (err, client) => {
        if (err) {
          console.error('Ошибка создания клиента SOAP:', err);
          reject(err);
          return;
        }
        resolve(client);
      });
    });
  }

  /**
   * Получает список районов
   * @param lpuId ID ЛПУ
   * @returns Список районов
   */
  public async getDistrictList(lpuId: string = this.defaultLpuId): Promise<any> {
    try {
      if (this.useProxy) {
        // Используем прокси-сервер
        return await this.callProxyMethod('GetDistrictList', {
          GUID: this.guid,
          LPU_ID: lpuId
        });
      } else {
        // Прямое подключение к МИС через SOAP
        const client = await this.createClient();
        const args = { 
          GUID: this.guid, 
          LPU_ID: lpuId 
        };

        return new Promise((resolve, reject) => {
          client.GetDistrictList(args, (err: any, result: any) => {
            if (err) {
              console.error('Ошибка запроса SOAP GetDistrictList:', err);
              reject(err);
              return;
            }
            resolve(result);
          });
        });
      }
    } catch (error) {
      console.error('Ошибка при выполнении GetDistrictList:', error);
      throw error;
    }
  }

  /**
   * Получает список ЛПУ для указанного района
   * @param districtId ID района
   * @returns Список ЛПУ
   */
  public async getLpuList(districtId: string): Promise<any> {
    try {
      if (this.useProxy) {
        // Используем прокси-сервер
        return await this.callProxyMethod('GetLPUList', {
          IdDistrict: districtId,
          guid: this.guid,
          idHistory: Date.now().toString()
        });
      } else {
        // Прямое подключение к МИС через SOAP
        const client = await this.createClient();
        const args = { 
          IdDistrict: districtId,
          guid: this.guid,
          idHistory: Date.now().toString()
        };

        return new Promise((resolve, reject) => {
          client.GetLPUList(args, (err: any, result: any) => {
            if (err) {
              console.error('Ошибка запроса SOAP GetLPUList:', err);
              reject(err);
              return;
            }
            resolve(result);
          });
        });
      }
    } catch (error) {
      console.error('Ошибка при выполнении GetLPUList:', error);
      throw error;
    }
  }

  /**
   * Получает список специальностей в указанном ЛПУ
   * @param lpuId ID ЛПУ
   * @returns Список специальностей
   */
  public async getSpecialityList(lpuId: string): Promise<any> {
    try {
      if (this.useProxy) {
        // Используем прокси-сервер
        return await this.callProxyMethod('GetSpesialityList', {
          idLpu: lpuId,
          guid: this.guid,
          idHistory: Date.now().toString()
        });
      } else {
        // Прямое подключение к МИС через SOAP
        const client = await this.createClient();
        const args = { 
          idLpu: lpuId,
          guid: this.guid,
          idHistory: Date.now().toString()
        };

        return new Promise((resolve, reject) => {
          client.GetSpesialityList(args, (err: any, result: any) => {
            if (err) {
              console.error('Ошибка запроса SOAP GetSpesialityList:', err);
              reject(err);
              return;
            }
            resolve(result);
          });
        });
      }
    } catch (error) {
      console.error('Ошибка при выполнении GetSpecialityList:', error);
      throw error;
    }
  }
  
  /**
   * Поиск пациента по номеру телефона
   * @param phoneNumber Номер телефона (без +7)
   * @param lpuId ID ЛПУ (по умолчанию из конфигурации)
   * @returns Результат поиска пациента
   */
  public async searchPatientByPhone(phoneNumber: string, lpuId: string = this.defaultLpuId): Promise<any> {
    try {
      console.log(`Поиск пациента по номеру телефона через SOAP: ${phoneNumber}`);
      
      if (this.useProxy) {
        // Используем прокси-сервер
        return await this.callProxyMethod('SearchTop10Patient', {
          idLpu: lpuId,
          guid: this.guid,
          idHistory: Date.now().toString(),
          patient: {
            CellPhone: phoneNumber
          }
        });
      } else {
        // Прямое подключение к МИС через SOAP
        const client = await this.createClient();
        const args = {
          idLpu: lpuId,
          guid: this.guid,
          idHistory: Date.now().toString(),
          patient: {
            CellPhone: phoneNumber
          }
        };
        
        return new Promise((resolve, reject) => {
          client.SearchTop10Patient(args, (err: any, result: any) => {
            if (err) {
              console.error('Ошибка запроса SOAP SearchTop10Patient:', err);
              reject(err);
              return;
            }
            resolve(result);
          });
        });
      }
    } catch (error) {
      console.error('Ошибка при поиске пациента по номеру телефона через SOAP:', error);
      throw error;
    }
  }

  /**
   * Вызывает метод через прокси-сервер
   * @param method Название метода
   * @param params Параметры запроса
   * @returns Результат запроса
   */
  private async callProxyMethod(method: string, params: any): Promise<any> {
    try {
      console.log(`Вызов метода ${method} через прокси-сервер: ${this.proxyUrl}/${method}`);
      
      const response = await axios.post(`${this.proxyUrl}/${method}`, params, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при вызове метода ${method} через прокси:`, error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export const soapService = new SoapService(); 