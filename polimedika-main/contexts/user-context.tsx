import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { misApiService, PatientProfile, Doctor, Specialty, LPU, District, Appointment } from '../services/mis-api-service';

// Интерфейс для контекста пользователя
interface UserContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  
  // Профиль пользователя
  userProfile: PatientProfile | null;
  setUserProfile: (profile: PatientProfile | null) => void;
  
  // Выбранные данные для записи на прием
  selectedDistrict: District | null;
  setSelectedDistrict: (district: District | null) => void;
  
  selectedLPU: LPU | null;
  setSelectedLPU: (lpu: LPU | null) => void;
  
  selectedSpecialty: Specialty | null;
  setSelectedSpecialty: (specialty: Specialty | null) => void;
  
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  
  selectedAppointment: Appointment | null;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  
  // История записей на прием
  appointmentHistory: Array<{
    doctor: Doctor;
    specialty: Specialty;
    lpu: LPU;
    appointment: Appointment;
    date: Date;
  }>;
  
  // Сброс выбранных данных для записи
  resetAppointmentSelections: () => void;
  
  // Добавление записи в историю
  addToAppointmentHistory: (appointment: {
    doctor: Doctor;
    specialty: Specialty;
    lpu: LPU;
    appointment: Appointment;
    date: Date;
  }) => void;

  // Сброс всего контекста
  resetContext: () => void;
}

// Создание контекста с дефолтными значениями
const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  loading: false,
  setLoading: () => {},
  
  userProfile: null,
  setUserProfile: () => {},
  
  selectedDistrict: null,
  setSelectedDistrict: () => {},
  
  selectedLPU: null,
  setSelectedLPU: () => {},
  
  selectedSpecialty: null,
  setSelectedSpecialty: () => {},
  
  selectedDoctor: null,
  setSelectedDoctor: () => {},
  
  selectedDate: null,
  setSelectedDate: () => {},
  
  selectedAppointment: null,
  setSelectedAppointment: () => {},
  
  appointmentHistory: [],
  
  resetAppointmentSelections: () => {},
  addToAppointmentHistory: () => {},
  resetContext: () => {},
});

// Поставщик контекста пользователя
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Состояние аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Профиль пользователя
  const [userProfile, setUserProfile] = useState<PatientProfile | null>(null);
  
  // Выбранные данные для записи на прием
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedLPU, setSelectedLPU] = useState<LPU | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // История записей на прием
  const [appointmentHistory, setAppointmentHistory] = useState<Array<{
    doctor: Doctor;
    specialty: Specialty;
    lpu: LPU;
    appointment: Appointment;
    date: Date;
  }>>([]);

  // Сброс выбранных данных для записи
  const resetAppointmentSelections = () => {
    setSelectedDistrict(null);
    setSelectedLPU(null);
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedAppointment(null);
  };
  
  // Добавление записи в историю
  const addToAppointmentHistory = (appointment: {
    doctor: Doctor;
    specialty: Specialty;
    lpu: LPU;
    appointment: Appointment;
    date: Date;
  }) => {
    setAppointmentHistory(prev => [appointment, ...prev]);
  };

  // Сброс всего контекста
  const resetContext = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    resetAppointmentSelections();
    setAppointmentHistory([]);
  };

  // Загрузка данных из локального хранилища при первом рендере
  useEffect(() => {
    // Загрузка состояния аутентификации
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth) {
      setIsAuthenticated(JSON.parse(storedAuth));
    }
    
    // Загрузка профиля пользователя
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    
    // Загрузка истории записей
    const storedHistory = localStorage.getItem('appointmentHistory');
    if (storedHistory) {
      setAppointmentHistory(JSON.parse(storedHistory));
    }
  }, []);
  
  // Сохранение данных в локальное хранилище при изменении
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [userProfile]);
  
  useEffect(() => {
    if (appointmentHistory.length > 0) {
      localStorage.setItem('appointmentHistory', JSON.stringify(appointmentHistory));
    }
  }, [appointmentHistory]);

  // Значение провайдера контекста
  const contextValue: UserContextType = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    
    userProfile,
    setUserProfile,
    
    selectedDistrict,
    setSelectedDistrict,
    
    selectedLPU,
    setSelectedLPU,
    
    selectedSpecialty,
    setSelectedSpecialty,
    
    selectedDoctor,
    setSelectedDoctor,
    
    selectedDate,
    setSelectedDate,
    
    selectedAppointment,
    setSelectedAppointment,
    
    appointmentHistory,
    
    resetAppointmentSelections,
    addToAppointmentHistory,
    resetContext,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Хук для использования контекста пользователя
export const useUser = () => useContext(UserContext); 