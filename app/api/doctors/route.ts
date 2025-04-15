import { NextResponse } from 'next/server';
import { MisApiService } from '@/services/mis-api-service';
import { MisMappingService } from '@/services/mis-mapping-service';
import { MIS_API_CONFIG } from '@/constants/api-config';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lpuId = searchParams.get('lpuId') || MIS_API_CONFIG.DEFAULT_LPU_ID;
    const specialtyId = searchParams.get('specialtyId');
    
    if (!specialtyId) {
      return NextResponse.json(
        { error: 'ID специальности не указан' }, 
        { status: 400 }
      );
    }
    
    // Получаем список врачей из SOAP API
    const response = await MisApiService.getDoctorList(lpuId, specialtyId);
    
    // Преобразуем в формат, удобный для приложения
    const doctors = MisMappingService.mapDoctorList(response);
    
    return NextResponse.json(doctors);
  } catch (error: any) {
    console.error('Error in GET /api/doctors:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении списка врачей' }, 
      { status: 500 }
    );
  }
} 