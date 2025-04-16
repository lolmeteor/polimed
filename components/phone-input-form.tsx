"use client"

import { useState, FormEvent } from "react"
import { formatPhoneNumber } from "@/lib/utils"

interface PhoneInputFormProps {
  onSubmit: (phoneNumber: string) => void
  isLoading: boolean
}

export function PhoneInputForm({ onSubmit, isLoading }: PhoneInputFormProps) {
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Если пользователь удаляет символы - даем это сделать
    if (value.length < phone.length) {
      setPhone(value)
      return
    }

    // Считаем только цифры
    const digits = value.replace(/\D/g, "")
    
    if (digits.length === 0) {
      setPhone("")
      return
    }
    
    // Форматируем номер телефона для отображения
    const formattedPhone = formatPhoneNumber(digits)
    setPhone(formattedPhone)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Удаляем все нецифровые символы для проверки
    const digits = phone.replace(/\D/g, "")
    
    // Проверяем количество цифр (10 или 11)
    if (digits.length < 10) {
      setError("Пожалуйста, введите корректный номер телефона")
      return
    }
    
    // Подготавливаем номер для отправки (с префиксом +7)
    let phoneToSubmit = ""
    
    if (digits.length === 10) {
      // Если 10 цифр, добавляем +7
      phoneToSubmit = `+7${digits}`
    } else if (digits.length === 11) {
      // Если 11 цифр, проверяем первую цифру
      const firstDigit = digits.charAt(0)
      if (firstDigit === "7" || firstDigit === "8") {
        // Если начинается с 7 или 8, заменяем на +7
        phoneToSubmit = `+7${digits.substring(1)}`
      } else {
        setError("Номер телефона должен начинаться с 7 или 8")
        return
      }
    } else {
      setError("Пожалуйста, введите корректный номер телефона")
      return
    }
    
    setError(null)
    onSubmit(phoneToSubmit)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-auto">
      <div className="flex flex-col space-y-4">
        <input
          type="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={handlePhoneChange}
          disabled={isLoading}
          className="w-full sm:w-[300px] h-[50px] rounded-btn px-4 text-[16px] border-2 border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
        />
        
        {error && (
          <p className="text-brand-error text-[14px]">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isLoading || phone.replace(/\D/g, "").length < 10}
          className="w-full sm:w-[300px] h-[50px] rounded-btn font-semibold text-[16px] text-center transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Проверка..." : "Проверить номер телефона"}
        </button>
      </div>
    </form>
  )
} 