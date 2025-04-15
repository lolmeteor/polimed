export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Получен запрос на проверку номера телефона:", data)

    const { telegramId, phoneNumber } = data

    if (!phoneNumber) {
      console.error("Отсутствует номер телефона в запросе")
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      // Здесь будет запрос к медицинской системе для проверки номера телефона
      // Для примера используем моковые данные
      console.log("Проверяем номер телефона:", phoneNumber)

      // Для тестирования всегда возвращаем положительный результат
      const mockResponse = {
        exists: true,
        hasMultipleProfiles: false, // Для тестирования: один профиль
        profiles: [
          {
            id: "1",
            fullName: "Иванов Иван Иванович",
            firstName: "Иван",
            lastName: "Иванов",
            patronymic: "Иванович",
            birthDate: "10 / 10 / 1980",
            age: 43,
            phone: phoneNumber,
          },
        ],
      }

      console.log("Отправляем ответ:", mockResponse)
      return new Response(JSON.stringify(mockResponse), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Ошибка при проверке номера телефона:", error)
      return new Response(JSON.stringify({ error: "Failed to check phone number", details: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error)
    return new Response(JSON.stringify({ error: "Invalid request", details: String(error) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}

