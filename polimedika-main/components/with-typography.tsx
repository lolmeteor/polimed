import React from 'react';
import { processTypography } from './ui/typography';

/**
 * HOC (компонент высшего порядка) для добавления типографической обработки 
 * к существующим компонентам, отображающим текст
 * 
 * @param WrappedComponent Компонент, который нужно обернуть
 * @returns Новый компонент с типографической обработкой текста
 */
export function withTypography<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithTypography: React.FC<P> = (props) => {
    // Рекурсивная функция, которая обрабатывает все текстовые узлы в children
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      if (typeof children === 'string') {
        return processTypography(children);
      }

      if (React.isValidElement(children)) {
        if (children.props.children) {
          const newChildren = processChildren(children.props.children);
          return React.cloneElement(children, {}, newChildren);
        }
        return children;
      }

      if (Array.isArray(children)) {
        return React.Children.map(children, child => processChildren(child));
      }

      return children;
    };

    // Обрабатываем все children в props
    const modifiedProps = { ...props } as P;
    if ('children' in (props as any)) {
      const children = (props as any).children;
      (modifiedProps as any).children = processChildren(children);
    }

    return <WrappedComponent {...modifiedProps} />;
  };

  // Копируем отображаемое имя компонента для отладки
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithTypography.displayName = `WithTypography(${displayName})`;

  return WithTypography;
}

export default withTypography; 