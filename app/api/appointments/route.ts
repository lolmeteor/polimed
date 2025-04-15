import { NextResponse } from 'next/server';
import { AppointmentService } from '@/services/appointment-service';
import { AppointmentSlot } from '@/types/appointment';
import { MisApiService } from '@/services/mis-api-service';
import { MIS_API_CONFIG } from '@/constants/api-config';

// Указываем, что этот роут должен использовать полный Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Проверяем наличие необходимых полей
    if (!data.id || !data.datetime || !data.cabinet || !data.address) {
      return NextResponse.json(
        { error: 'Не все обязательные поля указаны' }, 
        { status: 400 }
      );
    }
    
    // Создаем слот для записи
    const appointmentSlot: AppointmentSlot = {
      id: data.id,
      datetime: data.datetime,
      doctorName: data.doctorName,
      doctorSpecialty: data.doctorSpecialty,
      procedureName: data.procedureName,
      address: data.address,
      cabinet: data.cabinet,
      ticketNumber: data.ticketNumber,
      isProcedure: data.isProcedure
    };
    
    // Создаем запись через сервис (убираем ссылку на несуществующий метод)
    const appointment = await AppointmentService.createAppointment(appointmentSlot);
    
    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error('Error in POST /api/appointments:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании записи' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID записи не указан' }, 
        { status: 400 }
      );
    }
    
    // Отменяем запись через сервис
    const success = await AppointmentService.cancelAppointment(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Не удалось отменить запись' }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in DELETE /api/appointments:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при отмене записи' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const doctorId = searchParams.get('doctorId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const specialtySlug = searchParams.get('specialtySlug');
    
    // Получение истории записей
    if (profileId) {
      const appointments = await AppointmentService.getAppointmentHistory(profileId);
      return NextResponse.json(appointments);
    }
    
    // Получение доступных слотов для специальности
    else if (specialtySlug) {
      const slots = await AppointmentService.getAvailableSlots(specialtySlug);
      return NextResponse.json(slots);
    }
    
    // Получение доступных слотов по врачу (прямой вызов SOAP API)
    else if (doctorId && startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const lpuId = MIS_API_CONFIG.DEFAULT_LPU_ID;
      
      // Вызов SOAP-сервиса для получения слотов
      const misResponse = await MisApiService.getAvailableAppointments(
        lpuId, 
        doctorId, 
        startDate, 
        endDate
      );
      
      // Здесь можно добавить преобразование ответа от MIS в нужный формат
      return NextResponse.json(misResponse);
    }
    
    return NextResponse.json(
      { error: 'Не указаны необходимые параметры' }, 
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/appointments:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при запросе' }, 
      { status: 500 }
    );
  }
} 