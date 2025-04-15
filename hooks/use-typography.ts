import { useMemo } from 'react';
import { processTypography } from '@/components/ui/typography';

/**
 * Хук для обработки текста с типографическими улучшениями.
 * Удобен в случаях, когда использование компонента Typography или HOC невозможно.
 * 
 * @param text Текст для обработки
 * @returns Обработанный текст с защитой от "висячих предлогов", неразрывными аббревиатурами и т.д.
 */
export function useTypography(text: string): string {
  const processedText = useMemo(() => {
    return processTypography(text) as string;
  }, [text]);

  return processedText;
}

/**
 * Хук для обработки массива текстов.
 * Полезен при работе со списками данных, полученными от API.
 * 
 * @param texts Массив текстов для обработки
 * @returns Массив обработанных текстов
 */
export function useTypographyArray(texts: string[]): string[] {
  const processedTexts = useMemo(() => {
    return texts.map(text => processTypography(text) as string);
  }, [texts]);

  return processedTexts;
}

/**
 * Хук для обработки объекта с текстовыми полями.
 * Полезен при работе с объектами данных, полученными от API.
 * 
 * @param obj Объект с текстовыми полями
 * @param textFields Массив ключей текстовых полей для обработки
 * @returns Объект с обработанными текстовыми полями
 */
export function useTypographyObject<T extends Record<string, any>>(
  obj: T,
  textFields: (keyof T)[]
): T {
  const processedObj = useMemo(() => {
    const result = { ...obj };
    
    textFields.forEach(field => {
      if (typeof result[field] === 'string') {
        result[field] = processTypography(result[field]) as any;
      }
    });
    
    return result;
  }, [obj, textFields]);

  return processedObj;
}

export default useTypography; 