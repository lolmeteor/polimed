const axios = require('axios');

// Базовые URL
const BASE_URL = 'http://gw.chel.mnogomed.ru:9095';
const TOKEN_URL = `${BASE_URL}/api/token`;
const SESSION_URL = `${BASE_URL}/api/session`;
const API_URL = `${BASE_URL}/HubServiceJson.svc`;

// Временное значение для GUID (заглушка)
const TEMP_GUID = "гуид";

// Хранение полученного токена
let processToken = null;

/**
 * Шаг 1: Получение идентификатора процесса (токена)
 */
async function getProcessToken() {
  try {
    console.log(`Получение идентификатора процесса: ${TOKEN_URL}`);
    
    const response = await axios.get(TOKEN_URL);
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success && response.data.content) {
      processToken = response.data.content;
      console.log(`Успешно получен идентификатор процесса: ${processToken}`);
      return processToken;
    } else {
      console.error('Не удалось извлечь идентификатор процесса из ответа');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении идентификатора процесса:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Данные ответа:', error.response.data);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return null;
  }
}

/**
 * Шаг 2: Проверка токена
 */
async function checkToken(token) {
  if (!token) {
    console.error('Токен не указан');
    return false;
  }
  
  try {
    console.log(`\nПроверка токена: ${SESSION_URL}?token=${token}`);
    
    const response = await axios.get(`${SESSION_URL}?token=${token}`);
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success) {
      console.log('Токен действителен');
      return true;
    } else {
      console.error('Токен недействителен');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Данные ответа:', error.response.data);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

/**
 * Шаг 3: Получение списка районов с использованием токена
 */
async function getDistrictList(token) {
  if (!token) {
    console.error('Токен не указан');
    return false;
  }
  
  try {
    console.log(`\nЗапрос GetDistrictList с токеном авторизации`);
    
    // Устанавливаем заголовок Authorization
    const response = await axios.post(`${API_URL}/GetDistrictList`, 
      {
        guid: TEMP_GUID,
        idHistory: Math.floor(Math.random() * 100000)
      },
      {
        headers: {
          'Authorization': token
        }
      }
    );
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Ошибка при выполнении запроса GetDistrictList:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Данные ответа:', error.response.data);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

/**
 * Шаг 4: Пробуем получить список специальностей с использованием специального ID пациента
 */
async function getSpecialityList(token) {
  if (!token) {
    console.error('Токен не указан');
    return false;
  }
  
  try {
    console.log(`\nЗапрос GetSpesialityList со специальным ID пациента`);
    
    // Устанавливаем заголовок Authorization и используем специальный ID пациента
    const response = await axios.post(`${API_URL}/GetSpesialityList`, 
      {
        idLpu: "74",  // Примерный ID ЛПУ
        idPat: "-2147483647",  // Специальный ID для неотфильтрованных данных
        guid: TEMP_GUID,
        idHistory: Math.floor(Math.random() * 100000)
      },
      {
        headers: {
          'Authorization': token
        }
      }
    );
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Ошибка при выполнении запроса GetSpesialityList:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Данные ответа:', error.response.data);
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

// Запускаем последовательность запросов
async function runApiTests() {
  try {
    // Шаг 1: Получаем токен
    const token = await getProcessToken();
    if (!token) {
      console.error('Не удалось получить идентификатор процесса. Тесты остановлены.');
      return;
    }
    
    // Шаг 2: Проверяем токен
    const isTokenValid = await checkToken(token);
    if (!isTokenValid) {
      console.error('Токен недействителен. Тесты остановлены.');
      return;
    }
    
    // Шаг 3: Получаем список районов
    const districtsOk = await getDistrictList(token);
    if (!districtsOk) {
      console.warn('Не удалось получить список районов. Продолжаем тесты...');
    }
    
    // Шаг 4: Получаем список специальностей
    const specialityOk = await getSpecialityList(token);
    if (!specialityOk) {
      console.warn('Не удалось получить список специальностей.');
    }
    
    console.log('\nТесты API завершены');
  } catch (error) {
    console.error('Ошибка при выполнении тестов:', error);
  }
}

// Запускаем тесты
runApiTests();
