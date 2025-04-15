import { NextRequest, NextResponse } from 'next/server';

// Хранилище для контактных данных пользователей
// В реальном приложении должно использоваться постоянное хранилище (БД)
export const contactsStore: Record<string | number, {
  telegramId: number,
  phoneNumber: string,
  firstName: string,
  lastName?: string,
  contactUserId: number,
  storedAt?: string
}> = {}

export async function GET(req: NextRequest) {
  try {
    // Получаем Telegram ID из запроса
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');
    
    console.log(`🔵 Contact API: Получен запрос на проверку контакта для telegramId: ${telegramId}`);
    
    if (!telegramId) {
      console.log('🔴 Contact API: Отсутствует telegramId в запросе');
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }
    
    // Проверяем, сохранен ли контакт для этого пользователя
    const contact = contactsStore[telegramId];
    
    if (contact) {
      console.log(`🟢 Contact API: Найден контакт для telegramId ${telegramId}:`, contact);
      return NextResponse.json({
        found: true,
        ...contact
      });
    } else {
      console.log(`🟡 Contact API: Контакт для telegramId ${telegramId} не найден`);
      return NextResponse.json({ found: false });
    }
    
  } catch (error) {
    console.error('🔴 Contact API: Ошибка при обработке запроса:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обработчик для очистки данных (для тестирования)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');
    
    if (telegramId) {
      console.log(`🔵 Contact API: Удаление контакта для telegramId: ${telegramId}`);
      delete contactsStore[telegramId];
      return NextResponse.json({ success: true, message: `Contact for telegramId ${telegramId} deleted` });
    } else {
      // Если telegramId не указан, очищаем все хранилище
      console.log('🔵 Contact API: Очистка всего хранилища контактов');
      for (const key in contactsStore) {
        delete contactsStore[key];
      }
      return NextResponse.json({ success: true, message: 'All contacts deleted' });
    }
  } catch (error) {
    console.error('🔴 Contact API: Ошибка при удалении контактов:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

