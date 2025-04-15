import { AppointmentSlot, Appointment } from '@/types/appointment';

/**
 * Адаптер для работы с API-роутами из клиентских компонентов
 * Этот сервис заменяет прямые вызовы к AppointmentService и MisApiService,
 * которые используют модули Node.js
 */
export class ApiAdapter {
  /**
   * Получает доступные слоты для указанной специальности или процедуры
   */
  static async getAvailableSlots(specialtySlug: string): Promise<AppointmentSlot[]> {
    try {
      const response = await fetch(`/api/slots/${specialtySlug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить доступные слоты');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }
  
  /**
   * Создает новую запись на прием
   */
  static async createAppointment(appointmentData: AppointmentSlot): Promise<Appointment> {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось создать запись');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
  
  /**
   * Отменяет запись на прием
   */
  static async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отменить запись');
      }
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error;
    }
  }
  
  /**
   * Получает историю записей на прием для указанного профиля
   */
  static async getAppointmentHistory(profileId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(`/api/appointments?profileId=${profileId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить историю записей');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting appointment history:', error);
      throw error;
    }
  }
} 