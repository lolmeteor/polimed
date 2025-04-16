const axios = require('axios');
const fs = require('fs');

// Используем URL, который вернул успешный ответ
const API_URL = 'http://gw.chel.mnogomed.ru:9095/HubService.svc';

// Временное значение для GUID и idHistory
const TEMP_GUID = "гуид";
const ID_HISTORY = 53433;

// Константы
const DISTRICT_CHELYABINSK = 74; // Челябинская область

// Массив для хранения полученных данных
const results = {
  district: null,
  lpuList: [],
  specialtiesByLpu: {}
};

/**
 * Отправляет SOAP-запрос к методу GetDistrictList для получения списка районов
 */
async function getDistrictListSoap() {
  try {
    console.log(`\nЗапрос списка районов (GetDistrictList): ${API_URL}`);
    
    // Формируем SOAP-запрос
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:GetDistrictList>
          <tem:guid>${TEMP_GUID}</tem:guid>
          <tem:idHistory>${ID_HISTORY}</tem:idHistory>
        </tem:GetDistrictList>
      </soapenv:Body>
    </soapenv:Envelope>
    `.trim();
    
    // Отправляем запрос
    const response = await axios.post(API_URL, soapRequest, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IHubService/GetDistrictList'
      }
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Получен ответ от GetDistrictList');
    
    // Сохраняем информацию о нужном районе
    const xmlData = response.data;
    
    // Простой парсинг XML для извлечения данных о районе Челябинская область
    const districts = [];
    const districtMatches = xmlData.match(/<a:District>[\s\S]*?<\/a:District>/g);
    
    if (districtMatches) {
      districtMatches.forEach(districtXml => {
        const idMatch = districtXml.match(/<a:IdDistrict>(\d+)<\/a:IdDistrict>/);
        const nameMatch = districtXml.match(/<a:DistrictName>([^<]+)<\/a:DistrictName>/);
        
        if (idMatch && nameMatch) {
          const id = parseInt(idMatch[1]);
          const name = nameMatch[1];
          
          districts.push({ id, name });
          
          // Если это Челябинская область, сохраняем её отдельно
          if (id === DISTRICT_CHELYABINSK) {
            results.district = { id, name };
          }
        }
      });
    }
    
    console.log(`Найдено районов: ${districts.length}`);
    if (results.district) {
      console.log(`Найден искомый район: ${results.district.id} - ${results.district.name}`);
    } else {
      console.log(`Район с ID ${DISTRICT_CHELYABINSK} не найден!`);
    }
    
    return districts;
  } catch (error) {
    logError('GetDistrictListSoap', error);
    return [];
  }
}

/**
 * Отправляет SOAP-запрос к методу GetLPUList для получения списка ЛПУ в районе
 */
async function getLPUListSoap(idDistrict = DISTRICT_CHELYABINSK) {
  try {
    console.log(`\nЗапрос списка ЛПУ для района ${idDistrict} (GetLPUList): ${API_URL}`);
    
    // Формируем SOAP-запрос
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:GetLPUList>
          <tem:IdDistrict>${idDistrict}</tem:IdDistrict>
          <tem:guid>${TEMP_GUID}</tem:guid>
          <tem:idHistory>${ID_HISTORY}</tem:idHistory>
        </tem:GetLPUList>
      </soapenv:Body>
    </soapenv:Envelope>
    `.trim();
    
    // Отправляем запрос
    const response = await axios.post(API_URL, soapRequest, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IHubService/GetLPUList'
      }
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Получен ответ от GetLPUList');
    
    // Парсим список ЛПУ
    const xmlData = response.data;
    const lpuList = [];
    const lpuMatches = xmlData.match(/<a:Clinic>[\s\S]*?<\/a:Clinic>/g);
    
    if (lpuMatches) {
      lpuMatches.forEach(lpuXml => {
        const idMatch = lpuXml.match(/<a:IdLPU>(\d+)<\/a:IdLPU>/);
        const nameMatch = lpuXml.match(/<a:LPUFullName>([^<]+)<\/a:LPUFullName>/);
        const shortNameMatch = lpuXml.match(/<a:LPUShortName>([^<]+)<\/a:LPUShortName>/);
        const districtMatch = lpuXml.match(/<a:District>(\d+)<\/a:District>/);
        const isActiveMatch = lpuXml.match(/<a:IsActive>(\w+)<\/a:IsActive>/);
        
        if (idMatch && nameMatch) {
          const id = parseInt(idMatch[1]);
          const name = nameMatch[1];
          const shortName = shortNameMatch ? shortNameMatch[1] : '';
          const district = districtMatch ? parseInt(districtMatch[1]) : null;
          const isActive = isActiveMatch ? isActiveMatch[1] === 'true' : false;
          
          // Добавляем только активные ЛПУ
          if (isActive) {
            lpuList.push({ id, name, shortName, district });
          }
        }
      });
    }
    
    console.log(`Найдено активных ЛПУ: ${lpuList.length}`);
    
    // Сохраняем результаты
    results.lpuList = lpuList;
    
    return lpuList;
  } catch (error) {
    logError('GetLPUListSoap', error);
    return [];
  }
}

/**
 * Отправляет SOAP-запрос к методу GetSpesialityList для получения списка специальностей в ЛПУ
 */
async function getSpecialityListSoap(idLpu) {
  try {
    console.log(`\nЗапрос списка специальностей для ЛПУ ${idLpu} (GetSpesialityList): ${API_URL}`);
    
    // Формируем SOAP-запрос
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:GetSpesialityList>
          <tem:idLpu>${idLpu}</tem:idLpu>
          <tem:guid>${TEMP_GUID}</tem:guid>
          <tem:idHistory>${ID_HISTORY}</tem:idHistory>
        </tem:GetSpesialityList>
      </soapenv:Body>
    </soapenv:Envelope>
    `.trim();
    
    // Отправляем запрос
    const response = await axios.post(API_URL, soapRequest, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IHubService/GetSpesialityList'
      }
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Получен ответ от GetSpesialityList');
    
    // Парсим список специальностей
    const xmlData = response.data;
    const specialties = [];
    const specialtyMatches = xmlData.match(/<a:Spesiality>[\s\S]*?<\/a:Spesiality>/g);
    
    if (specialtyMatches) {
      specialtyMatches.forEach(specialtyXml => {
        const idMatch = specialtyXml.match(/<a:IdSpesiality>([^<]+)<\/a:IdSpesiality>/);
        const nameMatch = specialtyXml.match(/<a:NameSpesiality>([^<]+)<\/a:NameSpesiality>/);
        const ferIdMatch = specialtyXml.match(/<a:FerIdSpesiality>([^<]+)<\/a:FerIdSpesiality>/);
        
        if (idMatch && nameMatch) {
          const id = idMatch[1];
          const name = nameMatch[1];
          const ferId = ferIdMatch ? ferIdMatch[1] : '';
          
          specialties.push({ id, name, ferId });
        }
      });
    }
    
    console.log(`Найдено специальностей в ЛПУ ${idLpu}: ${specialties.length}`);
    
    // Сохраняем результаты
    results.specialtiesByLpu[idLpu] = specialties;
    
    return specialties;
  } catch (error) {
    logError('GetSpecialityListSoap', error);
    return [];
  }
}

/**
 * Сохраняет результаты в JSON файл
 */
function saveResultsToFile() {
  try {
    const filename = `lpu_specialties_${DISTRICT_CHELYABINSK}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\nРезультаты сохранены в файл ${filename}`);
  } catch (error) {
    console.error('Ошибка при сохранении результатов:', error);
  }
}

/**
 * Вспомогательная функция для логирования ошибок
 */
function logError(methodName, error) {
  console.error(`Ошибка при выполнении ${methodName}:`);
  
  if (error.response) {
    console.log('Статус ответа:', error.response.status);
    console.log('Заголовки ответа:');
    console.log(error.response.headers);
    if (error.response.data) {
      console.log('Данные ответа:');
      console.log(typeof error.response.data === 'object' 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.response.data.toString());
    }
  } else if (error.request) {
    console.error('Запрос отправлен, но ответ не получен');
  } else {
    console.error('Ошибка запроса:', error.message);
  }
}

/**
 * Форматирует список ЛПУ и специальностей для вывода в консоль
 */
function formatResults() {
  let output = '\n=== РЕЗУЛЬТАТЫ ЗАПРОСОВ ===\n';
  
  if (results.district) {
    output += `\nРайон: ${results.district.id} - ${results.district.name}\n`;
  }
  
  output += `\nНайдено ЛПУ: ${results.lpuList.length}\n`;
  
  // Вывод ЛПУ и специальностей
  results.lpuList.forEach(lpu => {
    output += `\n${lpu.id} - ${lpu.name}`;
    
    const specialties = results.specialtiesByLpu[lpu.id] || [];
    if (specialties.length > 0) {
      output += `\n   Специальности (${specialties.length}):\n`;
      specialties.forEach(specialty => {
        output += `   - ${specialty.id} - ${specialty.name}\n`;
      });
    } else {
      output += `\n   Специальностей не найдено\n`;
    }
  });
  
  return output;
}

// Запускаем процесс сбора данных
async function runDataCollection() {
  console.log("=== Начало сбора данных о ЛПУ и специальностях ===");
  
  // Получаем информацию о районе
  await getDistrictListSoap();
  
  if (!results.district) {
    console.error(`Район с ID ${DISTRICT_CHELYABINSK} не найден. Процесс остановлен.`);
    return;
  }
  
  // Получаем список ЛПУ
  const lpuList = await getLPUListSoap(DISTRICT_CHELYABINSK);
  
  if (lpuList.length === 0) {
    console.error(`Не найдено ЛПУ в районе ${DISTRICT_CHELYABINSK}. Процесс остановлен.`);
    return;
  }
  
  // Получаем список специальностей для каждого ЛПУ
  console.log('\nНачинаем получать списки специальностей для всех ЛПУ...');
  
  // Добавляем паузу между запросами, чтобы не перегрузить сервер
  for (const lpu of lpuList) {
    await getSpecialityListSoap(lpu.id);
    // Пауза 1 секунда между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Выводим и сохраняем результаты
  console.log(formatResults());
  saveResultsToFile();
  
  console.log("\n=== Завершение сбора данных о ЛПУ и специальностях ===");
}

// Запускаем сбор данных
runDataCollection();
