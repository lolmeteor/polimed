import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppointmentTicketModal } from '@/components/appointment-ticket-modal';
import { UserProvider } from '@/context/user-context';
import { act } from 'react-dom/test-utils';
import * as userHooks from '@/context/user-context';
import * as html2canvas from 'html2canvas';

// Моки
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Мок для fetch
global.fetch = jest.fn();

describe('AppointmentTicketModal', () => {
  // Тестовые данные
  const mockAppointmentData = {
    id: 'test-id-123',
    datetime: '10 мая 2024, 15:30',
    cabinet: '305',
    address: 'ул. Братьев Кашириных, 130А',
    ticketNumber: 'A-123'
  };

  const mockUserProfile = {
    id: 'patient-001',
    fullName: 'Иванов Иван Иванович',
    firstName: 'Иван',
    lastName: 'Иванов',
    patronymic: 'Иванович',
    birthDate: '01/01/1980',
    phone: '+7 (999) 999-99-99',
    appointments: []
  };

  const mockOnClose = jest.fn();
  const mockGetTelegramId = jest.fn().mockReturnValue(12345678);

  // Сброс моков перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(userHooks, 'useUser').mockReturnValue({
      userProfile: mockUserProfile,
      getTelegramId: mockGetTelegramId,
      // Другие необходимые свойства контекста
      availableProfiles: [],
      isLoading: false,
      setUserProfile: jest.fn(),
      setAvailableProfiles: jest.fn(),
      saveUserPhone: jest.fn(),
      getUserPhone: jest.fn(),
      loadUserData: jest.fn(),
      saveTelegramId: jest.fn(),
      logout: jest.fn(),
      addAppointment: jest.fn(),
      cancelAppointment: jest.fn()
    });

    // Мок для html2canvas
    (html2canvas.default as jest.Mock).mockResolvedValue({
      toBlob: (callback: (blob: Blob | null) => void) => {
        const blob = new Blob(['test'], { type: 'image/png' });
        callback(blob);
      }
    });

    // Мок для fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    });
  });

  // Тест 1: Проверка корректного отображения компонента
  test('отображает модальное окно талона с данными записи', () => {
    render(
      <AppointmentTicketModal 
        isOpen={true} 
        onClose={mockOnClose} 
        appointmentData={mockAppointmentData} 
      />
    );

    // Проверяем, что информация о записи отображается корректно
    expect(screen.getByText('Запись на прием')).toBeInTheDocument();
    expect(screen.getByText(mockAppointmentData.ticketNumber)).toBeInTheDocument();
    expect(screen.getByText(mockAppointmentData.datetime)).toBeInTheDocument();
    expect(screen.getByText(`Кабинет ${mockAppointmentData.cabinet}`)).toBeInTheDocument();
    expect(screen.getByText(mockAppointmentData.address)).toBeInTheDocument();
  });

  // Тест 2: Проверка закрытия модального окна
  test('закрывает модальное окно при нажатии на кнопку "Закрыть"', () => {
    render(
      <AppointmentTicketModal 
        isOpen={true} 
        onClose={mockOnClose} 
        appointmentData={mockAppointmentData} 
      />
    );

    // Нажимаем на кнопку "Закрыть"
    fireEvent.click(screen.getByText('Закрыть'));
    
    // Проверяем, что onClose был вызван
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Тест 3: Проверка отображения сообщения об ошибке при отсутствии профиля
  test('отображает сообщение об ошибке при отсутствии профиля', () => {
    // Переопределяем мок useUser, чтобы вернуть null для userProfile
    jest.spyOn(userHooks, 'useUser').mockReturnValue({
      userProfile: null,
      getTelegramId: mockGetTelegramId,
      // Другие необходимые свойства контекста
      availableProfiles: [],
      isLoading: false,
      setUserProfile: jest.fn(),
      setAvailableProfiles: jest.fn(),
      saveUserPhone: jest.fn(),
      getUserPhone: jest.fn(),
      loadUserData: jest.fn(),
      saveTelegramId: jest.fn(),
      logout: jest.fn(),
      addAppointment: jest.fn(),
      cancelAppointment: jest.fn()
    });

    render(
      <AppointmentTicketModal 
        isOpen={true} 
        onClose={mockOnClose} 
        appointmentData={mockAppointmentData} 
      />
    );

    // Проверяем, что отображается сообщение об ошибке
    expect(screen.getByText('Ошибка')).toBeInTheDocument();
    expect(screen.getByText('Не удалось загрузить данные профиля. Пожалуйста, авторизуйтесь снова.')).toBeInTheDocument();
  });

  // Тест 4: Проверка отправки талона в чат через серверный API
  test('отправляет талон в чат при нажатии на кнопку "Отправить в чат"', async () => {
    render(
      <AppointmentTicketModal 
        isOpen={true} 
        onClose={mockOnClose} 
        appointmentData={mockAppointmentData} 
      />
    );

    // Выбираем опцию "Отправить талон в чат"
    fireEvent.click(screen.getByLabelText('Отправить талон в чат "Полимедика"'));
    
    // Нажимаем на кнопку "Отправить в чат"
    fireEvent.click(screen.getByText('Отправить в чат'));
    
    // Проверяем, что функция getTelegramId была вызвана
    expect(mockGetTelegramId).toHaveBeenCalledTimes(1);
    
    // Ждем, пока завершится асинхронная операция
    await waitFor(() => {
      // Проверяем, что fetch был вызван с правильными параметрами
      expect(global.fetch).toHaveBeenCalledWith('/api/send-telegram-image', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });
    
    // Проверяем, что модальное окно закрывается после успешной отправки
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Тест 5: Проверка отображения ошибки при неудачной отправке талона
  test('отображает сообщение об ошибке при неудачной отправке талона', async () => {
    // Меняем мок для fetch, чтобы он возвращал ошибку
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: false, error: 'Тестовая ошибка' })
    });

    render(
      <AppointmentTicketModal 
        isOpen={true} 
        onClose={mockOnClose} 
        appointmentData={mockAppointmentData} 
      />
    );

    // Выбираем опцию "Отправить талон в чат"
    fireEvent.click(screen.getByLabelText('Отправить талон в чат "Полимедика"'));
    
    // Нажимаем на кнопку "Отправить в чат"
    fireEvent.click(screen.getByText('Отправить в чат'));
    
    // Ждем, пока завершится асинхронная операция
    await waitFor(() => {
      // Проверяем, что отображается сообщение об ошибке
      expect(screen.getByText(/Ошибка:/)).toBeInTheDocument();
    });
    
    // Проверяем, что модальное окно не закрывается при ошибке
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 