const axios = require('axios');

// Базовый URL API
const BASE_URL = 'http://gw.chel.mnogomed.ru:9095/HubServiceJson.svc';

// Временное значение для GUID (замените на реальное, когда получите)
const TEMP_GUID = "гуид";

// Создаем идентификатор сессии (любое число)
const ID_HISTORY = Math.floor(Math.random() * 100000);

/**
 * Получение списка районов
 */
async function getDistrictList() {
  try {
    console.log(`Запрос GetDistrictList: идентификатор сессии ${ID_HISTORY}`);
    
    const response = await axios.post(`${BASE_URL}/GetDistrictList`, {
      guid: TEMP_GUID,
      idHistory: ID_HISTORY
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:');
    
    if (error.response) {
      // Сервер ответил статусом отличным от 2xx
      console.error('Данные ответа:', error.response.data);
      console.error('Статус:', error.response.status);
      console.error('Заголовки:', error.response.headers);
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Запрос отправлен, но ответ не получен:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('Ошибка запроса:', error.message);
    }
    
    console.error('Конфигурация запроса:', error.config);
  }
}

// Запускаем функцию
getDistrictList().then(() => {
  console.log('Запрос выполнен');
}).catch(err => {
  console.error('Ошибка в основном блоке:', err);
});
