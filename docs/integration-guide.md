# Руководство по интеграции с внешними сервисами

В данной документации описаны способы интеграции с внешними сервисами, используемыми в приложении "Полимедика". Реализованы три основных метода интеграции согласно инструкции.

## 1. SOAP подключение к МИС

Для взаимодействия с сервером через SOAP используется библиотека `soap` для Node.js.

### Установка и настройка

Добавлена библиотека для работы с SOAP-сервисами:

```bash
npm install soap
```

### Реализация сервиса

Создан сервис `soap-service.ts`, который предоставляет удобный интерфейс для взаимодействия с SOAP API МИС:

```typescript
import * as soap from 'soap';
import { hubServiceConfig } from './api-config';

export class SoapService {
  private wsdlUrl: string;
  private guid: string;
  
  constructor() {
    this.wsdlUrl = hubServiceConfig.wsdlUrl;
    this.guid = hubServiceConfig.guid;
  }
  
  private async createClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.wsdlUrl, (err, client) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(client);
      });
    });
  }
  
  // Пример метода для получения списка районов
  public async getDistrictList(lpuId: string = "1570"): Promise<any> {
    const client = await this.createClient();
    return new Promise((resolve, reject) => {
      client.GetDistrictList({ GUID: this.guid, LPU_ID: lpuId }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  // Другие методы для работы с SOAP API...
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

## 2. API для получения токена

Для получения токена и авторизации запросов реализован сервис `token-service.ts`.

### Установка и настройка

Для работы с HTTP запросами используется встроенный fetch API.

### Реализация сервиса

```typescript
import { hubServiceConfig } from './api-config';

interface TokenResponse {
  token: string;
  expiresAt?: Date;
}

export class TokenService {
  private tokenUrl: string;
  private guid: string;
  private token: string | null = null;
  private expiresAt: Date | null = null;
  
  constructor() {
    this.tokenUrl = hubServiceConfig.tokenUrl;
    this.guid = hubServiceConfig.guid;
  }
  
  public async getToken(forceRefresh: boolean = false): Promise<TokenResponse> {
    // Возвращаем кэшированный токен, если он действителен
    if (!forceRefresh && this.token && this.expiresAt && this.expiresAt > new Date()) {
      return {
        token: this.token,
        expiresAt: this.expiresAt
      };
    }
    
    // Запрашиваем новый токен
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
    
    const data = await response.json();
    
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
  }
  
  // Другие методы для работы с токенами...
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

## Возможные проблемы и решения

1. **SOAP API недоступен**
   - Проверьте доступность сервера
   - Убедитесь, что используется корректный URL
   - Возможно, требуется VPN для доступа

2. **Ошибка получения токена**
   - Проверьте правильность GUID
   - Убедитесь, что сервер доступен

3. **Проблемы с SSH подключением**
   - Проверьте правильность SSH-ключа
   - Убедитесь, что сервер доступен и принимает SSH-соединения
   - Проверьте, что ключ добавлен в authorized_keys на сервере

## Конфигурация

Все параметры подключения хранятся в файле `services/api-config.ts`:

```typescript
// HubService API конфигурация
export const hubServiceConfig = {
  guid: process.env.GUID || '5aa5aa80-24ed-44b0-8f64-3e71253069b1',
  wsdlUrl: process.env.WSDL_URL || 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl',
  tokenUrl: process.env.TOKEN_URL || 'http://gw.chel.mnogomed.ru:9095/api/token',
  defaultLpuId: process.env.DEFAULT_LPU_ID || '1570',
};

// Конфигурация для SSH доступа
export const sshConfig = {
  host: process.env.SSH_HOST || '51.250.34.77',
  user: process.env.SSH_USER || 'ubuntu',
  keyPath: 'cursorinfo/id_rsa',
};
```

Для безопасности рекомендуется хранить чувствительные данные в переменных окружения. 