import { NextResponse } from 'next/server';
import { contactsStore } from "../telegram-contact/route";

/**
 * API роут для отладки хранения контактов Telegram
 */
export async function GET() {
  try {
    // Получаем количество сохраненных контактов
    const contactsCount = Object.keys(contactsStore).length;
    
    // Подготавливаем данные для возврата
    // Скрываем полный номер, показываем только последние 4 цифры
    const contactsData = Object.entries(contactsStore).map(([telegramId, contact]) => ({
      telegramId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      // Маскируем номер телефона для безопасности
      phoneNumber: contact.phoneNumber.replace(/\d(?=\d{4})/g, "*"),
      storedAt: contact.storedAt || 'неизвестно'
    }));
    
    return NextResponse.json({
      success: true,
      count: contactsCount,
      contacts: contactsData
    });
  } catch (error: any) {
    console.error('Ошибка при получении данных контактов:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 