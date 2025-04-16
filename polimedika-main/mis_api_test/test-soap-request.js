const axios = require('axios');

// Используем URL, который вернул статус 415
const API_URL = 'http://gw.chel.mnogomed.ru:9095/HubService.svc';

// Временное значение для GUID и idHistory
const TEMP_GUID = "гуид";
const ID_HISTORY = 53433;

/**
 * Отправляет SOAP-запрос к методу GetDistrictList
 */
async function getDistrictListSoap() {
  try {
    console.log(`\nТестирование SOAP-запроса GetDistrictList: ${API_URL}/GetDistrictList`);
    
    // Формируем SOAP-запрос
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:hub="http://schemas.datacontract.org/2004/07/HubService2">
      <soapenv:Header/>
      <soapenv:Body>
        <hub:GetDistrictList>
          <hub:guid>${TEMP_GUID}</hub:guid>
          <hub:idHistory>${ID_HISTORY}</hub:idHistory>
        </hub:GetDistrictList>
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
    console.log('Данные ответа:');
    console.log(response.data);
    
    return true;
  } catch (error) {
    console.error('Ошибка при выполнении SOAP-запроса:');
    
    if (error.response) {
      console.log('Статус ответа:', error.response.status);
      console.log('Заголовки ответа:');
      console.log(error.response.headers);
      if (error.response.data) {
        console.log('Данные ответа:');
        console.log(typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2) 
          : error.response.data.toString().substring(0, 500) + '...');
      }
    } else if (error.request) {
      console.error('Запрос отправлен, но ответ не получен');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return false;
  }
}

// Запускаем тест SOAP-запроса
getDistrictListSoap();
