// Токен вашего бота (в реальном приложении должен храниться в переменных окружения)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN"

// Улучшаем обработку ошибок и добавляем больше логирования
export async function GET(request: Request) {
  try {
    // Получаем URL вебхука из запроса
    const url = new URL(request.url)
    const webhookUrl = url.searchParams.get("url")

    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: "Webhook URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Проверяем, что URL начинается с https://
    if (!webhookUrl.startsWith("https://")) {
      return new Response(JSON.stringify({ error: "Webhook URL must start with https://" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`Настраиваем вебхук для бота. URL: ${webhookUrl}`)
    console.log(`Используем токен: ${process.env.TELEGRAM_BOT_TOKEN ? "Токен установлен" : "Токен НЕ установлен"}`)

    // Настраиваем вебхук
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    })

    // Получаем текст ответа для отладки
    const responseText = await response.text()
    console.log(`Ответ от Telegram API: ${responseText}`)

    // Пытаемся распарсить JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Ошибка при парсинге ответа:", parseError)
      return new Response(
        JSON.stringify({
          error: "Failed to parse Telegram API response",
          rawResponse: responseText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!response.ok) {
      console.error("Ошибка при настройке вебхука:", data)
      return new Response(
        JSON.stringify({
          error: `Failed to set webhook: ${response.status} ${response.statusText}`,
          details: data,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Ошибка при настройке вебхука:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to set webhook",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

