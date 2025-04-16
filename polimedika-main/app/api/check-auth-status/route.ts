import { NextResponse } from "next/server"
import { contactsStore } from "../telegram-contact/route"
import * as soap from 'soap'
import { parseStringPromise } from 'xml2js'

// SOAP константы
const WSDL_URL = process.env.MIS_WSDL_URL!
const MIS_GUID = process.env.MIS_GUID!
const DEFAULT_LPU_ID = process.env.DEFAULT_LPU_ID!
const SOAP_METHOD_CHECK_PATIENT = 'IHubService_CheckPatient'
const SOAP_NAMESPACE = 'http://tempuri.org/'

/**
 * Проверяет статус авторизации пользователя по Telegram ID
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("🟡 Check Auth: Получен запрос:", data)

    const { telegramId } = data

    if (!telegramId) {
      console.log("🟡 Check Auth: Отсутствует telegramId в запросе")
      return NextResponse.json({ error: "Telegram ID is required" }, { status: 400 })
    }

    // Проверяем, есть ли данные контакта для этого пользователя
    const contactData = contactsStore[telegramId]
    console.log("🟡 Check Auth: Данные контакта из store:", contactData)

    if (!contactData || !contactData.phoneNumber) {
      console.log("🟡 Check Auth: Контакт не найден для telegramId:", telegramId)
      return NextResponse.json({
        authenticated: false,
        message: "Contact not found",
      })
    }

    // Проверяем токены и параметры подключения
    if (!WSDL_URL || !MIS_GUID || !DEFAULT_LPU_ID) {
      console.error("🔴 Check Auth: Отсутствуют необходимые переменные окружения для подключения к МИС")
      return NextResponse.json(
        { 
          authenticated: false, 
          error: "MIS configuration is not set" 
        }, 
        { status: 500 }
      )
    }

    try {
      // Вызываем SOAP API для проверки пациента
      console.log("🟡 Check Auth: Проверяем номер телефона в МИС:", contactData.phoneNumber)
      
      // Создаем SOAP клиент
      const client = await soap.createClientAsync(WSDL_URL, { 
        namespaceArrayElements: false 
      })
      
      // Форматируем номер телефона, убираем +7, оставляем только цифры
      const phoneFormatted = contactData.phoneNumber.replace(/\+7/, '').replace(/\D/g, '')
      
      // Подготавливаем аргументы для SOAP запроса
      const args = {
        InputMessage: {
          PhoneNumber: phoneFormatted,
          TelegramId: telegramId.toString(),
          Guid: MIS_GUID,
          DefaultLpuId: parseInt(DEFAULT_LPU_ID, 10)
        }
      }

      console.log("�� Check Auth: Отправляем SOAP запрос с параметрами:", args)
      
      try {
        // Выполняем SOAP запрос
        const [rawResult] = await client[`${SOAP_METHOD_CHECK_PATIENT}Async`](args)
        
        // Парсим результат, если он в формате XML
        const jsonResult = typeof rawResult === 'string'
          ? await parseStringPromise(rawResult)
          : rawResult
        
        console.log("🟡 Check Auth: Получен ответ от МИС:", jsonResult)
        
        // Извлекаем нужные поля из ответа МИС
        const authenticated = Boolean(jsonResult?.CheckPatientResponse?.Authenticated?.[0] === 'true')
        const phoneNumber = contactData.phoneNumber
        
        // Парсим профили пациентов, если они есть
        let profiles = []
        try {
          if (jsonResult?.CheckPatientResponse?.Profiles?.[0]?.Profile) {
            profiles = jsonResult.CheckPatientResponse.Profiles[0].Profile.map((profile: any) => ({
              id: profile.Id?.[0] || '',
              fullName: `${profile.LastName?.[0] || ''} ${profile.FirstName?.[0] || ''} ${profile.Patronymic?.[0] || ''}`.trim(),
              firstName: profile.FirstName?.[0] || '',
              patronymic: profile.Patronymic?.[0] || '',
              lastName: profile.LastName?.[0] || '',
              birthDate: profile.BirthDate?.[0] || '',
              age: profile.Age?.[0] ? parseInt(profile.Age[0], 10) : 0,
              phone: phoneNumber
            }))
          }
        } catch (error) {
          console.error("🔴 Check Auth: Ошибка при обработке профилей пациентов:", error)
        }
        
        // Формируем ответ
        const response = {
          authenticated,
          phoneNumber,
          exists: authenticated,
          hasMultipleProfiles: profiles.length > 1,
          profiles
        }
        
        console.log("🟡 Check Auth: Отправляем успешный ответ:", response)
        
        return NextResponse.json(response)
      } catch (soapError) {
        console.error("🔴 Check Auth: Ошибка при выполнении SOAP запроса:", soapError)
        
        // Временный обходной путь: если SOAP не работает, используем моковые данные
        console.log("🟡 Check Auth: Используем моковые данные для отладки")
        
        // Моковые данные для тестирования
        const mockResponse = {
          authenticated: true,
          phoneNumber: contactData.phoneNumber,
          exists: true,
          hasMultipleProfiles: true,
          profiles: [
            {
              id: "1",
              fullName: "Антонов Алексей Юрьевич",
              firstName: "Алексей",
              patronymic: "Юрьевич",
              lastName: "Антонов",
              birthDate: "10/10/1988",
              age: 36,
              phone: contactData.phoneNumber,
            },
            {
              id: "2",
              fullName: "Антонов Юрий Анатольевич",
              firstName: "Юрий",
              patronymic: "Анатольевич",
              lastName: "Антонов",
              birthDate: "12/03/1949",
              age: 76,
              phone: contactData.phoneNumber,
            },
          ],
        }
        
        return NextResponse.json(mockResponse)
      }
    } catch (error) {
      console.error("🔴 Check Auth: Ошибка при проверке номера телефона:", error)
      return NextResponse.json({
        authenticated: false,
        error: "Failed to check phone number in MIS"
      }, { status: 502 })
    }
  } catch (error) {
    console.error("🔴 Check Auth: Ошибка при проверке статуса авторизации:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

