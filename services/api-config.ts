/**
 * Конфигурация для интеграции с внешними API
 */

// HubService API конфигурация
export const hubServiceConfig = {
  guid: process.env.GUID || '5aa5aa80-24ed-44b0-8f64-3e71253069b1',
  wsdlUrl: process.env.WSDL_URL || 'http://gw.chel.mnogomed.ru:9095/HubService.svc?singleWsdl',
  tokenUrl: process.env.TOKEN_URL || 'http://gw.chel.mnogomed.ru:9095/api/token',
  defaultLpuId: process.env.DEFAULT_LPU_ID || '1570',
};

// Telegram Bot конфигурация
export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '7749348003:AAHYr26BF2lm1fU3SdXaxDEAsz2XDnfOyxI',
  botUsername: process.env.TELEGRAM_BOT_USERNAME || 'polimedsaveBot',
};

// Конфигурация для SSH доступа
export const sshConfig = {
  host: process.env.SSH_HOST || '51.250.34.77',
  user: process.env.SSH_USER || 'ubuntu',
  // Путь к SSH-ключу
  keyPath: 'cursorinfo/id_rsa',
};

// Режим отладки
export const debugConfig = {
  secretKey: process.env.DEBUG_SECRET_KEY || 'polimed-debug-secret-key-2024',
  isEnabled: process.env.NODE_ENV === 'development',
};

// Экспорт единого конфига
export default {
  hubService: hubServiceConfig,
  telegram: telegramConfig,
  ssh: sshConfig,
  debug: debugConfig,
}; 