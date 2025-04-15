"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, MessageCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DebugAuthPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !phoneNumber || !telegramId) {
      setError("Пожалуйста, заполните все обязательные поля (имя, телефон, ID Telegram)");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setSuccess(false);

      const response = await fetch('/api/auth-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName: lastName || undefined,
          phoneNumber,
          telegramId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setResult(data);
      } else {
        setError(data.error || "Не удалось выполнить авторизацию");
        setResult(data);
      }
    } catch (err) {
      setError("Произошла ошибка при авторизации");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">Отладка авторизации</h1>
      <p className="text-muted-foreground mb-6 text-center">
        Используйте эту форму для ручной авторизации в системе
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Внимание! Режим демонстрации</h3>
            <p className="text-amber-700 text-sm mt-1">
              В данный момент система работает в демонстрационном режиме. МИС может быть недоступна или 
              работать с тестовыми данными. Авторизация будет успешной даже если пациент не найден в МИС.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Введите данные для авторизации</CardTitle>
            <CardDescription>
              Эти данные будут сохранены в системе как если бы вы прошли авторизацию через Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Введите имя"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Введите фамилию (необязательно)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Номер телефона *</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="+7 (___) ___-__-__"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Укажите номер телефона в любом формате. В демо-режиме поиск в МИС может не работать.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramId">ID Telegram *</Label>
              <div className="relative">
                <MessageCircle className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telegramId"
                  placeholder="Например: 123456789"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Вы можете использовать любой числовой ID. Если не знаете свой Telegram ID, используйте 123456789
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-600 rounded-md">
                Авторизация успешно выполнена. {result?.patientFound 
                  ? 'Пациент найден в МИС.' 
                  : 'Пациент НЕ найден в МИС, но данные сохранены для демонстрации.'}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline" disabled={loading}>
                На главную
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Авторизация...
                </>
              ) : (
                "Авторизоваться"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Результат авторизации</CardTitle>
            <CardDescription>
              Детальная информация о результате авторизации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {success && (
              <Button asChild>
                <Link href="/">
                  Перейти в приложение
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 