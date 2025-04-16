const fs = require('fs');
const path = require('path');

// Пути к шрифтам
const fontFiles = [
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-cyrillic-400-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-regular.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-cyrillic-500-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-medium.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-cyrillic-600-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-semibold.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-cyrillic-700-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-bold.woff2')
  },
  // Добавляем также латинские шрифты для лучшей поддержки цифр
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-latin-regular.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-latin-500-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-latin-medium.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-latin-semibold.woff2')
  },
  {
    src: path.join(__dirname, '../node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'),
    dest: path.join(__dirname, '../public/fonts/montserrat-latin-bold.woff2')
  }
];

// Создаем директорию, если она не существует
const fontsDir = path.join(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log('Создана директория:', fontsDir);
}

// Копируем файлы
fontFiles.forEach(file => {
  try {
    fs.copyFileSync(file.src, file.dest);
    console.log(`Скопирован файл: ${file.src} -> ${file.dest}`);
  } catch (error) {
    console.error(`Ошибка при копировании файла ${file.src}:`, error);
  }
});

console.log('Копирование шрифтов завершено!'); 