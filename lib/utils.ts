export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Утилиты для работы с приложением
 */

/**
 * Форматирует телефонный номер в российском формате: +7 (XXX) XXX-XX-XX
 * @param digits Строка, содержащая только цифры номера телефона
 * @returns Отформатированный номер телефона
 */
export function formatPhoneNumber(digits: string): string {
  // Если пустая строка, возвращаем пустую строку
  if (!digits || digits.length === 0) {
    return "";
  }
  
  // Очищаем от всех нецифровых символов
  const cleanDigits = digits.replace(/\D/g, "");
  
  // Обрабатываем номер в зависимости от длины
  let localDigits = cleanDigits;
  
  // Если 11 цифр и начинается с 7 или 8, убираем первую цифру
  if (localDigits.length === 11 && (localDigits[0] === "7" || localDigits[0] === "8")) {
    localDigits = localDigits.substring(1);
  }
  
  // Если больше 10 цифр, обрезаем до 10
  if (localDigits.length > 10) {
    localDigits = localDigits.slice(0, 10);
  }
  
  // Форматируем номер
  let formattedNumber = "+7";
  
  // Добавляем код города в скобках (XXX)
  if (localDigits.length > 0) {
    // Берем до 3 цифр или сколько есть
    const areaCode = localDigits.slice(0, Math.min(3, localDigits.length));
    formattedNumber += ` (${areaCode}`;
    
    // Если меньше 3 цифр, дополняем подчеркиваниями
    if (areaCode.length < 3) {
      formattedNumber += "_".repeat(3 - areaCode.length);
    }
    
    formattedNumber += ")";
  } else {
    formattedNumber += " (___)";
  }
  
  // Добавляем первую часть номера XXX
  if (localDigits.length > 3) {
    const firstPart = localDigits.slice(3, Math.min(6, localDigits.length));
    formattedNumber += ` ${firstPart}`;
    
    // Если меньше 3 цифр, дополняем подчеркиваниями
    if (firstPart.length < 3) {
      formattedNumber += "_".repeat(3 - firstPart.length);
    }
  } else {
    formattedNumber += " ___";
  }
  
  // Добавляем вторую часть номера XX
  if (localDigits.length > 6) {
    const secondPart = localDigits.slice(6, Math.min(8, localDigits.length));
    formattedNumber += `-${secondPart}`;
    
    // Если меньше 2 цифр, дополняем подчеркиваниями
    if (secondPart.length < 2) {
      formattedNumber += "_".repeat(2 - secondPart.length);
    }
  } else {
    formattedNumber += "-__";
  }
  
  // Добавляем третью часть номера XX
  if (localDigits.length > 8) {
    const thirdPart = localDigits.slice(8, Math.min(10, localDigits.length));
    formattedNumber += `-${thirdPart}`;
    
    // Если меньше 2 цифр, дополняем подчеркиваниями
    if (thirdPart.length < 2) {
      formattedNumber += "_".repeat(2 - thirdPart.length);
    }
  } else {
    formattedNumber += "-__";
  }
  
  return formattedNumber;
}

