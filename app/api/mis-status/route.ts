import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

/**
 * API роут для проверки подключения к МИС
 */
export async function GET() {
  try {
    // Проверяем подключение к МИС, запрашивая список районов (самый простой запрос)
    const districtResponse = await MisApiService.getDistrictList();
    
    if (districtResponse.Success) {
      // Получаем массив районов
      let districtsCount = 0;
      if (districtResponse.Districts?.District) {
        const districts = Array.isArray(districtResponse.Districts.District) 
          ? districtResponse.Districts.District 
          : [districtResponse.Districts.District];
        districtsCount = districts.length;
      }
      
      return NextResponse.json({
        status: 'connected',
        message: 'Подключение к МИС работает',
        data: {
          districtsCount
        }
      });
    } else {
      // Получаем ошибки из ответа
      let errorMessage = 'Неизвестная ошибка';
      if (districtResponse.ErrorList) {
        const errors = Array.isArray(districtResponse.ErrorList.Error) 
          ? districtResponse.ErrorList.Error 
          : [districtResponse.ErrorList.Error];
        
        errorMessage = errors.map(e => e.ErrorDescription).join(', ');
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Ошибка при подключении к МИС',
        error: errorMessage
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Ошибка при проверке статуса МИС:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при подключении к МИС',
      error: error.message || 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 