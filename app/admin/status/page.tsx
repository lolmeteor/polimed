import { MisStatusIndicator } from "@/components/ui/mis-status-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function AdminStatusPage() {
  // Получаем данные о настройках из переменных окружения
  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const misWsdlUrl = process.env.MIS_WSDL_URL || "Не настроено";
  const misTokenUrl = process.env.MIS_TOKEN_URL || "Не настроено";
  const misGuid = process.env.MIS_GUID ? "Настроено" : "Не настроено";
  const misDefaultLpuId = process.env.MIS_DEFAULT_LPU_ID || "Не настроено";
  
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
            <div className="space-y-2">
              <div><strong>Имя бота:</strong> @{telegramBotUsername || "Не настроено"}</div>
              <div><strong>Токен бота:</strong> {process.env.TELEGRAM_BOT_TOKEN ? "Настроен" : "Не настроен"}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://t.me/${telegramBotUsername}`, '_blank')}
              disabled={!telegramBotUsername}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть бота в Telegram
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button 
          variant="secondary" 
          onClick={() => window.location.href = '/'}
        >
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
} 