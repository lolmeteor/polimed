import { NextResponse } from "next/server"
import { contactsStore } from "../telegram-contact/route"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("🟡 Check Auth: Получен запрос:", data)

    const { telegramId } = data

    if (!telegramId) {
      console.log("🟡 Check Auth: Отсутствует telegramId в запросе")
      return NextResponse.json({ error: "Telegram ID is required" }, { status: 400 })
    }

    // Проверяем, есть ли данные контакта для этого пользователя
    const contactData = contactsStore[telegramId]
    console.log("🟡 Check Auth: Данные контакта из store:", contactData)
    console.log("🟡 Check Auth: Текущее состояние store:", contactsStore)

    if (!contactData) {
      console.log("🟡 Check Auth: Контакт не найден для telegramId:", telegramId)
      return NextResponse.json({
        authenticated: false,
        message: "Contact not found",
      })
    }

    // Проверяем номер телефона в системе клиники
    try {
      console.log("🟡 Check Auth: Проверяем номер телефона:", contactData.phoneNumber)

      // Для тестирования всегда возвращаем положительный результат
      const mockResponse = {
        exists: true,
        hasMultipleProfiles: true,
        profiles: [
          {
            id: "1",
            fullName: "Антонов Алексей Юрьевич",
            firstName: "Алексей",
            patronymic: "Юрьевич",
            lastName: "Антонов",
            birthDate: "10/10/1988",
            age: 36,
            phone: contactData.phoneNumber,
          },
          {
            id: "2",
            fullName: "Антонов Юрий Анатольевич",
            firstName: "Юрий",
            patronymic: "Анатольевич",
            lastName: "Антонов",
            birthDate: "12/03/1949",
            age: 76,
            phone: contactData.phoneNumber,
          },
        ],
      }

      console.log("🟡 Check Auth: Отправляем успешный ответ:", {
        authenticated: true,
        phoneNumber: contactData.phoneNumber,
        ...mockResponse,
      })

      return NextResponse.json({
        authenticated: true,
        phoneNumber: contactData.phoneNumber,
        ...mockResponse,
      })
    } catch (error) {
      console.error("🔴 Check Auth: Ошибка при проверке номера телефона:", error)
      return NextResponse.json({
        authenticated: false,
        error: "Failed to check phone number",
      })
    }
  } catch (error) {
    console.error("🔴 Check Auth: Ошибка при проверке статуса авторизации:", error)
    return NextResponse.json({ error: "Failed to check authentication status" }, { status: 500 })
  }
}

