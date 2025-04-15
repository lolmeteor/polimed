/**
 * Конвертирует дату из формата МИС ("/Date(timestamp)/") в JavaScript Date
 */
export function convertMisDateToJsDate(misDateString: string): Date {
  try {
    // Извлекаем timestamp из строки формата "/Date(timestamp)/" или "/Date(timestamp+0300)/"
    const timestampMatch = misDateString.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
    
    if (!timestampMatch) {
      console.error('Некорректный формат даты МИС:', misDateString);
      return new Date(); // Возвращаем текущую дату в случае ошибки
    }
    
    const timestamp = parseInt(timestampMatch[1]);
    return new Date(timestamp);
  } catch (error) {
    console.error('Ошибка при конвертации даты МИС:', error);
    return new Date(); // Возвращаем текущую дату в случае ошибки
  }
} 