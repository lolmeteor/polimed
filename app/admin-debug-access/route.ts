import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Секретный ключ, который будет использоваться для генерации токена
// В реальном приложении следует хранить его в переменных окружения
const SECRET_KEY = 'polimed-debug-secret-key-2024';

/**
 * Генерирует временный токен доступа к административной панели
 */
function generateAdminToken() {
  // Текущая дата в формате YYYYMMDD
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Генерируем токен на основе даты и секретного ключа
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(today);
  return hmac.digest('hex').substring(0, 16);
}

/**
 * Временный API роут для получения URL с токеном доступа к административной панели
 * ВНИМАНИЕ: Этот роут следует удалить после исправления проблем с авторизацией!
 */
export async function GET() {
  try {
    // Генерируем токен
    const token = generateAdminToken();
    
    // Создаем URL для доступа к панели администратора
    const adminUrl = `/admin/status?debug_token=${token}`;
    
    return NextResponse.json({
      success: true,
      message: 'URL для временного доступа к административной панели',
      access_url: adminUrl,
      expires: 'сегодня в полночь'
    });
  } catch (error: any) {
    console.error('Ошибка при генерации токена доступа:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 