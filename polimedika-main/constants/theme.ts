/**
 * Файл с константами для стилей приложения
 *
 * Эти константы соответствуют CSS-переменным, определенным в globals.css
 * и используются в tailwind.config.ts для создания классов Tailwind.
 *
 * Примеры использования в компонентах:
 * - text-txt-primary (цвет текста)
 * - border-brand (цвет границы)
 * - rounded-btn (радиус кнопки)
 * - px-page-x (горизонтальный отступ страницы)
 */

/**
 * Цвета приложения
 *
 * Используются через классы Tailwind:
 * - text-brand, bg-brand, border-brand (основной цвет бренда)
 * - text-brand-dark, bg-brand-dark (темный цвет бренда)
 * - text-txt-primary (основной цвет текста)
 * - text-txt-secondary (вторичный цвет текста)
 * - text-brand-error, border-brand-error (цвет ошибки)
 */
export const COLORS = {
  brand: {
    primary: "var(--brand-primary)", // #8DCECA - основной цвет бренда
    dark: "var(--brand-primary-dark)", // #1A2B6B - темный цвет бренда
    error: "var(--brand-error)", // #E94E1B - цвет ошибки
  },
  text: {
    primary: "var(--text-primary)", // #182F5F - основной цвет текста
    secondary: "var(--text-secondary)", // #7F8594 - вторичный цвет текста
  },
} as const

/**
 * Отступы приложения
 *
 * Используются через классы Tailwind:
 * - px-page-x (горизонтальный отступ страницы)
 * - pt-page-y (верхний отступ страницы)
 * - h-nav-height (высота нижней навигации)
 * - bottom-nav-bottom (нижний отступ навигации)
 */
export const SPACING = {
  page: {
    x: "var(--spacing-page-x)", // 57px - горизонтальный отступ страницы
    y: "var(--spacing-page-y)", // 38px - верхний отступ страницы
  },
  bottomNav: {
    height: "var(--spacing-bottom-nav-height)", // 67px - высота нижней навигации
    bottom: "var(--spacing-bottom-nav-bottom)", // 20px - нижний отступ навигации
  },
} as const

// Константы для более удобного управления
export const BOTTOM_NAV = {
  HEIGHT: 67,
  PADDING: 20,
  TOTAL_SPACE: 87, // HEIGHT + PADDING
  WIDTH: 342,
} as const

/**
 * Размеры элементов приложения
 *
 * Используются через классы Tailwind:
 * - rounded-btn (радиус кнопки)
 * - rounded-crd (радиус карточки)
 * - rounded-pill (радиус таблетки)
 * - rounded-circle (радиус круга)
 */
export const SIZES = {
  maxWidth: "md", // максимальная ширина контента
  borderRadius: {
    button: "var(--border-radius-button)", // 15px - радиус кнопки
    card: "var(--border-radius-card)", // 15px - радиус карточки
    pill: "var(--border-radius-pill)", // 38px - радиус таблетки
    circle: "var(--border-radius-circle)", // 100px - радиус круга
  },
} as const

