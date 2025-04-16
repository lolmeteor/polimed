# Руководство по интеграции с внешними сервисами

В данной документации описаны способы интеграции с внешними сервисами, используемыми в приложении "Полимедика". Реализованы три основных метода интеграции согласно инструкции.

## 1. SOAP подключение к МИС через прокси-сервер

Для взаимодействия с МИС используется подключение через прокси-сервер, который перенаправляет запросы в МИС.

### Установка и настройка

Добавлены необходимые библиотеки:

```bash
npm install soap axios
```

### Реализация сервиса

Создан сервис `soap-service.ts`, который предоставляет интерфейс для взаимодействия с SOAP API МИС через прокси-сервер:

```typescript
import * as soap from 'soap';
import { hubServiceConfig } from './api-config';
import axios from 'axios';

export class SoapService {
  private wsdlUrl: string;
  private proxyUrl: string;
  private guid: string;
  private useProxy: boolean;
  
  constructor() {
    this.wsdlUrl = hubServiceConfig.wsdlUrl;
    this.proxyUrl = hubServiceConfig.proxyUrl;
    this.guid = hubServiceConfig.guid;
    this.useProxy = hubServiceConfig.useProxy;
  }
  
  // Метод для получения списка районов
  public async getDistrictList(lpuId: string = "1570"): Promise<any> {
    try {
      if (this.useProxy) {
        // Используем прокси-сервер
        return await this.callProxyMethod('GetDistrictList', {
          GUID: this.guid,
          LPU_ID: lpuId
        });
      } else {
        // Запасной вариант - прямое подключение
        // ...
      }
    } catch (error) {
      console.error('Ошибка при выполнении GetDistrictList:', error);
      throw error;
    }
  }
  
  // Другие методы для работы с SOAP API...
  
  // Метод для вызова API через прокси
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
```

### Пример использования

```typescript
import { soapService } from '../services/soap-service';

async function getDistrictsExample() {
  try {
    const districts = await soapService.getDistrictList();
    console.log('Полученные районы:', districts);
  } catch (error) {
    console.error('Ошибка при получении районов:', error);
  }
}
```

## 2. API для получения токена через прокси

Для получения токена используется тот же прокси-сервер.

### Установка и настройка

Для работы с HTTP запросами используется библиотека axios.

### Реализация сервиса

```typescript
import { hubServiceConfig } from './api-config';
import axios from 'axios';

interface TokenResponse {
  token: string;
  expiresAt?: Date;
}

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
  
  public async getToken(forceRefresh: boolean = false): Promise<TokenResponse> {
    // Возвращаем кэшированный токен, если он действителен
    if (!forceRefresh && this.token && this.expiresAt && this.expiresAt > new Date()) {
      return {
        token: this.token,
        expiresAt: this.expiresAt
      };
    }
    
    try {
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
        // Запасной вариант - прямой запрос к API
        // ...
      }
      
      // Сохраняем полученный токен
      if (data.token) {
        this.token = data.token;
        const expiresIn = data.expiresIn || 3600; // По умолчанию 1 час
        this.expiresAt = new Date(Date.now() + expiresIn * 1000);
        
        return {
          token: this.token,
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
}
```

### Пример использования

```typescript
import { tokenService } from '../services/token-service';

async function authExample() {
  try {
    const { token } = await tokenService.getToken();
    console.log('Полученный токен:', token);
    
    // Использование токена в запросах
    const response = await fetch('http://api.example.com/protected-resource', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Данные с защищенного ресурса:', data);
  } catch (error) {
    console.error('Ошибка авторизации:', error);
  }
}
```

## 3. SSH подключение к серверу

Для SSH подключения и выполнения команд на удаленном сервере реализован сервис `ssh-service.ts`.

### Установка и настройка

Добавлена библиотека для работы с SSH:

```bash
npm install ssh2
npm install --save-dev @types/ssh2
```

### Реализация сервиса

```typescript
import { Client, ClientChannel } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { sshConfig } from './api-config';

export class SshService {
  private host: string;
  private user: string;
  private keyPath: string;
  private privateKey: Buffer | null = null;
  
  constructor() {
    this.host = sshConfig.host;
    this.user = sshConfig.user;
    this.keyPath = sshConfig.keyPath;
    
    try {
      const keyFilePath = path.resolve(process.cwd(), this.keyPath);
      if (fs.existsSync(keyFilePath)) {
        this.privateKey = fs.readFileSync(keyFilePath);
      } else {
        console.error(`SSH ключ не найден: ${keyFilePath}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке SSH-ключа:', error);
    }
  }
  
  public async executeCommand(command: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('SSH-ключ не загружен. Невозможно подключиться.');
    }
    
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';
      
      conn.on('ready', () => {
        conn.exec(command, (err: Error | undefined, stream: ClientChannel) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }
          
          stream.on('close', (code: number) => {
            conn.end();
            resolve(output);
          }).on('data', (data: Buffer) => {
            output += data.toString();
          }).stderr.on('data', (data: Buffer) => {
            console.error(`STDERR: ${data.toString()}`);
          });
        });
      }).on('error', (err: Error) => {
        reject(err);
      }).connect({
        host: this.host,
        username: this.user,
        privateKey: this.privateKey as Buffer
      });
    });
  }
  
  // Пример метода для проверки uptime сервера
  public async checkServerUptime(): Promise<string> {
    return this.executeCommand('uptime');
  }
  
  // Другие вспомогательные методы...
}
```

### Пример использования

```typescript
import { sshService } from '../services/ssh-service';

async function sshExample() {
  try {
    // Проверка uptime сервера
    const uptime = await sshService.checkServerUptime();
    console.log('Uptime сервера:', uptime);
    
    // Произвольная команда
    const result = await sshService.executeCommand('ls -la /var/log');
    console.log('Список файлов в /var/log:', result);
  } catch (error) {
    console.error('Ошибка при выполнении SSH-команд:', error);
  }
}
```

## Тестирование интеграции

Для тестирования всех сервисов создан скрипт `scripts/test-services.js`, который позволяет проверить работу всех трех интеграций:

```bash
# Запуск теста интеграций
node scripts/test-services.js
```

Скрипт выполняет следующие проверки:
1. Доступность прокси-сервера
2. Подключение к SOAP API через прокси
3. Получение токена через прокси
4. SSH-подключение к серверу

## Возможные проблемы и решения

1. **Прокси-сервер недоступен**
   - Проверьте сетевое подключение к серверу 51.250.34.77:3001
   - Убедитесь, что прокси-сервер запущен и работает корректно
   - Проверьте настройки файрвола

2. **Ошибки в ответах от прокси**
   - Проверьте правильность формата запроса
   - Убедитесь, что прокси-сервер корректно настроен для работы с МИС
   - Проверьте лог-файлы на сервере прокси

3. **Проблемы с SSH подключением**
   - Проверьте правильность SSH-ключа
   - Убедитесь, что сервер доступен и принимает SSH-соединения
   - Проверьте, что ключ добавлен в authorized_keys на сервере

## Схема взаимодействия

```
Клиент <-> Прокси-сервер (51.250.34.77:3001) <-> МИС (gw.chel.mnogomed.ru:9095)
```

Все запросы к МИС проходят через прокси-сервер, который обрабатывает запросы, перенаправляет их в МИС и возвращает результаты клиенту.

## Конфигурация

Все параметры подключения хранятся в файле `services/api-config.ts`:

```typescript
// HubService API конфигурация через прокси
export const hubServiceConfig = {
  guid: process.env.GUID || '5aa5aa80-24ed-44b0-8f64-3e71253069b1',
  // Прокси-сервер для подключения к МИС
  proxyUrl: process.env.PROXY_URL || 'http://51.250.34.77:3001/proxy',
  // Оригинальные URL для совместимости
  wsdlUrl: process.env.WSDL_URL || 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl',
  tokenUrl: process.env.TOKEN_URL || 'http://gw.chel.mnogomed.ru:9095/api/token',
  defaultLpuId: process.env.DEFAULT_LPU_ID || '1570',
  // Используем прокси вместо прямого подключения
  useProxy: process.env.USE_PROXY !== 'false',
};

// Конфигурация для SSH доступа
export const sshConfig = {
  host: process.env.SSH_HOST || '51.250.34.77',
  user: process.env.SSH_USER || 'ubuntu',
  keyPath: 'cursorinfo/id_rsa',
};
```

Для безопасности рекомендуется хранить чувствительные данные в переменных окружения. 