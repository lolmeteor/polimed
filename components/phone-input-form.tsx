"use client"

import { useState, FormEvent } from "react"

interface PhoneInputFormProps {
  onSubmit: (phoneNumber: string) => void
  isLoading: boolean
}

export function PhoneInputForm({ onSubmit, isLoading }: PhoneInputFormProps) {
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Просто устанавливаем значение как оно есть, без обработки
    setPhone(e.target.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Очищаем номер от всех символов кроме цифр для проверки
    const digits = phone.replace(/\D/g, "")
    
    // Проверяем количество цифр
    if (digits.length < 10) {
      setError("Пожалуйста, введите корректный номер телефона (минимум 10 цифр)")
      return
    }
    
    // Для отправки форматируем номер в стандартный формат +7XXXXXXXXXX
    let phoneToSubmit
    
    // Если пользователь ввел номер с +7, то используем его как есть
    if (phone.startsWith("+7")) {
      phoneToSubmit = phone
    } 
    // Если пользователь ввел номер с 8, заменяем на +7
    else if (phone.startsWith("8")) {
      phoneToSubmit = "+7" + phone.substring(1) 
    }
    // В остальных случаях добавляем +7 перед номером
    else {
      phoneToSubmit = "+7" + phone
    }
    
    setError(null)
    onSubmit(phoneToSubmit)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-auto">
      <div className="flex flex-col space-y-4">
        <input
          type="tel"
          placeholder="Введите номер телефона"
          value={phone}
          onChange={handlePhoneChange}
          disabled={isLoading}
          className="w-full sm:w-[300px] h-[50px] rounded-btn px-4 text-[16px] border-2 border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
        />
        
        <p className="text-gray-500 text-[12px]">
          Примеры: +79991234567, 89991234567, 9991234567
        </p>
        
        {error && (
          <p className="text-brand-error text-[14px]">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-[300px] h-[50px] rounded-btn font-semibold text-[16px] text-center transition-colors duration-200 border-2 border-brand bg-white text-txt-primary hover:bg-brand hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Проверка..." : "Проверить номер телефона"}
        </button>
      </div>
    </form>
  )
} 