/**
 * Конфигурация для подключения к API МИС
 */
export const MIS_API_CONFIG = {
  // URL для SOAP-сервиса
  WSDL_URL: process.env.MIS_WSDL_URL || 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl',
  
  // URL для получения идентификатора процесса
  TOKEN_URL: process.env.MIS_TOKEN_URL || 'http://gw.chel.mnogomed.ru:9095/api/token',
  
  // GUID для авторизации запросов
  GUID: process.env.MIS_GUID || '5aa5aa80-24ed-44b0-8f64-3e71253069b1', // GUID для интеграции с МИС
  
  // ID ЛПУ по умолчанию
  DEFAULT_LPU_ID: process.env.MIS_DEFAULT_LPU_ID || '1570'
}; 