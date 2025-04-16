/**
 * Скрипт для тестирования созданных сервисов
 * Запуск: node scripts/test-services.js
 */

// Импортируем библиотеки для работы с сервисами в соответствии с инструкциями
const soap = require('soap');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default; // Используем axios вместо node-fetch

// URL и параметры для тестирования
const WSDL_URL = 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl';
const TOKEN_URL = 'http://gw.chel.mnogomed.ru:9095/api/token';
const GUID = '5aa5aa80-24ed-44b0-8f64-3e71253069b1';
const LPU_ID = '1570';
const SSH_CONFIG = {
  host: '51.250.34.77',
  username: 'ubuntu',
  privateKey: fs.readFileSync(path.resolve(__dirname, '../cursorinfo/id_rsa')),
  readyTimeout: 10000 // Увеличиваем таймаут для SSH
};

// 1. SOAP подключение
async function testSoapConnection() {
  console.log('\n=== Тестирование SOAP-подключения ===');
  
  return new Promise((resolve, reject) => {
    console.log('Создание SOAP-клиента...');
    
    // Устанавливаем таймаут для запроса
    const options = {
      request: require('axios'),
      timeout: 30000 // 30 секунд
    };
    
    soap.createClient(WSDL_URL, options, function(err, client) {
      if (err) {
        console.error('Ошибка создания клиента SOAP:', err.message);
        console.log('Попробуйте проверить доступность сервера или VPN-соединение');
        resolve(false);
        return;
      }
      
      console.log('SOAP-клиент успешно создан');
      console.log('Отправка запроса GetDistrictList...');
      
      const args = { GUID: GUID, LPU_ID: LPU_ID };
      client.GetDistrictList(args, function(err, result) {
        if (err) {
          console.error('Ошибка запроса SOAP:', err.message);
          resolve(false);
          return;
        }
        
        console.log('Результат SOAP запроса получен');
        console.log('Пример данных:', JSON.stringify(result).substring(0, 200) + '...');
        resolve(true);
      });
    });
  });
}

// 2. API для получения токена
async function testTokenApi() {
  console.log('\n=== Тестирование API получения токена ===');
  
  try {
    console.log(`Отправка запроса на ${TOKEN_URL}...`);
    
    const response = await axios.post(TOKEN_URL, { guid: GUID }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 секунд
    });
    
    console.log('Ответ API:', response.data);
    
    if (response.data && response.data.token) {
      console.log('Токен успешно получен:', response.data.token.substring(0, 20) + '...');
      return true;
    } else {
      console.error('Токен не найден в ответе');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при получении токена:', error.message);
    console.log('Попробуйте проверить доступность сервера или VPN-соединение');
    return false;
  }
}

// 3. SSH подключение
async function testSshConnection() {
  console.log('\n=== Тестирование SSH-подключения ===');
  
  return new Promise((resolve, reject) => {
    console.log('Инициализация SSH-подключения...');
    console.log(`Подключение к ${SSH_CONFIG.host} под пользователем ${SSH_CONFIG.username}`);
    
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('SSH подключение успешно установлено');
      
      conn.exec('uptime', (err, stream) => {
        if (err) {
          console.error('Ошибка выполнения команды:', err.message);
          conn.end();
          resolve(false);
          return;
        }
        
        let data = '';
        stream.on('close', (code) => {
          console.log(`Команда завершена с кодом: ${code}`);
          console.log('Результат выполнения команды uptime:', data);
          conn.end();
          resolve(true);
        }).on('data', (chunk) => {
          data += chunk.toString();
        }).stderr.on('data', (chunk) => {
          console.error('STDERR:', chunk.toString());
        });
      });
    }).on('error', (err) => {
      console.error('Ошибка SSH-подключения:', err.message);
      console.log('Проверьте наличие и правильность SSH-ключа или доступность сервера');
      resolve(false);
    }).connect(SSH_CONFIG);
  });
}

// Основная функция для запуска всех тестов
async function runAllTests() {
  console.log('===== Запуск тестирования всех сервисов =====');
  
  // 1. Тестирование SOAP
  const soapResult = await testSoapConnection();
  console.log(`\nРезультат тестирования SOAP: ${soapResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
  
  // 2. Тестирование API токена
  const tokenResult = await testTokenApi();
  console.log(`\nРезультат тестирования API токена: ${tokenResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
  
  // 3. Тестирование SSH
  const sshResult = await testSshConnection();
  console.log(`\nРезультат тестирования SSH: ${sshResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
  
  // Общий результат
  console.log('\n===== Тестирование завершено =====');
  const allSuccess = soapResult && tokenResult && sshResult;
  console.log(`Общий результат: ${allSuccess ? 'ВСЕ ТЕСТЫ УСПЕШНЫ' : 'ЕСТЬ НЕУДАЧНЫЕ ТЕСТЫ'}`);
  
  // Выводим выводы и рекомендации
  console.log('\n===== Выводы и рекомендации =====');
  
  if (!soapResult) {
    console.log('- SOAP API: Требуется настройка подключения. Возможно, сервер недоступен или требуется VPN.');
  } else {
    console.log('- SOAP API: Подключение работает корректно.');
  }
  
  if (!tokenResult) {
    console.log('- API Токена: Требуется настройка подключения. Проверьте URL и формат данных.');
  } else {
    console.log('- API Токена: Подключение работает корректно.');
  }
  
  if (!sshResult) {
    console.log('- SSH подключение: Требуется настройка. Проверьте SSH ключ и доступность сервера.');
  } else {
    console.log('- SSH подключение: Подключение работает корректно.');
  }
  
  if (!allSuccess) {
    console.log('\nДля исправления ошибок:');
    console.log('1. Проверьте доступность серверов и сетевое подключение');
    console.log('2. Убедитесь в правильности учетных данных (GUID, SSH-ключ)');
    console.log('3. При необходимости настройте VPN для доступа к внутренним ресурсам');
  }
}

// Запускаем тестирование
runAllTests(); 