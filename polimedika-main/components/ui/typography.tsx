import React from 'react';
import { cn } from '@/lib/utils';

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  noWrap?: boolean; // Полностью запретить перенос строк
} & React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement>;

// Список предлогов
const prepositions = [
  'в', 'во', 'на', 'под', 'у', 'к', 'с', 'со', 'за', 'о', 'об', 'от', 'по', 'из', 'без', 'до', 'для', 'при', 'про', 'через', 'над'
];

// Список союзов
const conjunctions = [
  'а', 'и', 'но', 'или', 'да', 'если', 'что', 'чтобы', 'как', 'когда'
];

// Список аббревиатур
const abbreviations = [
  'ООО', 'АО', 'ИП', 'ЗАО', 'ГБУЗ'
];

// Регулярное выражение для числительных с единицами измерения
const measurementUnitsRegex = /(\d+)\s+(кг|г|м|см|мм|км|л|мл|ч|мин|сек|руб)/gi;

/**
 * CSS класс для предотвращения переноса между словами
 */
const noWrapStyle = { 
  whiteSpace: 'nowrap' as const,
  display: 'inline-block'
};

/**
 * Функция для обработки текста с заменой обычных пробелов на неразрывные
 * для предлогов, союзов, аббревиатур и числительных с единицами измерения
 */
export function processTypography(text: string): React.ReactNode {
  if (typeof text !== 'string') return text;
  
  // Список всех слов, которые нужно обработать
  const wordsToProcess = [...prepositions, ...conjunctions];
  
  // Разбиваем текст на слова
  const parts = text.split(/(\s+)/);
  const result: React.ReactNode[] = [];
  
  // Обрабатываем каждую часть текста
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const nextWord = parts[i + 2];
    
    // Если это предлог или союз И следующая часть - пробел И есть слово после пробела
    if (wordsToProcess.includes(part.toLowerCase()) && nextPart && nextWord) {
      // Создаем React-элемент с запретом переноса строки
      result.push(
        <span key={i} style={noWrapStyle}>
          {part}{nextPart}{nextWord}
        </span>
      );
      // Пропускаем обработанные части
      i += 2;
    } else {
      // Обрабатываем аббревиатуры
      const isAbbreviation = abbreviations.some(abbr => 
        part.toUpperCase() === abbr || part.includes(abbr)
      );
      
      if (isAbbreviation) {
        result.push(<span key={i} style={noWrapStyle}>{part}</span>);
      } else {
        result.push(part);
      }
    }
  }
  
  // Обработка числительных с единицами измерения для текстовых частей
  for (let i = 0; i < result.length; i++) {
    if (typeof result[i] === 'string') {
      result[i] = (result[i] as string).replace(
        measurementUnitsRegex, 
        (match, number, unit) => (
          <span style={noWrapStyle}>{number} {unit}</span>
        ) as any
      );
    }
  }
  
  return result;
}

export function Typography({
  children,
  className,
  variant = 'p',
  noWrap = false,
  ...props
}: TypographyProps) {
  const processedChildren = React.useMemo(() => {
    if (typeof children === 'string') {
      return processTypography(children);
    }
    
    return children;
  }, [children]);

  const Component = variant;

  return React.createElement(
    Component,
    {
      className: cn(
        noWrap ? 'whitespace-nowrap' : '',
        className
      ),
      ...props
    },
    processedChildren
  );
}

export default Typography; 