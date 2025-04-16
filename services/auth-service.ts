import { hubServiceConfig } from './api-config';

/**
 * Интерфейс для ответа от сервиса авторизации
 */
interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
  expiresAt?: Date;
}

/**
 * Сервис для авторизации и получения токена доступа к API
 */
export class AuthService {
  private tokenUrl: string;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor() {
    this.tokenUrl = hubServiceConfig.tokenUrl;
  }

  /**
   * Проверяет, истек ли срок действия токена
   * @returns true, если токен истек или отсутствует
   */
  private isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return true;
    }
    
    // Добавляем 5-минутный буфер для перестраховки
    const bufferTime = 5 * 60 * 1000; // 5 минут в миллисекундах
    return new Date().getTime() > (this.tokenExpiration.getTime() - bufferTime);
  }

  /**
   * Получает токен доступа
   * @param forceRefresh - принудительно получить новый токен
   * @returns токен доступа или ошибку
   */
  public async getToken(forceRefresh: boolean = false): Promise<AuthResponse> {
    // Если токен уже есть и не истек, возвращаем его
    if (!forceRefresh && this.token && !this.isTokenExpired()) {
      return {
        success: true,
        token: this.token,
        expiresAt: this.tokenExpiration!
      };
    }
    
    try {
      console.log('Запрашиваем новый токен авторизации');
      
      // API для получения токена может использовать разные методы (OAuth, Basic Auth и др.)
      // В данном примере используем простой POST-запрос
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guid: hubServiceConfig.guid,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении токена: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('Токен не найден в ответе');
      }

      this.token = data.token;
      
      // Устанавливаем срок действия токена (предполагаем, что это 1 час)
      // Если API возвращает срок действия токена, используйте его
      const expiresIn = data.expiresIn || 3600; // 1 час в секундах
      this.tokenExpiration = new Date(new Date().getTime() + expiresIn * 1000);
      
      console.log('Новый токен успешно получен', {
        token: this.token ? `${this.token.substring(0, 10)}...` : 'undefined',
        expiresAt: this.tokenExpiration
      });

      return {
        success: true,
        token: this.token || undefined,
        expiresAt: this.tokenExpiration
      };
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Сбрасывает текущий токен
   */
  public clearToken(): void {
    this.token = null;
    this.tokenExpiration = null;
  }
}

// Создаем и экспортируем экземпляр сервиса
export const authService = new AuthService();

// Экспортируем по умолчанию
export default authService; 