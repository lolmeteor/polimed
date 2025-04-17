"use client"

import { AdaptiveContainer } from "@/components/adaptive-container"
import Link from "next/link"
import { UserProvider } from "@/context/user-context"

export default function NumberNotFound() {
  return (
    <UserProvider>
      <div className="relative min-h-screen max-w-md mx-auto bg-white">
        {/* Шапка с логотипом */}
        <div className="relative w-full h-[120px]">
          <div className="absolute left-[54px] top-[82px] w-[169px] h-[36px]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%9F%D0%BE%D0%BB%D0%B8%D0%BC%D0%B5%D0%B4%D0%B8%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B7%D1%80%D0%B0%D1%87%201-ODxZYD4yDlA6j4HxCXp3Q0urrX6KQK.svg"
              alt="Полимедика"
              className="w-full h-full"
            />
          </div>
        </div>

        <AdaptiveContainer>
          {/* Заголовок ошибки */}
          <div className="mb-6">
            <h1 className="font-semibold text-xl sm:text-[24px] leading-[29px] text-txt-primary">
              Ваш номер
              <br />
              не найден
            </h1>
          </div>

          {/* Иконка ошибки */}
          <div className="mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" stroke="var(--brand-error)" strokeWidth="2" />
              <path d="M8 8L16 16M8 16L16 8" stroke="var(--brand-error)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Текст сообщения */}
          <div className="mb-8">
            <p className="font-medium text-[14px] leading-[122.28%] text-txt-secondary max-w-[265px]">
              Пожалуйста, обратитесь в регистратуру поликлиники «Полимедика» с паспортом для актуализации номера телефона
            </p>
          </div>
        </AdaptiveContainer>

        {/* Ссылка на адреса филиалов */}
        <div className="fixed bottom-10 left-0 w-full text-center sm:absolute sm:w-[245px] sm:h-[43px] sm:left-[74px] sm:top-[719px]">
          <Link href="/branches" className="font-medium text-[13px] leading-[16px] text-txt-primary underline">
            Адреса филиалов
          </Link>
        </div>
      </div>
    </UserProvider>
  )
}

