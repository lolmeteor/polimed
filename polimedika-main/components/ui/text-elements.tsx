import React from 'react';
import Typography, { processTypography } from './typography';

type TextProps = {
  children: React.ReactNode;
  className?: string;
  noWrap?: boolean;
} & React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement>;

export const H1 = (props: TextProps) => <Typography variant="h1" {...props} />;
export const H2 = (props: TextProps) => <Typography variant="h2" {...props} />;
export const H3 = (props: TextProps) => <Typography variant="h3" {...props} />;
export const H4 = (props: TextProps) => <Typography variant="h4" {...props} />;
export const H5 = (props: TextProps) => <Typography variant="h5" {...props} />;
export const H6 = (props: TextProps) => <Typography variant="h6" {...props} />;
export const P = (props: TextProps) => <Typography variant="p" {...props} />;
export const Span = (props: TextProps) => <Typography variant="span" {...props} />;

/**
 * Компонент для обработки текста, полученного от API или из других динамических источников.
 * Преимущество перед прямым использованием processTypography в том, что он поддерживает мемоизацию.
 */
type ProcessedTextProps = {
  text: string;
  className?: string;
  component?: 'p' | 'span' | 'div';
} & React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement | HTMLDivElement>;

export const ProcessedText = ({
  text,
  className,
  component = 'p',
  ...props
}: ProcessedTextProps) => {
  const processedText = React.useMemo(() => processTypography(text), [text]);
  
  return React.createElement(
    component,
    {
      className,
      ...props
    },
    processedText
  );
};

/**
 * Компонент для обработки HTML контента, полученного от API.
 * Важно: данный компонент должен использоваться только с доверенным HTML.
 */
type ProcessedHtmlProps = {
  html: string;
  className?: string;
};

export const ProcessedHtml = ({ html, className }: ProcessedHtmlProps) => {
  const processedHtml = React.useMemo(() => {
    // Обрабатываем HTML как строку с заменой всех пробелов внутри тегов
    const processed = html.replace(/>([^<]+)</g, (match, text) => {
      const processed = processTypography(text);
      // Если результат - массив JSX элементов, преобразуем его обратно в строку
      if (Array.isArray(processed)) {
        return `>${text}<`;
      }
      return `>${processed}<`;
    });
    return processed;
  }, [html]);
  
  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: processedHtml }} 
    />
  );
}; 