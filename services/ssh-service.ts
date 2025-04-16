import { Client, ClientChannel } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { sshConfig } from './api-config';

/**
 * Класс для работы с SSH-подключением к серверу
 */
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
      // Загружаем приватный ключ из файла
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
  
  /**
   * Выполняет команду на удаленном сервере через SSH
   * @param command Команда для выполнения
   * @returns Результат выполнения команды
   */
  public async executeCommand(command: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('SSH-ключ не загружен. Невозможно подключиться.');
    }
    
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';
      
      conn.on('ready', () => {
        console.log(`SSH-подключение установлено: ${this.user}@${this.host}`);
        
        conn.exec(command, (err: Error | undefined, stream: ClientChannel) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }
          
          stream.on('close', (code: number) => {
            console.log(`SSH-команда завершена с кодом: ${code}`);
            conn.end();
            resolve(output);
          }).on('data', (data: Buffer) => {
            output += data.toString();
          }).stderr.on('data', (data: Buffer) => {
            console.error(`SSH STDERR: ${data.toString()}`);
          });
        });
      }).on('error', (err: Error) => {
        console.error('Ошибка SSH-подключения:', err);
        reject(err);
      }).connect({
        host: this.host,
        username: this.user,
        privateKey: this.privateKey as Buffer
      });
    });
  }
  
  /**
   * Выполняет команду uptime для проверки доступности сервера
   * @returns Результат команды uptime
   */
  public async checkServerUptime(): Promise<string> {
    return this.executeCommand('uptime');
  }
  
  /**
   * Проверяет использование диска на сервере
   * @returns Информация о дисковом пространстве
   */
  public async checkDiskUsage(): Promise<string> {
    return this.executeCommand('df -h');
  }
  
  /**
   * Получает информацию о памяти сервера
   * @returns Информация о памяти
   */
  public async checkMemoryUsage(): Promise<string> {
    return this.executeCommand('free -h');
  }
  
  /**
   * Получает список активных процессов на сервере
   * @returns Список процессов
   */
  public async getProcessList(): Promise<string> {
    return this.executeCommand('ps aux | head -10');
  }
}

// Экспортируем экземпляр сервиса
export const sshService = new SshService(); 