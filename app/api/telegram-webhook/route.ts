import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { contactsStore } from "../telegram-contact/route"
import { telegramConfig } from '@/services/api-config';

// Токен вашего бота (в реальном приложении должен храниться в переменных окружения)
const BOT_TOKEN = telegramConfig.botToken

// Интерфейс для обновления от Telegram
interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    contact?: {
      phone_number: string
      first_name: string
      last_name?: string
      user_id?: number
      vcard?: string
    }
    text?: string
  }
}

// Функция для проверки подписи данных от WebApp
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Сортируем параметры
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Создаем HMAC
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  return signature === hash;
}

// Функция для отправки фото в Telegram
async function sendPhotoToTelegram(chatId: string, imageBase64: string, botToken: string) {
  try {
    // Конвертируем base64 в буфер
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    
    // Создаем форму для отправки
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', new Blob([imageBuffer]), 'ticket.png');

    // Отправляем запрос в Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (!response.ok || !result.ok) {
      throw new Error(result.description || 'Failed to send photo');
    }

    return result;
  } catch (error) {
    console.error('Error sending photo to Telegram:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const update = await request.json()
    console.log("🔵 Webhook: Получено обновление от Telegram:", JSON.stringify(update, null, 2))

    // Проверяем, содержит ли обновление сообщение с контактом
    if (update.message?.contact) {
      const contact = update.message.contact
      const senderId = update.message.from.id
      const contactUserId = contact.user_id

      console.log(`🔵 Webhook: Получен контакт от пользователя ${senderId}:`, contact)

      // Проверяем, что контакт принадлежит отправителю
      if (contactUserId && contactUserId === senderId) {
        // Форматируем номер телефона
        const phoneNumber = contact.phone_number.startsWith('+') 
          ? contact.phone_number 
          : `+${contact.phone_number}`

        // Сохраняем данные контакта
        contactsStore[senderId] = {
          telegramId: senderId,
          phoneNumber: phoneNumber,
          firstName: contact.first_name,
          lastName: contact.last_name,
          contactUserId: contactUserId,
        }

        console.log("🔵 Webhook: Контакт сохранен в store:", contactsStore[senderId])
        console.log("🔵 Webhook: Текущее состояние store:", contactsStore)
      } else {
        console.log("🔵 Webhook: Контакт не принадлежит отправителю", { contactUserId, senderId })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("🔴 Webhook: Ошибка при обработке вебхука Telegram:", error)
    return NextResponse.json({ error: "Failed to process Telegram webhook" }, { status: 500 })
  }
}

// Функция для форматирования номера телефона
function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы
  let digits = phone.replace(/\D/g, "")

  // Если номер начинается с 8 или 7, заменяем на 7
  if (digits.startsWith("8")) {
    digits = "7" + digits.substring(1)
  }

  // Если номер не начинается с 7, добавляем 7 в начало
  if (!digits.startsWith("7") && digits.length <= 10) {
    digits = "7" + digits
  }

  // Убеждаемся, что у нас есть 11 цифр
  if (digits.length < 11) {
    digits = digits.padEnd(11, "0")
  } else if (digits.length > 11) {
    digits = digits.substring(0, 11)
  }

  // Форматируем номер в виде +7 (XXX) XXX-XX-XX
  return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`
}

