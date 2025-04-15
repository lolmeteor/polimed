import { NextRequest, NextResponse } from 'next/server';
import { contactsStore } from '../telegram-contact/route';
import { MisApiService } from '@/services/mis-api-service';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

/**
 * API роут для ручной авторизации с помощью номера телефона
 * ВНИМАНИЕ: Этот роут следует использовать только для отладки!
 */
export async function POST(request: Request) {
  try {
    // Получаем данные из запроса
    const data = await request.json();
    const { phoneNumber, firstName, lastName, telegramId } = data;
    
    if (!phoneNumber || !firstName || !telegramId) {
      return NextResponse.json({
        success: false,
        error: 'Не все обязательные поля указаны'
      }, { status: 400 });
    }
    
    // Текущая дата и время
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Форматируем номер телефона
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber}`;
    
    // Проверяем наличие пациента в МИС
    let patientFound = false;
    let patientInfo = null;
    
    try {
      // Форматируем номер для запроса в МИС
      const phoneFormats = [];
      phoneFormats.push(formattedPhone);
      
      // Только цифры
      const digits = formattedPhone.replace(/\D/g, '');
      phoneFormats.push(digits);
      
      // Добавляем варианты с кодами
      if (digits.length === 10) {
        phoneFormats.push(`+7${digits}`);
        phoneFormats.push(`8${digits}`);
      } else if (digits.length === 11) {
        if (digits.startsWith('8')) {
          phoneFormats.push(`+7${digits.substring(1)}`);
        } else if (digits.startsWith('7')) {
          phoneFormats.push(`+7${digits.substring(1)}`);
          phoneFormats.push(`8${digits.substring(1)}`);
        }
      }
      
      // Пробуем разные форматы номера телефона
      for (const format of phoneFormats) {
        try {
          const searchResult = await MisApiService.searchPatient({
            Phone: format
          });
          
          if (searchResult.Success && searchResult.Patients?.Patient) {
            patientFound = true;
            patientInfo = searchResult.Patients.Patient;
            console.log(`🟢 Auth Debug: Найден пациент в МИС с номером ${format}:`, searchResult);
            break;
          }
        } catch (error) {
          console.error(`🔴 Auth Debug: Ошибка при поиске для формата ${format}:`, error);
        }
      }
    } catch (error) {
      console.error('🔴 Auth Debug: Ошибка при поиске пациента в МИС:', error);
    }
    
    // Сохраняем контакт в хранилище
    contactsStore[telegramId] = {
      telegramId: parseInt(telegramId),
      phoneNumber: formattedPhone,
      firstName,
      lastName: lastName || undefined,
      contactUserId: parseInt(telegramId),
      storedAt: timestamp
    };
    
    console.log(`🔵 Auth Debug: Контакт добавлен для ${firstName} ${lastName || ''}:`, contactsStore[telegramId]);
    
    return NextResponse.json({
      success: true,
      patientFound,
      patientInfo: patientFound ? patientInfo : null,
      contactInfo: {
        telegramId,
        phoneNumber: formattedPhone,
        firstName,
        lastName: lastName || undefined,
        storedAt: timestamp
      }
    });
  } catch (error: any) {
    console.error('🔴 Auth Debug: Ошибка при обработке запроса:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 