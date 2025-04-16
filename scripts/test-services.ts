/**
 * Скрипт для тестирования созданных сервисов
 * Запуск: npx ts-node scripts/test-services.ts
 */

import { soapService } from '../services/soap-service';
import { tokenService } from '../services/token-service';
import { sshService } from '../services/ssh-service';

// Функция для тестирования SOAP-сервиса
async function testSoapService() {
  console.log('\n=== Тестирование SOAP-сервиса ===');
  
  try {
    // 1. Получение списка районов
    console.log('\nЗапрос списка районов...');
    const districts = await soapService.getDistrictList();
    console.log('Получены данные о районах:', JSON.stringify(districts).substring(0, 200) + '...');
    
    // Проверим наличие районов и возьмем ID первого
    let districtId = '74'; // Челябинская область по умолчанию
    if (districts && districts.GetDistrictListResult && districts.GetDistrictListResult.Districts) {
      const districtList = districts.GetDistrictListResult.Districts.District;
      if (districtList && districtList.length > 0) {
        districtId = districtList[0].IdDistrict;
        console.log(`Выбран район с ID: ${districtId}`);
      }
    }
    
    // 2. Получение списка ЛПУ
    console.log('\nЗапрос списка ЛПУ...');
    const lpuList = await soapService.getLpuList(districtId);
    console.log('Получены данные о ЛПУ:', JSON.stringify(lpuList).substring(0, 200) + '...');
    
    // Выберем ID ЛПУ для запроса специальностей
    let lpuId = '1570'; // ID ЛПУ по умолчанию
    if (lpuList && lpuList.GetLPUListResult && lpuList.GetLPUListResult.LPUList) {
      const clinics = lpuList.GetLPUListResult.LPUList.Clinic;
      if (clinics && clinics.length > 0) {
        lpuId = clinics[0].IdLPU;
        console.log(`Выбрано ЛПУ с ID: ${lpuId}`);
      }
    }
    
    // 3. Получение списка специальностей
    console.log('\nЗапрос списка специальностей...');
    const specialities = await soapService.getSpecialityList(lpuId);
    console.log('Получены данные о специальностях:', JSON.stringify(specialities).substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('Ошибка при тестировании SOAP-сервиса:', error);
    return false;
  }
}

// Функция для тестирования сервиса токенов
async function testTokenService() {
  console.log('\n=== Тестирование сервиса токенов ===');
  
  try {
    // 1. Получение токена
    console.log('\nЗапрос токена...');
    const tokenResponse = await tokenService.getToken(true); // Принудительно новый токен
    console.log('Получен токен:', tokenResponse.token.substring(0, 20) + '...');
    console.log('Срок действия токена:', tokenResponse.expiresAt);
    
    // 2. Проверка валидности токена
    const isValid = tokenService.isTokenValid();
    console.log('Токен действителен:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Ошибка при тестировании сервиса токенов:', error);
    return false;
  }
}

// Функция для тестирования SSH-сервиса
async function testSshService() {
  console.log('\n=== Тестирование SSH-сервиса ===');
  
  try {
    // 1. Проверка uptime сервера
    console.log('\nЗапрос uptime сервера...');
    const uptime = await sshService.checkServerUptime();
    console.log('Результат uptime:', uptime.trim());
    
    // 2. Проверка использования диска
    console.log('\nЗапрос использования диска...');
    const diskUsage = await sshService.checkDiskUsage();
    console.log('Результат df -h:');
    console.log(diskUsage);
    
    // 3. Проверка использования памяти
    console.log('\nЗапрос использования памяти...');
    const memUsage = await sshService.checkMemoryUsage();
    console.log('Результат free -h:');
    console.log(memUsage);
    
    // 4. Получение списка процессов
    console.log('\nЗапрос списка процессов...');
    const processes = await sshService.getProcessList();
    console.log('Результат ps aux:');
    console.log(processes);
    
    return true;
  } catch (error) {
    console.error('Ошибка при тестировании SSH-сервиса:', error);
    return false;
  }
}

// Основная функция для запуска всех тестов
async function runAllTests() {
  console.log('Запуск тестирования всех сервисов...');
  
  try {
    // Тестируем сервис токенов
    const tokenResult = await testTokenService();
    console.log(`\nРезультат тестирования сервиса токенов: ${tokenResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
    
    // Тестируем SOAP-сервис
    const soapResult = await testSoapService();
    console.log(`\nРезультат тестирования SOAP-сервиса: ${soapResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
    
    // Тестируем SSH-сервис
    const sshResult = await testSshService();
    console.log(`\nРезультат тестирования SSH-сервиса: ${sshResult ? 'УСПЕШНО' : 'НЕУДАЧНО'}`);
    
    console.log('\n=== Тестирование завершено ===');
    
    // Общий результат всех тестов
    const allSuccess = tokenResult && soapResult && sshResult;
    console.log(`Общий результат: ${allSuccess ? 'ВСЕ ТЕСТЫ УСПЕШНЫ' : 'ЕСТЬ НЕУДАЧНЫЕ ТЕСТЫ'}`);
  } catch (error) {
    console.error('Критическая ошибка при выполнении тестов:', error);
  }
}

// Запускаем тестирование
runAllTests(); 