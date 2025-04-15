import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { contactsStore } from "../telegram-contact/route"
import { MisApiService } from "@/services/mis-api-service"

// Используем токен бота из переменных окружения или устанавливаем актуальный
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7749348003:AAHYr26BF2lm1fU3SdXaxDEAsz2XDnfOyxI"

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

        // Получаем текущую дату и время
        const now = new Date();
        const timestamp = now.toISOString();

        // Сохраняем данные контакта
        contactsStore[senderId] = {
          telegramId: senderId,
          phoneNumber: phoneNumber,
          firstName: contact.first_name,
          lastName: contact.last_name,
          contactUserId: contactUserId,
          storedAt: timestamp
        }

        console.log("🔵 Webhook: Контакт сохранен в store:", contactsStore[senderId])
        console.log("🔵 Webhook: Текущее состояние store:", contactsStore)
        
        // Пытаемся найти пациента в МИС по номеру телефона
        try {
          // Формируем массив возможных форматов телефона
          const phoneFormats = [];
          phoneFormats.push(phoneNumber);
          
          // Только цифры
          const digits = phoneNumber.replace(/\D/g, '');
          phoneFormats.push(digits);
          
          // Добавляем варианты с разными кодами
          if (digits.length === 10) {
            phoneFormats.push(`+7${digits}`);
            phoneFormats.push(`8${digits}`);
          } else if (digits.length === 11) {
            if (digits.startsWith('8')) {
              phoneFormats.push(`+7${digits.substring(1)}`);
            } else if (digits.startsWith('7')) {
              phoneFormats.push(`+7${digits.substring(1)}`);
              phoneFormats.push(`8${digits.substring(1)}`);
            }
          }
          
          let patientFound = false;
          
          // Пробуем последовательно найти пациента в разных форматах
          for (const format of phoneFormats) {
            try {
              const searchResult = await MisApiService.searchPatient({ Phone: format });
              
              if (searchResult.Success && searchResult.Patients?.Patient) {
                patientFound = true;
                console.log(`🟢 Webhook: Найден пациент в МИС с номером ${format}:`, searchResult);
                break;
              }
            } catch (err) {
              console.warn(`🟡 Webhook: Ошибка при поиске пациента с номером ${format}:`, err);
            }
          }
          
          // Отправляем подтверждение пользователю после успешного сохранения контакта
          if (patientFound) {
            await sendMessage(
              senderId, 
              `Спасибо, ${contact.first_name}! Ваш номер телефона ${phoneNumber} успешно сохранен и найден в базе клиники. Теперь вы можете использовать приложение.`
            );
          } else {
            await sendMessage(
              senderId, 
              `Спасибо, ${contact.first_name}! Ваш номер телефона ${phoneNumber} успешно сохранен, но не найден в базе клиники. Пожалуйста, обратитесь в регистратуру.`
            );
          }
        } catch (error) {
          console.error("🔴 Webhook: Ошибка при проверке пациента в МИС:", error);
          
          // Отправляем стандартное сообщение в случае ошибки
          await sendMessage(
            senderId, 
            `Спасибо, ${contact.first_name}! Ваш номер телефона ${phoneNumber} успешно сохранен. Теперь вы можете использовать приложение.`
          );
        }
      } else {
        console.log("🔵 Webhook: Контакт не принадлежит отправителю", { contactUserId, senderId })
        
        // Отправляем сообщение об ошибке
        await sendMessage(
          update.message.from.id,
          "Пожалуйста, предоставьте доступ к своему контакту, а не контакту другого пользователя."
        )
      }
    } else if (update.message?.text === "/start") {
      // Отправляем приветственное сообщение при команде /start
      await sendMessage(
        update.message.from.id,
        "Добро пожаловать в Полимедика бот! Пожалуйста, предоставьте свой контакт для авторизации."
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("🔴 Webhook: Ошибка при обработке вебхука Telegram:", error)
    return NextResponse.json({ error: "Failed to process Telegram webhook" }, { status: 500 })
  }
}

// Функция для отправки текстового сообщения
async function sendMessage(chatId: number | string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      }),
    })

    const data = await response.json()
    
    if (!response.ok || !data.ok) {
      console.error("🔴 Ошибка при отправке сообщения:", data)
      throw new Error(data.description || "Failed to send message")
    }
    
    console.log("🔵 Сообщение успешно отправлено:", { chatId, text: text.substring(0, 50) + (text.length > 50 ? '...' : '') })
    return data
  } catch (error) {
    console.error("🔴 Ошибка при отправке сообщения:", error)
    throw error
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

