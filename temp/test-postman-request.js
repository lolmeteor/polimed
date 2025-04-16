const axios = require('axios');

// URL из Postman-коллекции (локальный)
const LOCAL_URL = 'http://localhost:1897/HubServiceJson.svc';

// URL из обсуждения (боевой)
const REMOTE_URL = 'http://gw.chel.mnogomed.ru:9095/HubServiceJson.svc';

// Альтернативный вариант URL
const ALT_URL = 'http://gw.chel.mnogomed.ru:9095/HubService.svc';

// Временное значение для GUID и idHistory из Postman-коллекции
const TEMP_GUID = "гуид";
const ID_HISTORY = 53433;

/**
 * Выполняет запрос GetDistrictList как в Postman
 * @param {string} baseUrl - базовый URL API
 */
async function testGetDistrictList(baseUrl) {
  try {
    console.log(`\nТестирование запроса GetDistrictList: ${baseUrl}/GetDistrictList`);
    
    // Формируем запрос точно как в Postman
    const response = await axios.post(`${baseUrl}/GetDistrictList`, {
      guid: TEMP_GUID,
      idHistory: ID_HISTORY
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:');
    
    if (error.response) {
      // Сервер ответил статусом отличным от 2xx
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
      if (error.response.data) {
        console.log('Данные ответа:');
        console.log(typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2) 
          : error.response.data.toString().substring(0, 300) + '...');
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      // Произошла ошибка при настройке запроса
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

/**
 * Выполняет запрос GetLPUList как в Postman
 * @param {string} baseUrl - базовый URL API
 */
async function testGetLPUList(baseUrl) {
  try {
    console.log(`\nТестирование запроса GetLPUList: ${baseUrl}/GetLPUList`);
    
    // Формируем запрос точно как в Postman
    const response = await axios.post(`${baseUrl}/GetLPUList`, {
      idDistrict: "74",
      guid: TEMP_GUID,
      idHistory: ID_HISTORY
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
      if (error.response.data) {
        console.log('Данные ответа:');
        console.log(typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2) 
          : error.response.data.toString().substring(0, 300) + '...');
      }
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

// Запускаем тесты для всех вариантов URL
async function runAllTests() {
  console.log('=== Тестирование API по примеру из Postman-коллекции ===');
  
  // Проверяем локальный URL
  console.log('\n--- Тестирование локального URL ---');
  const localDistrictOk = await testGetDistrictList(LOCAL_URL);
  if (localDistrictOk) {
    await testGetLPUList(LOCAL_URL);
  }
  
  // Проверяем основной URL
  console.log('\n--- Тестирование основного URL ---');
  const remoteDistrictOk = await testGetDistrictList(REMOTE_URL);
  if (remoteDistrictOk) {
    await testGetLPUList(REMOTE_URL);
  }
  
  // Проверяем альтернативный URL
  console.log('\n--- Тестирование альтернативного URL ---');
  const altDistrictOk = await testGetDistrictList(ALT_URL);
  if (altDistrictOk) {
    await testGetLPUList(ALT_URL);
  }
  
  console.log('\n=== Тестирование завершено ===');
}

// Запускаем все тесты
runAllTests();
