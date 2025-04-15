"use client";

import { MisStatusIndicator } from "@/components/ui/mis-status-indicator";
import { TelegramStatusIndicator } from "@/components/ui/telegram-status-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Home } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminStatusPage() {
  // Определяем состояния для переменных окружения
  const [telegramBotUsername, setTelegramBotUsername] = useState<string | null>(null);
  const [misWsdlUrl, setMisWsdlUrl] = useState<string>("Не настроено");
  const [misTokenUrl, setMisTokenUrl] = useState<string>("Не настроено");
  const [misGuid, setMisGuid] = useState<string>("Не настроено");
  const [misDefaultLpuId, setMisDefaultLpuId] = useState<string>("Не настроено");
  
  // Загружаем переменные окружения на стороне клиента
  useEffect(() => {
    setTelegramBotUsername(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || null);
    setMisWsdlUrl(process.env.NEXT_PUBLIC_MIS_WSDL_URL || "Не настроено");
    setMisTokenUrl(process.env.NEXT_PUBLIC_MIS_TOKEN_URL || "Не настроено");
    setMisGuid(process.env.NEXT_PUBLIC_MIS_GUID ? "Настроено" : "Не настроено");
    setMisDefaultLpuId(process.env.NEXT_PUBLIC_MIS_DEFAULT_LPU_ID || "Не настроено");
  }, []);
  
  // Формируем URL Telegram-бота
  const telegramUrl = telegramBotUsername ? `https://t.me/${telegramBotUsername}` : undefined;
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Статус подключения сервисов</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Карточка статуса МИС */}
        <Card>
          <CardHeader>
            <CardTitle>Медицинская Информационная Система</CardTitle>
            <CardDescription>Статус подключения к API МИС</CardDescription>
          </CardHeader>
          <CardContent>
            <MisStatusIndicator />
            
            <div className="mt-4 space-y-2 text-sm">
              <div><strong>WSDL URL:</strong> {misWsdlUrl}</div>
              <div><strong>Token URL:</strong> {misTokenUrl}</div>
              <div><strong>GUID:</strong> {misGuid}</div>
              <div><strong>ЛПУ по умолчанию:</strong> {misDefaultLpuId}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Карточка статуса Telegram-бота */}
        <Card>
          <CardHeader>
            <CardTitle>Telegram-интеграция</CardTitle>
            <CardDescription>Настройки Telegram-бота для авторизации</CardDescription>
          </CardHeader>
          <CardContent>
            <TelegramStatusIndicator />
            
            <div className="mt-4 space-y-2 text-sm">
              <div><strong>Имя бота:</strong> @{telegramBotUsername || "Не настроено"}</div>
            </div>
          </CardContent>
          <CardFooter>
            {telegramUrl ? (
              <Link href={telegramUrl} target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Открыть бота в Telegram
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                disabled
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Открыть бота в Telegram
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6">
        <Link href="/">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
} 