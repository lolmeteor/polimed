import { NextResponse } from "next/server"
import { contactsStore } from "../telegram-contact/route"
import { soapService } from "@/services/soap-service"

// Интерфейс для представления пациента из SOAP-ответа
interface SoapPatient {
  IdPat?: string;
  FirstName?: string;
  SecondName?: string;
  LastName?: string;
  BirthDate?: string;
  [key: string]: any; // Для других возможных полей
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("🟡 Check Auth: Получен запрос:", data)

    const { telegramId } = data

    if (!telegramId) {
      console.log("🟡 Check Auth: Отсутствует telegramId в запросе")
      return NextResponse.json({ error: "Telegram ID is required" }, { status: 400 })
    }

    // Получаем данные контакта для этого пользователя
    const contactData = contactsStore[telegramId]
    console.log("🟡 Check Auth: Данные контакта из store:", contactData)
    console.log("🟡 Check Auth: Текущее состояние store:", contactsStore)

    if (!contactData || !contactData.phoneNumber) {
      console.log("🟡 Check Auth: Контакт или номер телефона не найден для telegramId:", telegramId)
      return NextResponse.json({
        authenticated: false,
        message: "Contact not found",
      })
    }

    // Проверяем номер телефона в системе клиники через МИС API с использованием SOAP
    try {
      console.log("🟡 Check Auth: Проверяем номер телефона в МИС через SOAP:", contactData.phoneNumber)
      
      // Форматируем номер телефона (убираем +7 в начале, если есть)
      const formattedPhone = contactData.phoneNumber.replace(/^\+7/, '');
      
      // Ищем пациента по номеру телефона в МИС через SOAP
      const searchResult = await soapService.searchPatientByPhone(formattedPhone);
      
      // Если данные не получены, возвращаем информацию об отсутствии пациента
      if (!searchResult || !searchResult.Patient || searchResult.Patient.length === 0) {
        console.log("🟡 Check Auth: Пациент не найден в МИС через SOAP");
        return NextResponse.json({
          authenticated: false,
          message: "User not found in MIS",
        });
      }
      
      console.log("🟡 Check Auth: Результат поиска в МИС через SOAP:", searchResult);
      
      // Преобразуем данные из МИС в формат профилей для приложения
      const patients: SoapPatient[] = Array.isArray(searchResult.Patient) 
        ? searchResult.Patient 
        : [searchResult.Patient];
      
      const profiles = patients.map((patient: SoapPatient) => ({
        id: patient.IdPat || String(Math.random()), // используем IdPat или генерируем случайный ID
        fullName: `${patient.LastName || ''} ${patient.FirstName || ''} ${patient.SecondName || ''}`.trim(),
        firstName: patient.FirstName || '',
        patronymic: patient.SecondName || '',
        lastName: patient.LastName || '',
        birthDate: patient.BirthDate || '',
        age: calculateAge(patient.BirthDate || ''),
        phone: contactData.phoneNumber,
      }));
      
      const hasProfiles = profiles.length > 0;
      
      console.log("🟡 Check Auth: Преобразованные профили:", profiles);
      console.log("🟡 Check Auth: Отправляем ответ:", {
        authenticated: hasProfiles,
        phoneNumber: contactData.phoneNumber,
        exists: hasProfiles,
        hasMultipleProfiles: profiles.length > 1,
        profiles,
      });

      return NextResponse.json({
        authenticated: hasProfiles,
        phoneNumber: contactData.phoneNumber,
        exists: hasProfiles,
        hasMultipleProfiles: profiles.length > 1,
        profiles,
      });
    } catch (error) {
      console.error("🔴 Check Auth: Ошибка при проверке номера телефона в МИС через SOAP:", error)
      return NextResponse.json({
        authenticated: false,
        error: "Failed to check phone number in MIS via SOAP",
      })
    }
  } catch (error) {
    console.error("🔴 Check Auth: Ошибка при проверке статуса авторизации:", error)
    return NextResponse.json({ error: "Failed to check authentication status" }, { status: 500 })
  }
}

// Функция для расчета возраста по дате рождения
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  try {
    // Приводим дату к формату Date
    const dob = new Date(birthDate);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error("Ошибка при расчете возраста:", error);
    return 0;
  }
}

