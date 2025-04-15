"use client"

import type React from "react"

import { useState } from "react"
import { AdaptiveContainer } from "@/components/adaptive-container"

export default function SetupWebhookPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)

  const handleSetupWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError(null)
    setRawResponse(null)

    try {
      // Проверяем, что URL начинается с https://
      let finalUrl = webhookUrl
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl
      }

      const response = await fetch(`/api/setup-webhook?url=${encodeURIComponent(finalUrl)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при настройке вебхука")
      }

      setResult(data)

      // Если есть необработанный ответ, показываем его
      if (data.rawResponse) {
        setRawResponse(data.rawResponse)
      }
    } catch (error) {
      console.error("Ошибка при настройке вебхука:", error)
      setError(error instanceof Error ? error.message : "Произошла ошибка при настройке вебхука")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdaptiveContainer>
      <h1 className="text-xl font-semibold text-txt-primary mb-6">Настройка вебхука для Telegram бота</h1>

      <form onSubmit={handleSetupWebhook} className="space-y-4">
        <div>
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-txt-secondary mb-2">
            URL вебхука
          </label>
          <input
            type="text"
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.vercel.app/api/telegram-webhook"
            className="w-full px-3 py-2 border-2 border-brand rounded-btn focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
          <p className="text-xs text-txt-secondary mt-1">
            Введите полный URL вашего API-эндпоинта для обработки вебхуков от Telegram
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !webhookUrl}
          className="w-full sm:w-[275px] h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Настройка..." : "Настроить вебхук"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 border-2 border-brand rounded-crd">
          <h2 className="text-lg font-semibold text-txt-primary mb-2">Результат</h2>
          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {rawResponse && (
        <div className="mt-6 p-4 border-2 border-brand rounded-crd">
          <h2 className="text-lg font-semibold text-txt-primary mb-2">Необработанный ответ</h2>
          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">{rawResponse}</pre>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 border-2 border-brand-error rounded-crd bg-red-50">
          <h2 className="text-lg font-semibold text-brand-error mb-2">Ошибка</h2>
          <p className="text-brand-error">{error}</p>
        </div>
      )}
    </AdaptiveContainer>
  )
}

