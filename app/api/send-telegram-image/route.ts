import { NextRequest, NextResponse } from 'next/server';
import getConfig from 'next/config';

// Обработчик POST-запросов для отправки изображений в Telegram
export async function POST(req: NextRequest) {
  try {
    console.log("Начало обработки запроса на отправку изображения");
    
    // Используем разные способы получения токена для повышенной надежности
    let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    
    // Если токен не найден, пробуем получить его через serverRuntimeConfig
    if (!TELEGRAM_BOT_TOKEN) {
      const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };
      TELEGRAM_BOT_TOKEN = serverRuntimeConfig.TELEGRAM_BOT_TOKEN;
      console.log("Попытка получить токен из serverRuntimeConfig");
    }
    
    // Устанавливаем актуальный токен в качестве запасного варианта
    if (!TELEGRAM_BOT_TOKEN) {
      TELEGRAM_BOT_TOKEN = '7749348003:AAHYr26BF2lm1fU3SdXaxDEAsz2XDnfOyxI';
      console.log("Используем захардкоженный токен (только для отладки)");
    }
    
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Критическая ошибка: Токен бота Telegram не настроен в переменных окружения');
      return NextResponse.json(
        { success: false, error: 'Токен бота не настроен на сервере' }, 
        { status: 500 }
      );
    }

    console.log("Токен бота получен для использования в запросе");

    // Получаем данные из запроса
    const formData = await req.formData();
    const telegramId = formData.get('chat_id');
    const imageFile = formData.get('photo') as Blob;
    const fileName = formData.get('fileName') as string || 'талон.png';

    console.log("Полученные данные:", {
      telegramId: telegramId,
      hasImage: !!imageFile,
      imageSize: imageFile?.size,
      fileName: fileName
    });

    if (!telegramId || !imageFile) {
      console.error('Ошибка валидации:', {
        hasTelegramId: !!telegramId,
        hasImage: !!imageFile
      });
      return NextResponse.json(
        { success: false, error: 'Отсутствуют обязательные параметры (chat_id или photo)' }, 
        { status: 400 }
      );
    }

    // Создаем новую форму для отправки в Telegram API
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', telegramId.toString());
    telegramFormData.append('photo', imageFile, fileName);

    console.log("Подготовлен запрос к Telegram API");

    // Отправляем запрос в Telegram API
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: telegramFormData,
      }
    );

    console.log("Получен ответ от Telegram API:", {
      status: telegramResponse.status,
      statusText: telegramResponse.statusText
    });

    const telegramData = await telegramResponse.json();
    console.log("Данные ответа от Telegram:", telegramData);

    if (telegramResponse.ok && telegramData.ok) {
      console.log("Изображение успешно отправлено в Telegram");
      return NextResponse.json({ success: true });
    } else {
      console.error('Ошибка при отправке в Telegram:', {
        status: telegramResponse.status,
        response: telegramData
      });
      return NextResponse.json(
        { 
          success: false, 
          error: telegramData.description || 'Ошибка при отправке в Telegram',
          details: telegramData
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Критическая ошибка при обработке запроса:', {
      message: error.message,
      stack: error.stack,
      error
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error.message
      },
      { status: 500 }
    );
  }
} 