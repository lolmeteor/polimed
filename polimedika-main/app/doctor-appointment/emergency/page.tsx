"use client"

import { HeaderLogo } from "@/components/header-logo"
import { BottomNav } from "@/components/bottom-nav"
import { AdaptiveContainer } from "@/components/adaptive-container"
import { H1, P } from "@/components/ui/text-elements"
import { UserProvider } from "@/context/user-context"

export default function EmergencyPage() {
  return (
    <UserProvider>
      <EmergencyContent />
    </UserProvider>
  )
}

function EmergencyContent() {
  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white pb-24">
      <HeaderLogo />

      <AdaptiveContainer className="mt-8">
        <H1 className="text-xl font-semibold text-brand-dark mb-4">Неотложная помощь</H1>
        <div className="mt-6 p-6 border-2 border-brand rounded-crd">
          <P className="text-txt-secondary text-center">Страница находится в разработке</P>
        </div>
      </AdaptiveContainer>

      {/* Нижнее меню */}
      <div className="bottom-nav-container">
        <BottomNav currentPage="home" showBackButton={true} className="bottom-nav-fixed" />
      </div>
    </div>
  )
}

