"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MedicalInstitution, UserProfile } from '../services/mis-api-service';

// Определяем тип для контекста пользователя
interface UserContextType {
  userProfile: UserProfile | null;
  selectedInstitution: MedicalInstitution | null;
  setUserProfile: (profile: UserProfile) => void;
  setSelectedInstitution: (institution: MedicalInstitution) => void;
}

// Создаем контекст
const UserContext = createContext<UserContextType | null>(null);

// Хук для использования контекста
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext должен использоваться внутри UserProvider');
  }
  return context;
}

// Провайдер контекста
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<MedicalInstitution | null>(null);

  // Значение контекста
  const value: UserContextType = {
    userProfile,
    selectedInstitution,
    setUserProfile,
    setSelectedInstitution,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
} 