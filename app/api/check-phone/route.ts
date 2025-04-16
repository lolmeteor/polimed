import { NextResponse } from "next/server";
import { soapService } from "@/services/soap-service";

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
    const data = await request.json();
    console.log("Получен запрос на проверку номера телефона:", data);

    const { phoneNumber } = data;

    if (!phoneNumber) {
      console.error("Отсутствует номер телефона в запросе");
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    try {
      // Форматируем номер телефона для поиска в МИС:
      // 1. Убираем все нецифровые символы
      // 2. Убираем префикс +7 или 8 (если есть)
      const digits = phoneNumber.replace(/\D/g, '');
      let formattedPhone = digits;
      
      if (digits.startsWith('7') || digits.startsWith('8')) {
        formattedPhone = digits.substring(1);
      } else if (phoneNumber.startsWith('+7')) {
        formattedPhone = digits; // В случае, если оттуда уже убран префикс +7 при удалении нецифровых символов
      }
      
      console.log("Проверяем номер телефона в МИС через SOAP:", formattedPhone, "Исходный номер:", phoneNumber);
      
      // Ищем пациента по номеру телефона в МИС через SOAP
      const searchResult = await soapService.searchPatientByPhone(formattedPhone);
      
      // Если данные не получены, возвращаем информацию об отсутствии пациента
      if (!searchResult || !searchResult.Patient || searchResult.Patient.length === 0) {
        console.log("Пациент не найден в МИС через SOAP");
        return NextResponse.json({
          exists: false,
          message: "Номер телефона не найден в системе клиники"
        });
      }
      
      console.log("Результат поиска в МИС через SOAP:", searchResult);
      
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
        phone: phoneNumber,
      }));
      
      const hasProfiles = profiles.length > 0;
      
      console.log("Отправляем ответ:", {
        exists: hasProfiles,
        hasMultipleProfiles: profiles.length > 1,
        profiles
      });
      
      return NextResponse.json({
        exists: hasProfiles,
        hasMultipleProfiles: profiles.length > 1,
        profiles
      });
    } catch (error) {
      console.error("Ошибка при проверке номера телефона в МИС через SOAP:", error);
      return NextResponse.json({ 
        error: "Failed to check phone number in MIS via SOAP",
        details: String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
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

