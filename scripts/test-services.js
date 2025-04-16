/**
 * Скрипт для тестирования созданных сервисов
 * Запуск: node scripts/test-services.js
 */

// Импортируем библиотеки для работы с сервисами в соответствии с инструкциями
const soap = require('soap');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

// URL и параметры для тестирования
const WSDL_URL = 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl';
const TOKEN_URL = 'http://gw.chel.mnogomed.ru:9095/api/token';
const PROXY_URL = 'http://51.250.34.77:3001/proxy';
const GUID = '5aa5aa80-24ed-44b0-8f64-3e71253069b1';
const LPU_ID = '1570';
const SSH_CONFIG = {
  host: '51.250.34.77',
  username: 'ubuntu',
  privateKey: fs.readFileSync(path.resolve(__dirname, '../cursorinfo/id_rsa')),
  readyTimeout: 10000 // Увеличиваем таймаут для SSH
};

// 1. SOAP подключение (через прокси)
async function testSoapConnection() {
  console.log('\n=== Тестирование SOAP-подключения (через прокси) ===');
  
  try {
    // Тестируем прокси для метода GetDistrictList
    console.log(`Отправка запроса через прокси: ${PROXY_URL}/GetDistrictList`);
    
    const response = await axios.post(`${PROXY_URL}/GetDistrictList`, {
      GUID: GUID,
      LPU_ID: LPU_ID
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 секунд
    });
    
    if (response.status !== 200) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }
    
    console.log('Результат запроса через прокси получен');
    console.log('Пример данных:', JSON.stringify(response.data).substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('Ошибка запроса через прокси:', error.message);
    console.log('Попробуйте проверить доступность прокси-сервера');
    
    // Пробуем прямое подключение через SOAP как запасной вариант
    console.log('\nПробуем прямое подключение через SOAP...');
    return new Promise((resolve, reject) => {
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
}

// 2. API для получения токена (через прокси)
async function testTokenApi() {
  console.log('\n=== Тестирование API получения токена (через прокси) ===');
  
  try {
    // Через прокси
    console.log(`Отправка запроса на ${PROXY_URL}/token...`);
    
    const response = await axios.post(`${PROXY_URL}/token`, { guid: GUID }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 секунд
    });
    
    console.log('Ответ API через прокси:', response.data);
    
    if (response.data && response.data.token) {
      console.log('Токен успешно получен через прокси:', response.data.token.substring(0, 20) + '...');
      return true;
    } else {
      console.error('Токен не найден в ответе прокси');
      
      // Пробуем напрямую
      console.log('\nПробуем получить токен напрямую...');
      const directResponse = await axios.post(TOKEN_URL, { guid: GUID }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд
      });
      
      if (directResponse.data && directResponse.data.token) {
        console.log('Токен успешно получен напрямую:', directResponse.data.token.substring(0, 20) + '...');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Ошибка при получении токена через прокси:', error.message);
    console.log('Попробуйте проверить доступность прокси-сервера');
    
    try {
      // Пробуем получить токен напрямую
      console.log('\nПробуем получить токен напрямую...');
      const directResponse = await axios.post(TOKEN_URL, { guid: GUID }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд
      });
      
      if (directResponse.data && directResponse.data.token) {
        console.log('Токен успешно получен напрямую:', directResponse.data.token.substring(0, 20) + '...');
        return true;
      }
    } catch (directError) {
      console.error('Ошибка при получении токена напрямую:', directError.message);
    }
    
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

// 4. Проверка доступности прокси-сервера
async function testProxyAvailability() {
  console.log('\n=== Проверка доступности прокси-сервера ===');
  
  try {
    console.log(`Отправка запроса на ${PROXY_URL}...`);
    
    // Простой GET-запрос на базовый URL прокси
    const response = await axios.get(PROXY_URL.replace('/proxy', ''), {
      timeout: 5000 // 5 секунд
    });
    
    console.log(`Статус ответа: ${response.status}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('Прокси-сервер доступен');
      return true;
    } else {
      console.log('Прокси-сервер вернул ошибку');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке доступности прокси:', error.message);
    return false;
  }
}

// Основная функция для запуска всех тестов
async function runAllTests() {
  console.log('===== Запуск тестирования всех сервисов =====');
  
  // 0. Проверка доступности прокси
  const proxyAvailable = await testProxyAvailability();
  console.log(`\nРезультат проверки доступности прокси: ${proxyAvailable ? 'ДОСТУПЕН' : 'НЕДОСТУПЕН'}`);
  
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
  const allSuccess = proxyAvailable && soapResult && tokenResult;
  console.log(`Общий результат: ${allSuccess ? 'ВСЕ ТЕСТЫ УСПЕШНЫ' : 'ЕСТЬ НЕУДАЧНЫЕ ТЕСТЫ'}`);
  
  // Выводим выводы и рекомендации
  console.log('\n===== Выводы и рекомендации =====');
  
  if (!proxyAvailable) {
    console.log('- Прокси-сервер недоступен. Проверьте подключение к серверу 51.250.34.77:3001');
  } else {
    console.log('- Прокси-сервер доступен и работает.');
  }
  
  if (!soapResult) {
    console.log('- SOAP API: Требуется настройка подключения. Проверьте доступность прокси.');
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
    console.log('1. Проверьте доступность прокси-сервера и сетевое подключение');
    console.log('2. Убедитесь в правильности учетных данных (GUID, SSH-ключ)');
    console.log('3. Проверьте настройки прокси-сервера на сервере 51.250.34.77');
  }
}

// Запускаем тестирование
runAllTests(); 