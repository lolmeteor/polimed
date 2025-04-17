import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Layout from "@/components/layout"
import { UserProvider } from "@/contexts/UserContext"
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
    <html lang="ru" className={montserrat.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#8DCECA" />
      </head>
      <body>
        <UserProvider>
          <TypographyProvider>
            {children}
          </TypographyProvider>
          <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        </UserProvider>
        <Script id="ios-height-fix">{`
          // iOS height fix
          const setAppHeight = () => {
            const doc = document.documentElement;
            doc.style.setProperty('--app-height', window.innerHeight + 'px');
          };
          window.addEventListener('resize', setAppHeight);
          setAppHeight();
        `}</Script>
      </body>
    </html>
  )
}