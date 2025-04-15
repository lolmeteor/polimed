/**
 * Конфигурация для подключения к API МИС
 */
export const MIS_API_CONFIG = {
  // URL для SOAP-сервиса
  WSDL_URL: process.env.MIS_WSDL_URL || 'http://172.25.144.11/Service/HubService.svc?wsdl',
  
  // URL для получения идентификатора процесса
  TOKEN_URL: process.env.MIS_TOKEN_URL || 'http://172.25.144.11/api/token',
  
  // GUID для авторизации запросов
  GUID: process.env.MIS_GUID || 'гуид', // Заменить на реальный GUID при интеграции
  
  // ID ЛПУ по умолчанию
  DEFAULT_LPU_ID: process.env.MIS_DEFAULT_LPU_ID || '1570'
}; 