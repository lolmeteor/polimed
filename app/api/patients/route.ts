import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';
import { MisMappingService } from '@/services/mis-mapping-service';
import { MIS_API_CONFIG } from '@/constants/api-config';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Проверяем наличие необходимых полей
    if (!data.lastName || !data.firstName || !data.birthDate) {
      return NextResponse.json(
        { error: 'Не все обязательные поля указаны' }, 
        { status: 400 }
      );
    }
    
    // Готовим данные пациента для поиска
    const patientData = {
      LastName: data.lastName,
      FirstName: data.firstName,
      MiddleName: data.middleName || "",
      BirthDate: data.birthDate // Формат: /Date(timestamp+offset)/
    };
    
    // Ищем пациента через SOAP API
    const response = await MisApiService.searchPatient(patientData);
    
    // Преобразуем в формат, удобный для приложения
    const patients = MisMappingService.mapSearchPatientResult(response);
    
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Error in POST /api/patients:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при поиске пациента' }, 
      { status: 500 }
    );
  }
} 