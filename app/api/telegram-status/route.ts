import { NextResponse } from 'next/server';

// Токен бота из переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export async function GET() {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({
        status: 'error',
        message: 'Токен Telegram-бота не настроен',
      }, { status: 500 });
    }
    
    // Запрашиваем информацию о боте для проверки валидности токена
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      const botInfo = data.result;
      
      return NextResponse.json({
        status: 'connected',
        message: 'Подключение к Telegram API работает',
        data: {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
          is_bot: botInfo.is_bot,
          configured_username: BOT_USERNAME
        }
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Ошибка при подключении к Telegram API',
        error: data.description || 'Неизвестная ошибка'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Ошибка при проверке статуса Telegram:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при подключении к Telegram API',
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 