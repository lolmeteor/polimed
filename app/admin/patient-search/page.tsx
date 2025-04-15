"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Home } from "lucide-react";
import Link from "next/link";

export default function PatientSearchPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phone) {
      setError("Введите номер телефона для поиска");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchResult(null);

      const response = await fetch(`/api/mis-patient-search?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResult(data);
      } else {
        setError(data.error || "Ошибка при поиске пациента");
      }
    } catch (err) {
      setError("Произошла ошибка при выполнении запроса");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Форматируем для отображения JSON результат
  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Тест поиска пациента в МИС</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Поиск пациента по номеру телефона</CardTitle>
          <CardDescription>
            Введите номер телефона пациента для проверки его наличия в МИС
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Введите номер телефона"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Найти
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты поиска</CardTitle>
            <CardDescription>
              {searchResult.results.length > 0
                ? `Найдены результаты для номера ${searchResult.phone}`
                : `Пациент с номером ${searchResult.phone} не найден в МИС`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{formatJson(searchResult)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Link href="/admin/status">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Вернуться к статусу
          </Button>
        </Link>
      </div>
    </div>
  );
} 