import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Layout from "@/components/layout"
import { UserProvider } from "@/context/user-context"
import { AppointmentProvider } from "@/context/appointment-context"
import { Toaster } from "sonner"
import Script from "next/script"
import TypographyProvider from "@/lib/typography-provider"

// Правильная загрузка шрифта Montserrat через next/font/google
const montserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Полимедика",
  description: "Миниприложение для записи на приём в клинику Полимедика",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={`${montserrat.variable} font-sans`}>
        <UserProvider>
          <AppointmentProvider>
            <TypographyProvider>
              <Layout isRootLayout={true}>{children}</Layout>
              <Toaster richColors position="top-center" />
            </TypographyProvider>
          </AppointmentProvider>
        </UserProvider>
      </body>
    </html>
  )
}