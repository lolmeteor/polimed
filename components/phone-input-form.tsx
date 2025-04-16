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
    const inputValue = e.target.value
    
    // Если пользователь вводит новую цифру в конец
    if (inputValue.length > phone.length) {
      // Получаем только цифры из введенного значения
      const allDigits = inputValue.replace(/\D/g, "")
      
      // Форматируем номер для отображения
      const formattedPhone = formatPhoneNumber(allDigits)
      setPhone(formattedPhone)
    } 
    // Если пользователь удаляет символы
    else if (inputValue.length < phone.length) {
      // Получаем цифры из текущего значения
      const currentDigits = phone.replace(/\D/g, "")
      
      // Если пользователь удалил последнюю цифру
      if (currentDigits.length > 0) {
        const newDigits = currentDigits.slice(0, -1)
        
        if (newDigits.length === 0) {
          setPhone("")
        } else {
          setPhone(formatPhoneNumber(newDigits))
        }
      } else {
        setPhone("")
      }
    }
    // Если пользователь стер всё
    else if (inputValue === "") {
      setPhone("")
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Удаляем все нецифровые символы для проверки
    const digits = phone.replace(/\D/g, "")
    
    // Проверяем количество цифр (минимум 10)
    if (digits.length < 10) {
      setError("Пожалуйста, введите корректный номер телефона")
      return
    }
    
    // Подготавливаем номер для отправки (с префиксом +7)
    let phoneToSubmit = `+7${digits.slice(-10)}` // Берем последние 10 цифр
    
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