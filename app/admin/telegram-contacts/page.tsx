"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2, Home } from "lucide-react";
import Link from "next/link";

interface Contact {
  telegramId: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  storedAt?: string;
}

export default function TelegramContactsPage() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/telegram-contact-debug');
      const data = await response.json();

      if (response.ok && data.success) {
        setContacts(data.contacts || []);
      } else {
        setError(data.error || 'Не удалось получить список контактов');
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке контактов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearContacts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/telegram-contact', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setContacts([]);
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось очистить контакты');
      }
    } catch (err) {
      setError('Произошла ошибка при очистке контактов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'неизвестно';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Контакты Telegram</h1>

      <div className="mb-6 flex justify-between items-center">
        <Button 
          onClick={fetchContacts} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Обновить
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={clearContacts} 
          disabled={loading || contacts.length === 0}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Очистить контакты
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Загрузка контактов...</span>
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Контакты не найдены
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.telegramId}>
              <CardHeader>
                <CardTitle>{contact.firstName} {contact.lastName || ''}</CardTitle>
                <CardDescription>Telegram ID: {contact.telegramId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><strong>Номер телефона:</strong> {contact.phoneNumber}</div>
                  <div><strong>Сохранен:</strong> {formatDate(contact.storedAt)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/status">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Вернуться к статусу
          </Button>
        </Link>
      </div>
    </div>
  );
} 