import React from 'react';
import { cn } from '@/lib/utils';

// Вспомогательные функции для типографики
export function processTypography(text: string): React.ReactNode {
  if (!text) return text;
  return text;
}

// Компонент Typography
interface TypographyProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'small' | 'subtitle' | 'caption';
  component?: React.ElementType;
}

export default function Typography({
  children,
  className,
  variant = 'p',
  component,
}: TypographyProps) {
  const Component = component || getDefaultComponent(variant);

  return (
    <Component 
      className={cn(
        getVariantClasses(variant),
        className
      )}
    >
      {typeof children === 'string' ? processTypography(children) : children}
    </Component>
  );
}

// Получение компонента по умолчанию для варианта
function getDefaultComponent(variant: string): React.ElementType {
  switch (variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';
    case 'small': return 'small';
    case 'subtitle': return 'p';
    case 'caption': return 'span';
    default: return 'p';
  }
}

// Получение классов для варианта
function getVariantClasses(variant: string): string {
  switch (variant) {
    case 'h1': return 'text-4xl font-bold text-gray-900';
    case 'h2': return 'text-3xl font-bold text-gray-900';
    case 'h3': return 'text-2xl font-bold text-gray-900';
    case 'h4': return 'text-xl font-semibold text-gray-900';
    case 'h5': return 'text-lg font-semibold text-gray-900';
    case 'h6': return 'text-base font-semibold text-gray-900';
    case 'subtitle': return 'text-base font-medium text-gray-700';
    case 'small': return 'text-sm text-gray-600';
    case 'caption': return 'text-xs text-gray-500';
    default: return 'text-base text-gray-800';
  }
} 