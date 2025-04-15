import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';
import { MisMappingService } from '@/services/mis-mapping-service';

// Кеш для хранения специальностей, чтобы не запрашивать каждый раз
let specialtiesCache: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

export async function GET() {
  try {
    const now = Date.now();
    
    // Используем кеш, если он не устарел
    if (specialtiesCache.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      return NextResponse.json(specialtiesCache);
    }
    
    // Для демонстрации используем фиксированный ID ЛПУ
    const lpuId = "1570"; // ID, которое указано в примере Postman
    
    // Получаем список специальностей из API МИС
    const response = await MisApiService.getSpecialityList(lpuId);
    
    // Если запрос не успешен, возвращаем ошибку
    if (!response.Success) {
      const errors = response.ErrorList?.Error;
      const errorMessage = Array.isArray(errors) 
        ? errors.map(e => e.ErrorDescription).join('; ')
        : errors?.ErrorDescription || 'Неизвестная ошибка при получении специальностей';
      
      console.error('Error fetching specialties:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Преобразуем данные в формат приложения
    const specialties = MisMappingService.mapSpecialityList(response);
    
    // Обновляем кеш
    specialtiesCache = specialties;
    lastFetchTime = now;
    
    return NextResponse.json(specialties);
  } catch (error) {
    console.error('Error in GET /api/specialties:', error);
    
    // В случае ошибки возвращаем моковые данные
    const mockSpecialties = [
      { id: "1", name: "Терапевт", slug: "therapist" },
      { id: "2", name: "Офтальмолог", slug: "ophthalmologist" },
      { id: "3", name: "Кардиолог", slug: "cardiologist" },
      { id: "4", name: "Невролог", slug: "neurologist" }
    ];
    
    return NextResponse.json(mockSpecialties);
  }
} 