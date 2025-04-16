import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Загружаем переменные окружения
config();

const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'NODE_ENV',
  'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME',
  'MIS_WSDL_URL',
  'MIS_TOKEN_URL',
  'MIS_GUID',
  'DEFAULT_LPU_ID'
];

function checkEnvVars() {
  console.log('Проверка переменных окружения...');
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Отсутствуют необходимые переменные окружения:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  console.log('✅ Все необходимые переменные окружения настроены');
}

function checkEnvFiles() {
  console.log('Проверка файлов окружения...');
  
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production'
  ];

  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Файл ${file} существует`);
      
      // Проверяем содержимое файла
      const content = fs.readFileSync(filePath, 'utf8');
      const vars = content.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0]);
      
      console.log(`   Определены переменные: ${vars.join(', ')}`);
    } else {
      console.log(`❌ Файл ${file} не найден`);
    }
  });
}

function main() {
  console.log('=== Проверка конфигурации окружения ===\n');
  
  checkEnvFiles();
  console.log('');
  checkEnvVars();
  
  console.log('\n=== Проверка завершена ===');
}

main(); 