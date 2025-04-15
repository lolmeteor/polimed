import { PDFDocument, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

// Пути к локальным файлам шрифтов
const MONTSERRAT_FONTS_PATHS = {
  regular: '/fonts/montserrat-regular.woff2',
  medium: '/fonts/montserrat-medium.woff2',
  semibold: '/fonts/montserrat-semibold.woff2',
  bold: '/fonts/montserrat-bold.woff2'
}

// Пути к латинским шрифтам для цифр
const MONTSERRAT_LATIN_FONTS_PATHS = {
  regular: '/fonts/montserrat-latin-regular.woff2',
  medium: '/fonts/montserrat-latin-medium.woff2',
  semibold: '/fonts/montserrat-latin-semibold.woff2',
  bold: '/fonts/montserrat-latin-bold.woff2'
}

// Google Fonts URLs для Montserrat
const GOOGLE_FONTS_URLS = {
  regular: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4GLs.woff2',
  medium: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4GLs.woff2',
  semibold: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu173w5aXp-p7K4GLs.woff2',
  bold: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4GLs.woff2'
}

// Функция для загрузки шрифта Montserrat
export async function loadMontserratFont(pdfDoc: PDFDocument, style: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') {
  try {
    // Регистрируем fontkit для поддержки шрифтов
    pdfDoc.registerFontkit(fontkit)
    
    // Сначала пробуем загрузить локальный кириллический шрифт
    try {
      const fontPath = MONTSERRAT_FONTS_PATHS[style]
      const fontResponse = await fetch(fontPath)
      
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer()
        console.log(`Успешно загружен кириллический шрифт Montserrat (${style})`)
        
        // Также загружаем латинский шрифт для лучшей поддержки цифр
        try {
          const latinFontPath = MONTSERRAT_LATIN_FONTS_PATHS[style]
          const latinFontResponse = await fetch(latinFontPath)
          
          if (latinFontResponse.ok) {
            console.log(`Успешно загружен латинский шрифт Montserrat (${style})`)
            // Если оба шрифта загружены успешно, используем кириллический
            return await pdfDoc.embedFont(fontBytes)
          }
        } catch (latinError) {
          console.warn(`Не удалось загрузить латинский шрифт Montserrat (${style}):`, latinError)
        }
        
        return await pdfDoc.embedFont(fontBytes)
      }
    } catch (localError) {
      console.warn(`Не удалось загрузить локальный шрифт Montserrat (${style}):`, localError)
      // Продолжаем выполнение и пробуем Google Fonts
    }
    
    // Пробуем загрузить шрифт с Google Fonts
    try {
      const googleFontUrl = GOOGLE_FONTS_URLS[style]
      const fontResponse = await fetch(googleFontUrl)
      
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer()
        console.log(`Успешно загружен шрифт с Google Fonts (${style})`)
        return await pdfDoc.embedFont(fontBytes)
      }
    } catch (googleError) {
      console.warn('Не удалось загрузить шрифт с Google Fonts:', googleError)
      // Продолжаем выполнение и используем стандартный шрифт
    }
    
    // Если ни один из вариантов не сработал, используем стандартный шрифт
    console.warn(`Используем стандартный шрифт вместо Montserrat (${style})`)
    return await pdfDoc.embedFont(StandardFonts.Helvetica)
    
  } catch (error) {
    console.error(`Критическая ошибка при загрузке шрифта (${style}):`, error)
    // В случае критической ошибки используем стандартный шрифт
    return await pdfDoc.embedFont(StandardFonts.Helvetica)
  }
} 