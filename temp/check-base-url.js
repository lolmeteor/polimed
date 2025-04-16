const axios = require('axios');

// Базовый URL API из Postman-коллекции (без метода)
const BASE_URL = 'http://gw.chel.mnogomed.ru:9095/HubServiceJson.svc';

// Проверка с помощью GET запроса
async function checkBaseUrl() {
  try {
    console.log(`Проверка базового URL: ${BASE_URL}`);
    
    // Выполняем простой GET-запрос к базовому URL
    const response = await axios.get(BASE_URL);
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:');
    console.log(response.headers);
    console.log('Данные ответа (если есть):');
    console.log(response.data);
    
  } catch (error) {
    console.error('Ошибка при проверке базового URL:');
    
    if (error.response) {
      // Сервер ответил статусом отличным от 2xx
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
      
      // Если в ответе есть данные, выводим их
      if (error.response.data) {
        console.log('Данные ответа:');
        console.log(error.response.data);
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Запрос отправлен, но ответ не получен:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Проверка с помощью OPTIONS запроса
async function checkOptions() {
  try {
    console.log(`\nПроверка OPTIONS запроса к: ${BASE_URL}`);
    
    // Выполняем OPTIONS запрос к базовому URL
    const response = await axios.options(BASE_URL);
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:');
    console.log(response.headers);
    
  } catch (error) {
    console.error('Ошибка при OPTIONS запросе:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Проверяем доступность с помощью HEAD запроса
async function checkHead() {
  try {
    console.log(`\nПроверка HEAD запроса к: ${BASE_URL}`);
    
    // Выполняем HEAD запрос к базовому URL
    const response = await axios.head(BASE_URL);
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:');
    console.log(response.headers);
    
  } catch (error) {
    console.error('Ошибка при HEAD запросе:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Проверка альтернативного URL (HTTPS)
async function checkHttpsUrl() {
  try {
    const httpsUrl = BASE_URL.replace('http://', 'https://');
    console.log(`\nПроверка HTTPS URL: ${httpsUrl}`);
    
    // Выполняем запрос к HTTPS URL
    const response = await axios.get(httpsUrl, {
      // Отключаем проверку SSL сертификата для тестирования
      httpsAgent: new (require('https').Agent)({  
        rejectUnauthorized: false
      })
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:');
    console.log(response.headers);
    
  } catch (error) {
    console.error('Ошибка при проверке HTTPS URL:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Проверка локального URL из Postman-коллекции
async function checkLocalUrl() {
  try {
    const localUrl = 'http://localhost:1897/HubServiceJson.svc';
    console.log(`\nПроверка локального URL: ${localUrl}`);
    
    // Пробуем локальный URL из Postman-коллекции
    const response = await axios.get(localUrl);
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:');
    console.log(response.headers);
    
  } catch (error) {
    console.error('Ошибка при проверке локального URL:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
  }
}

// Запускаем проверки последовательно
async function runAllChecks() {
  await checkBaseUrl();
  await checkOptions();
  await checkHead();
  await checkHttpsUrl();
  await checkLocalUrl();
  console.log("\nВсе проверки завершены");
}

runAllChecks();
