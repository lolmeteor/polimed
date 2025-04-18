'use client';

import React, { ReactNode, memo, useCallback, useMemo } from 'react';
import { processTypography } from '@/components/ui/typography';

interface TypographyProviderProps {
  children: ReactNode;
  disabled?: boolean; // Для возможности временного отключения
}

/**
 * TypographyProvider - компонент для глобального применения 
 * типографических улучшений ко всему тексту в приложении.
 * 
 * Работает путем перехвата и обработки всех текстовых узлов в дереве компонентов.
 */
export const TypographyProvider = memo(function TypographyProvider({ 
  children, 
  disabled = false 
}: TypographyProviderProps) {
  // Кеш для обработанных строк для повышения производительности
  const processedCache = useMemo(() => new Map<string, string>(), []);
  
  // Мемоизированная функция обработки для предотвращения лишних пересозданий
  const processWithCache = useCallback((text: string): string => {
    if (disabled) return text;
    
    // Игнорируем пустые строки и строки, состоящие только из пробелов
    if (!text || !text.trim()) return text;
    
    // Игнорируем очень короткие строки (1-2 символа), которые не могут содержать предлоги и союзы
    if (text.length <= 2) return text;
    
    // Проверяем кеш сначала
    if (processedCache.has(text)) {
      return processedCache.get(text) as string;
    }
    
    // Обрабатываем и сохраняем в кеш
    const processed = processTypography(text) as string;
    processedCache.set(text, processed);
    return processed;
  }, [disabled, processedCache]);

  // Пропускаем компоненты, где типографика может быть нежелательна или может нарушить функциональность
  const skipComponents = useMemo(() => [
    'input', 'textarea', 'code', 'pre', 'script', 'style',
    'noscript', 'iframe', 'canvas', 'svg', 'button', 'select',
    'option', 'datalist', 'math', 'meter', 'progress'
  ], []);

  // Функция для рекурсивной обработки всех текстовых узлов
  const processTextNodes = useCallback((node: ReactNode): ReactNode => {
    // Если типографика отключена, возвращаем как есть
    if (disabled) return node;
    
    // Обработка строковых узлов
    if (typeof node === 'string') {
      return processWithCache(node);
    }

    // Пропускаем null, undefined, числа, булевы значения
    if (!node || typeof node !== 'object') {
      return node;
    }

    // Обработка React-элементов
    if (React.isValidElement(node)) {
      // Если компонент помечен специальным свойством, пропускаем типографику
      if ((node.props as any)?.skipTypography === true) {
        return node;
      }
      
      // Получаем тип компонента или его имя
      const nodeType = (node.type as any)?.displayName || 
                       (node.type as any)?.name || 
                       node.type;
      
      // Пропускаем компоненты из списка skipComponents
      if (typeof nodeType === 'string') {
        const typeLower = nodeType.toLowerCase();
        
        if (skipComponents.includes(typeLower)) {
          return node;
        }
        
        // Дополнительная проверка для компонентов, которые могут содержать в названии слова из списка исключений
        for (const skipType of skipComponents) {
          if (typeLower.includes(skipType)) {
            return node;
          }
        }
      }

      // Обрабатываем children компонента
      const hasChildren = node.props && 'children' in node.props;
      if (hasChildren) {
        const processedChildren = processTextNodes(node.props.children);
        
        // Оптимизация: если children не изменились, не создаем новый элемент
        if (processedChildren === node.props.children) {
          return node;
        }
        
        // Создаем новый элемент с обработанными children
        return React.cloneElement(node, node.props, processedChildren);
      }
      
      return node;
    }

    // Обработка массивов (списки компонентов)
    if (Array.isArray(node)) {
      let hasChanged = false;
      const processedArray = node.map((child, index) => {
        const processed = processTextNodes(child);
        if (processed !== child) {
          hasChanged = true;
        }
        return processed;
      });
      
      // Оптимизация: возвращаем исходный массив, если ничего не изменилось
      return hasChanged ? processedArray : node;
    }

    return node;
  }, [disabled, processWithCache, skipComponents]);

  // Мемоизируем результат обработки для предотвращения повторных рендеров
  const processedChildren = useMemo(() => processTextNodes(children), [children, processTextNodes]);

  return <>{processedChildren}</>;
});

/**
 * HOC для пропуска типографической обработки в определенных компонентах
 */
export function withoutTypography<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithoutTypography: React.FC<P> = (props) => {
    return <WrappedComponent {...props} skipTypography={true} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithoutTypography.displayName = `WithoutTypography(${displayName})`;

  return WithoutTypography;
}

export default TypographyProvider; 