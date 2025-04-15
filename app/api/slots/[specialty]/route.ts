import { NextResponse } from 'next/server';
import { AppointmentService } from '@/services/appointment-service';

export async function GET(
  request: Request,
  { params }: { params: { specialty: string } }
) {
  try {
    const specialty = params.specialty;
    
    if (!specialty) {
      return NextResponse.json(
        { error: 'Specialty parameter is required' }, 
        { status: 400 }
      );
    }
    
    // Получаем доступные слоты для указанной специальности
    const slots = await AppointmentService.getAvailableSlots(specialty);
    
    return NextResponse.json(slots);
  } catch (error: any) {
    console.error(`Error in GET /api/slots/${params.specialty}:`, error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении доступных слотов' }, 
      { status: 500 }
    );
  }
} 