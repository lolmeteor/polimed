import { NextResponse } from "next/server";
import hubServiceClient from "@/services/hub-service-client";

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
      // Форматируем номер телефона (убираем +7 в начале, если есть)
      const formattedPhone = phoneNumber.replace(/^\+7/, '');
      
      console.log("Проверяем номер телефона в МИС:", formattedPhone);
      
      // Ищем пациента по номеру телефона в МИС
      const searchResult = await hubServiceClient.searchTop10Patient({
        cellPhone: formattedPhone
      });
      
      if (!searchResult.success || !searchResult.data) {
        console.log("Пациент не найден в МИС или ошибка поиска:", searchResult.error);
        return NextResponse.json({
          exists: false,
          message: "User not found in MIS"
        });
      }
      
      console.log("Результат поиска в МИС:", searchResult.data);
      
      // Преобразуем данные из МИС в формат профилей для приложения
      const profiles = Array.isArray(searchResult.data) 
        ? searchResult.data.map(patient => ({
            id: patient.IdPat || String(Math.random()), // используем IdPat или генерируем случайный ID
            fullName: `${patient.LastName} ${patient.FirstName} ${patient.SecondName || ''}`.trim(),
            firstName: patient.FirstName || '',
            patronymic: patient.SecondName || '',
            lastName: patient.LastName || '',
            birthDate: patient.BirthDate || '',
            age: calculateAge(patient.BirthDate),
            phone: phoneNumber,
          }))
        : [];
      
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
      console.error("Ошибка при проверке номера телефона в МИС:", error);
      return NextResponse.json({ 
        error: "Failed to check phone number in MIS",
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

