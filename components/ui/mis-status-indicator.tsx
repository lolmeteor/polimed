"use client";

import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

/**
 * Компонент-индикатор статуса подключения к МИС
 */
export function MisStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [message, setMessage] = useState<string>("Проверка подключения к МИС...");
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const checkMisStatus = async () => {
    try {
      setIsChecking(true);
      setStatus("checking");
      setMessage("Проверка подключения к МИС...");

      const response = await fetch("/api/mis-status");
      const data = await response.json();

      if (response.ok && data.status === "connected") {
        setStatus("connected");
        setMessage(
          `Подключение к МИС работает. Доступно районов: ${data.data?.districtsCount || 0}`
        );
      } else {
        setStatus("error");
        setMessage(`Ошибка подключения: ${data.error || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Ошибка при проверке: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkMisStatus();
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
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={checkMisStatus} 
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