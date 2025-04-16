import * as soap from 'soap';
import { hubServiceConfig } from './api-config';

/**
 * Класс для работы с SOAP-сервисом МИС
 */
export class SoapService {
  private wsdlUrl: string;
  private guid: string;
  private defaultLpuId: string;

  constructor() {
    this.wsdlUrl = hubServiceConfig.wsdlUrl;
    this.guid = hubServiceConfig.guid;
    this.defaultLpuId = hubServiceConfig.defaultLpuId;
  }

  /**
   * Создает SOAP-клиент
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
    } catch (error) {
      console.error('Ошибка при выполнении GetSpecialityList:', error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export const soapService = new SoapService(); 