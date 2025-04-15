"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

/**
 * Компонент-индикатор статуса подключения к Telegram API
 */
export function TelegramStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [message, setMessage] = useState<string>("Проверка подключения к Telegram...");
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [botInfo, setBotInfo] = useState<{
    id?: number;
    username?: string;
    first_name?: string;
  } | null>(null);

  const checkTelegramStatus = async () => {
    try {
      setIsChecking(true);
      setStatus("checking");
      setMessage("Проверка подключения к Telegram...");
      setBotInfo(null);

      const response = await fetch("/api/telegram-status", {
        cache: "no-store"
      });
      
      // Если запрос не удался из-за отсутствия маршрута в процессе деплоя,
      // обрабатываем ошибку более мягко
      if (!response.ok) {
        if (response.status === 404) {
          setStatus("error");
          setMessage("API роут /api/telegram-status не найден. Возможно, приложение не полностью развернуто.");
          return;
        }
      }
      
      const data = await response.json();

      if (response.ok && data.status === "connected") {
        setStatus("connected");
        setBotInfo(data.data);
        setMessage(
          `Подключение к Telegram API работает. Бот: @${data.data?.username || "unknown"}`
        );
      } else {
        setStatus("error");
        setMessage(`Ошибка подключения: ${data.error || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Не удалось выполнить проверку. ${error instanceof Error ? error.message : "Проверьте подключение к серверу"}`);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Отложенный запуск проверки, чтобы избежать проблем при сборке на Vercel
    const timer = setTimeout(() => {
      checkTelegramStatus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-2">
      <Alert variant={status === "connected" ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {status === "checking" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "connected" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>{message}</span>
        </div>
      </Alert>
      
      {botInfo && status === "connected" && (
        <div className="text-sm mt-2 space-y-1">
          <div><strong>ID бота:</strong> {botInfo.id}</div>
          <div><strong>Имя бота:</strong> {botInfo.first_name}</div>
          <div><strong>Username:</strong> @{botInfo.username}</div>
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={checkTelegramStatus} 
        disabled={isChecking}
        className="flex items-center gap-2"
      >
        {isChecking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Проверка...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Проверить подключение
          </>
        )}
      </Button>
    </div>
  );
} 