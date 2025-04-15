export async function POST(request: Request) {
  const data = await request.json()
  const { telegramId, consentDate } = data

  if (!telegramId) {
    return new Response(JSON.stringify({ error: "Telegram ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // В реальном приложении здесь будет запрос к API клиники для сохранения согласия
    // Для примера просто возвращаем успешный ответ

    return new Response(
      JSON.stringify({
        success: true,
        message: "Consent saved successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error saving consent:", error)
    return new Response(JSON.stringify({ error: "Failed to save consent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

