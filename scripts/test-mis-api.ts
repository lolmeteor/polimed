import { MisApiService } from '../services/mis-api-service';
import { MisDistrict, MisLPU, MisSpeciality } from '../types/mis-api';

async function testMisConnection() {
  console.log('Начинаем тестирование соединения с API МИС...');
  
  try {
    // Шаг 1: Получение списка районов
    console.log('Попытка получения списка районов...');
    const districts = await MisApiService.getDistrictList();
    console.log('✅ Список районов получен успешно');
    
    if (districts.Districts?.District) {
      // Преобразуем в массив, так как API может вернуть как массив, так и единичный объект
      const districtArray = Array.isArray(districts.Districts.District) 
        ? districts.Districts.District 
        : [districts.Districts.District];
      
      console.log(`Количество районов: ${districtArray.length}`);
      
      if (districtArray.length > 0) {
        const firstDistrict = districtArray[0] as MisDistrict;
        console.log(`Первый район: ID=${firstDistrict.IdDistrict}, Название=${firstDistrict.DistrictName}`);
        
        // Шаг 2: Получение списка ЛПУ для первого района
        console.log(`\nПопытка получения списка ЛПУ для района ID=${firstDistrict.IdDistrict}...`);
        const lpuList = await MisApiService.getLPUList(firstDistrict.IdDistrict.toString());
        console.log('✅ Список ЛПУ получен успешно');
        
        if (lpuList.LPUs?.LPU) {
          // Преобразуем в массив, так как API может вернуть как массив, так и единичный объект
          const lpuArray = Array.isArray(lpuList.LPUs.LPU) 
            ? lpuList.LPUs.LPU 
            : [lpuList.LPUs.LPU];
          
          console.log(`Количество ЛПУ: ${lpuArray.length}`);
          
          if (lpuArray.length > 0) {
            const firstLpu = lpuArray[0] as MisLPU;
            console.log(`Первое ЛПУ: ID=${firstLpu.IdLPU}, Название=${firstLpu.LPUName}`);
            
            // Шаг 3: Получение списка специальностей для первого ЛПУ
            console.log(`\nПопытка получения списка специальностей для ЛПУ ID=${firstLpu.IdLPU}...`);
            const specialities = await MisApiService.getSpecialityList(firstLpu.IdLPU.toString());
            console.log('✅ Список специальностей получен успешно');
            
            if (specialities.Specialities?.Speciality) {
              // Преобразуем в массив, так как API может вернуть как массив, так и единичный объект
              const specialityArray = Array.isArray(specialities.Specialities.Speciality) 
                ? specialities.Specialities.Speciality 
                : [specialities.Specialities.Speciality];
                
              console.log(`Количество специальностей: ${specialityArray.length}`);
            } else {
              console.log('Список специальностей пуст');
            }
          }
        } else {
          console.log('Список ЛПУ пуст');
        }
      }
    } else {
      console.log('Список районов пуст');
    }
    
    console.log('\n🎉 Тестирование API МИС завершено успешно!');
    return true;
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании API МИС:');
    console.error(error);
    return false;
  }
}

// Запуск тестирования
testMisConnection().then(success => {
  if (!success) {
    console.log('\nРекомендации по устранению проблем:');
    console.log('1. Проверьте правильность URL сервисов в переменных окружения');
    console.log('2. Убедитесь, что GUID правильный и активен в системе МИС');
    console.log('3. Проверьте, доступны ли сервера МИС из вашей сети');
    console.log('4. Проверьте логи сервера МИС на наличие ошибок аутентификации');
  }
  
  process.exit(success ? 0 : 1);
}); 