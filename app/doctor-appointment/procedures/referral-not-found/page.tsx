import { AdaptiveContainer } from "@/components/adaptive-container"
import { BottomNav } from "@/components/bottom-nav"
import { HeaderLogo } from "@/components/header-logo"

export default function ReferralNotFound() {
  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white">
      <HeaderLogo />
      
      <AdaptiveContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
        {/* Заголовок ошибки */}
        <div className="mb-8 text-center">
          <h1 className="font-bold text-[24px] leading-[29px] text-brand-dark">
            Не найдено
            <br />
            направление
          </h1>
        </div>

        {/* Иконка ошибки */}
        <div className="mb-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke="#8DCECA" strokeWidth="2" />
            <path d="M8 8L16 16M8 16L16 8" stroke="#8DCECA" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Текст сообщения */}
        <div className="mb-8 text-center">
          <p className="font-medium text-[16px] leading-[140%] text-txt-secondary max-w-[300px]">
            Пожалуйста, обратитесь к участковому врачу-терапевту для получения направления
          </p>
        </div>
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <div className="fixed sm:absolute bottom-0 sm:bottom-5 left-0 sm:left-[28px] right-0 sm:right-auto w-full sm:w-[342px] h-[67px] px-4 sm:px-0">
        <BottomNav showBackButton={true} />
      </div>
    </div>
  )
}

