import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/send-telegram-image/route';

// Мокаем fetch и nextRequest
global.fetch = jest.fn();

describe('API эндпоинт send-telegram-image', () => {
  const telegramId = '123456789';
  const fileName = 'test-image.png';
  
  // Создаем мок для FormData
  let formDataMock: { [key: string]: any } = {};
  let formDataAppendMock = jest.fn().mockImplementation((key, value) => {
    formDataMock[key] = value;
  });
  global.FormData = jest.fn().mockImplementation(() => ({
    append: formDataAppendMock,
    get: jest.fn().mockImplementation(key => formDataMock[key])
  }));

  // Сброс моков перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();
    formDataMock = {};
    
    // Мокаем process.env
    process.env.TELEGRAM_BOT_TOKEN = 'test-token-123';
  });
  
  // Тест 1: Успешная отправка изображения
  test('успешно отправляет изображение в Telegram', async () => {
    // Создаем тестовый Blob
    const blob = new Blob(['test'], { type: 'image/png' });
    
    // Мокаем ответ от Telegram API
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ ok: true, result: { message_id: 123 } })
    });
    
    // Создаем тестовый FormData для запроса
    const formData = new FormData();
    formData.append('chat_id', telegramId);
    formData.append('photo', blob, fileName);
    formData.append('fileName', fileName);
    
    // Создаем тестовый объект запроса
    const request = new NextRequest('https://example.com/api/send-telegram-image', {
      method: 'POST',
      body: formData
    });
    
    // Вызываем тестируемую функцию
    const response = await POST(request);
    
    // Проверяем результат
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({ success: true });
    
    // Проверяем вызов fetch
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.telegram.org/bottest-token-123/sendPhoto`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    );
  });
  
  // Тест 2: Отсутствие обязательных параметров
  test('возвращает ошибку при отсутствии обязательных параметров', async () => {
    // Создаем тестовый FormData без обязательных параметров
    const formData = new FormData();
    
    // Создаем тестовый объект запроса
    const request = new NextRequest('https://example.com/api/send-telegram-image', {
      method: 'POST',
      body: formData
    });
    
    // Вызываем тестируемую функцию
    const response = await POST(request);
    
    // Проверяем результат
    expect(response.status).toBe(400);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: expect.stringContaining('Отсутствуют обязательные параметры')
    });
    
    // Проверяем, что fetch не вызывался
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  // Тест 3: Ошибка от Telegram API
  test('обрабатывает ошибку от Telegram API', async () => {
    // Создаем тестовый Blob
    const blob = new Blob(['test'], { type: 'image/png' });
    
    // Мокаем ответ от Telegram API с ошибкой
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ 
        ok: false, 
        description: 'Тестовая ошибка от Telegram API' 
      })
    });
    
    // Создаем тестовый FormData для запроса
    const formData = new FormData();
    formData.append('chat_id', telegramId);
    formData.append('photo', blob, fileName);
    formData.append('fileName', fileName);
    
    // Создаем тестовый объект запроса
    const request = new NextRequest('https://example.com/api/send-telegram-image', {
      method: 'POST',
      body: formData
    });
    
    // Вызываем тестируемую функцию
    const response = await POST(request);
    
    // Проверяем результат
    expect(response.status).toBe(502);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Тестовая ошибка от Telegram API'
    });
  });
  
  // Тест 4: Отсутствие токена в переменных окружения
  test('обрабатывает отсутствие токена в переменных окружения', async () => {
    // Удаляем токен из переменных окружения
    delete process.env.TELEGRAM_BOT_TOKEN;
    
    // Создаем тестовый Blob
    const blob = new Blob(['test'], { type: 'image/png' });
    
    // Создаем тестовый FormData для запроса
    const formData = new FormData();
    formData.append('chat_id', telegramId);
    formData.append('photo', blob, fileName);
    
    // Создаем тестовый объект запроса
    const request = new NextRequest('https://example.com/api/send-telegram-image', {
      method: 'POST',
      body: formData
    });
    
    // Вызываем тестируемую функцию
    const response = await POST(request);
    
    // Проверяем результат
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: expect.stringContaining('Токен бота не настроен')
    });
    
    // Проверяем, что fetch не вызывался
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  // Тест 5: Сетевая ошибка при отправке в Telegram
  test('обрабатывает сетевую ошибку при отправке в Telegram', async () => {
    // Создаем тестовый Blob
    const blob = new Blob(['test'], { type: 'image/png' });
    
    // Мокаем сетевую ошибку
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Сетевая ошибка'));
    
    // Создаем тестовый FormData для запроса
    const formData = new FormData();
    formData.append('chat_id', telegramId);
    formData.append('photo', blob, fileName);
    
    // Создаем тестовый объект запроса
    const request = new NextRequest('https://example.com/api/send-telegram-image', {
      method: 'POST',
      body: formData
    });
    
    // Вызываем тестируемую функцию
    const response = await POST(request);
    
    // Проверяем результат
    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  });
}); 