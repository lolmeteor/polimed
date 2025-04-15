/**
 * Конфигурация для подключения к API МИС
 */
export const MIS_API_CONFIG = {
  // URL для SOAP-сервиса
  WSDL_URL: process.env.MIS_WSDL_URL || process.env.NEXT_PUBLIC_MIS_WSDL_URL || 'http://172.25.144.11/Service/HubService.svc?wsdl',
  
  // URL для получения идентификатора процесса
  TOKEN_URL: process.env.MIS_TOKEN_URL || process.env.NEXT_PUBLIC_MIS_TOKEN_URL || 'http://172.25.144.11/api/token',
  
  // GUID для авторизации запросов
  GUID: process.env.MIS_GUID || process.env.NEXT_PUBLIC_MIS_GUID || '5aa5aa80-24ed-44b0-8f64-3e71253069b1',
  
  // ID ЛПУ по умолчанию
  DEFAULT_LPU_ID: process.env.MIS_DEFAULT_LPU_ID || process.env.NEXT_PUBLIC_MIS_DEFAULT_LPU_ID || '1570'
}; 