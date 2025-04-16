import { NextResponse } from "next/server"

// Интерфейс для данных контакта
interface ContactData {
  telegramId: number
  phoneNumber: string
  firstName: string
  lastName?: string
  contactUserId?: number
}

// Временное хранилище контактов (в реальном приложении использовать базу данных)
const contactsStore: Record<number, ContactData> = {}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Получены данные контакта от бота:", data)

    // Проверяем наличие необходимых полей
    if (!data.telegramId || !data.phoneNumber) {
      return NextResponse.json({ error: "Missing required fields: telegramId or phoneNumber" }, { status: 400 })
    }

    // Проверяем, что контакт принадлежит пользователю
    if (data.contactUserId && data.contactUserId !== data.telegramId) {
      return NextResponse.json({ error: "Contact does not belong to the user" }, { status: 400 })
    }

    // Форматируем номер телефона
    const phoneNumber = data.phoneNumber.startsWith('+') 
      ? data.phoneNumber 
      : `+${data.phoneNumber}`

    // Сохраняем данные контакта
    contactsStore[data.telegramId] = {
      telegramId: data.telegramId,
      phoneNumber: phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      contactUserId: data.contactUserId,
    }

    console.log("Контакт сохранен:", contactsStore[data.telegramId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при обработке данных контакта:", error)
    return NextResponse.json({ error: "Failed to process contact data" }, { status: 500 })
  }
}

// Экспортируем хранилище контактов для использования в других эндпоинтах
export { contactsStore }

