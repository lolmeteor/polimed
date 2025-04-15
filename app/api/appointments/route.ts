import { NextResponse } from 'next/server';
import { AppointmentService } from '@/services/appointment-service';
import { AppointmentSlot } from '@/types/appointment';

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
    
    // Создаем запись через сервис
    const appointment = data.isProcedure 
      ? await AppointmentService.createProcedureAppointment(appointmentSlot)
      : await AppointmentService.createAppointment(appointmentSlot);
    
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
    
    if (!profileId) {
      return NextResponse.json(
        { error: 'ID профиля не указан' }, 
        { status: 400 }
      );
    }
    
    // Получаем историю записей для профиля
    const appointments = await AppointmentService.getAppointmentHistory(profileId);
    
    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Error in GET /api/appointments:', error);
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении истории записей' }, 
      { status: 500 }
    );
  }
} 