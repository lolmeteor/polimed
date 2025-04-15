import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Проверяем наличие хотя бы одного параметра для поиска
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать хотя бы один параметр для поиска' }, 
        { status: 400 }
      );
    }
    
    // Для демонстрации используем фиксированный ID ЛПУ
    const lpuId = data.lpuId || "1570"; // ID, которое указано в примере Postman
    
    // Ищем пациентов через API МИС
    const response = await MisApiService.searchPatient(data, lpuId);
    
    // Если запрос не успешен, возвращаем ошибку
    if (!response.Success) {
      const errors = response.ErrorList?.Error;
      const errorMessage = Array.isArray(errors) 
        ? errors.map(e => e.ErrorDescription).join('; ')
        : errors?.ErrorDescription || 'Неизвестная ошибка при поиске пациентов';
      
      console.error('Error searching patients:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Если пациенты найдены, возвращаем их
    if (response.Patients) {
      const patients = Array.isArray(response.Patients.Patient) 
        ? response.Patients.Patient 
        : [response.Patients.Patient];
      
      return NextResponse.json(patients);
    } else if (response.IdPat) {
      // Если найден только идентификатор пациента
      return NextResponse.json([{ IdPat: response.IdPat }]);
    }
    
    // Если пациенты не найдены, возвращаем пустой массив
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error in POST /api/patients:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при поиске пациентов' }, 
      { status: 500 }
    );
  }
} 