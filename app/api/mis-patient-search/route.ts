import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

/**
 * API роут для поиска пациента в МИС по номеру телефона
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Номер телефона обязателен для запроса'
      }, { status: 400 });
    }
    
    // Форматируем номер телефона для поиска
    // Пробуем разные варианты форматирования
    const phoneFormats = [];
    
    // Исходный формат
    phoneFormats.push(phone);
    
    // Только цифры без символов
    const digitsOnly = phone.replace(/\D/g, '');
    phoneFormats.push(digitsOnly);
    
    // С кодом страны +7
    if (digitsOnly.length === 10) {
      phoneFormats.push(`+7${digitsOnly}`);
    }
    
    // С кодом страны 8
    if (digitsOnly.length === 10) {
      phoneFormats.push(`8${digitsOnly}`);
    }
    
    // Если номер начинается с 8, то пробуем вариант с 7
    if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
      phoneFormats.push(`+7${digitsOnly.substring(1)}`);
      phoneFormats.push(`7${digitsOnly.substring(1)}`);
    }
    
    // Если номер начинается с 7, то пробуем вариант с 8
    if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
      phoneFormats.push(`+7${digitsOnly.substring(1)}`);
      phoneFormats.push(`8${digitsOnly.substring(1)}`);
    }
    
    // Результаты поиска для всех форматов номера
    const results = [];
    
    for (const phoneFormat of phoneFormats) {
      try {
        // Выполняем поиск пациента в МИС
        const searchResult = await MisApiService.searchPatient({
          Phone: phoneFormat
        });
        
        // Если поиск успешен, добавляем в результаты
        if (searchResult.Success) {
          results.push({
            format: phoneFormat,
            result: searchResult
          });
        }
      } catch (error: any) {
        console.error(`Ошибка при поиске для формата ${phoneFormat}:`, error);
        results.push({
          format: phoneFormat,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      phone: phone,
      formats: phoneFormats,
      results: results
    });
  } catch (error: any) {
    console.error('Ошибка при поиске пациента:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 