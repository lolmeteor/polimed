export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Утилиты для работы с приложением
 */

/**
 * Форматирует телефонный номер в российском формате: +7 (XXX) XXX-XX-XX
 * @param digits Строка, содержащая только цифры номера телефона (без +7)
 * @returns Отформатированный номер телефона
 */
export function formatPhoneNumber(digits: string): string {
  // Берём только первые 10 цифр, если больше
  const cleanDigits = digits.slice(0, 11).replace(/\D/g, "")
  
  // Если начинается с 7 или 8, пропускаем первую цифру
  let localDigits = cleanDigits
  if (cleanDigits.length === 11 && (cleanDigits[0] === "7" || cleanDigits[0] === "8")) {
    localDigits = cleanDigits.substring(1)
  }
  
  // Получаем нужные части номера
  const parts = []
  
  if (localDigits.length > 0) {
    // Код города/оператора
    const areaCode = localDigits.slice(0, 3)
    parts.push(areaCode)
    
    if (localDigits.length > 3) {
      // Первая часть номера
      const part1 = localDigits.slice(3, 6)
      parts.push(part1)
      
      if (localDigits.length > 6) {
        // Вторая часть номера
        const part2 = localDigits.slice(6, 8)
        parts.push(part2)
        
        if (localDigits.length > 8) {
          // Третья часть номера
          const part3 = localDigits.slice(8, 10)
          parts.push(part3)
        }
      }
    }
  }
  
  // Форматируем номер
  let formattedNumber = ""
  
  if (parts.length > 0) {
    formattedNumber = `+7 (${parts[0]})`
    
    if (parts.length > 1) {
      formattedNumber += ` ${parts[1]}`
      
      if (parts.length > 2) {
        formattedNumber += `-${parts[2]}`
        
        if (parts.length > 3) {
          formattedNumber += `-${parts[3]}`
        }
      }
    }
  }
  
  return formattedNumber
}

