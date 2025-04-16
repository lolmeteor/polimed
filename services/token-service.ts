import { hubServiceConfig } from './api-config';
import axios from 'axios';

/**
 * Интерфейс ответа с токеном
 */
interface TokenResponse {
  token: string;
  expiresAt?: Date;
}

/**
 * Сервис для работы с токенами API
 */
export class TokenService {
  private tokenUrl: string;
  private proxyUrl: string;
  private guid: string;
  private token: string | null = null;
  private expiresAt: Date | null = null;
  private useProxy: boolean;

  constructor() {
    this.tokenUrl = hubServiceConfig.tokenUrl;
    this.proxyUrl = hubServiceConfig.proxyUrl;
    this.guid = hubServiceConfig.guid;
    this.useProxy = hubServiceConfig.useProxy;
  }

  /**
   * Получает токен для доступа к API
   * @param forceRefresh Принудительно получить новый токен
   * @returns Объект с токеном и датой истечения срока
   */
  public async getToken(forceRefresh: boolean = false): Promise<TokenResponse> {
    // Проверяем, есть ли действующий токен
    if (!forceRefresh && this.token && this.expiresAt && this.expiresAt > new Date()) {
      return {
        token: this.token,
        expiresAt: this.expiresAt
      };
    }

    try {
      console.log('Получаю новый токен через API...');
      
      let data;
      
      if (this.useProxy) {
        // Получение токена через прокси-сервер
        const response = await axios.post(`${this.proxyUrl}/token`, { 
          guid: this.guid 
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status !== 200) {
          throw new Error(`Ошибка получения токена: ${response.status}`);
        }
        
        data = response.data;
      } else {
        // Прямой запрос к API
        const response = await fetch(this.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ guid: this.guid })
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка получения токена: ${response.status}`);
        }

        data = await response.json();
      }
      
      // Если в ответе есть токен
      if (data.token) {
        this.token = data.token;
        
        // Устанавливаем срок действия токена (предполагаем 1 час, если не указано в ответе)
        const expiresIn = data.expiresIn || 3600; // секунды
        this.expiresAt = new Date(Date.now() + expiresIn * 1000);
        
        return {
          token: this.token as string,
          expiresAt: this.expiresAt
        };
      } else {
        throw new Error('Токен не найден в ответе');
      }
    } catch (error) {
      console.error('Ошибка получения токена:', error);
      throw error;
    }
  }

  /**
   * Проверяет, действителен ли текущий токен
   * @returns true, если токен действителен
   */
  public isTokenValid(): boolean {
    return !!this.token && !!this.expiresAt && this.expiresAt > new Date();
  }

  /**
   * Сбрасывает текущий токен
   */
  public resetToken(): void {
    this.token = null;
    this.expiresAt = null;
  }
}

// Экспортируем экземпляр сервиса
export const tokenService = new TokenService(); 