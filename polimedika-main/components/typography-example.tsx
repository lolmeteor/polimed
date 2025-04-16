import React from 'react';
import Typography, { processTypography } from './ui/typography';

const examples = [
  'Мы идем в кино на новый фильм.',
  'Пациент записался к врачу на прием в четверг.',
  'Услуги предоставляются ООО Медицина для всех и ЗАО Здоровье.',
  'Пациент весит 70 кг при росте 180 см.',
  'Дозировка составляет 5 мл препарата и 10 мг активного вещества.',
  'Если вы хотите записаться, вам нужно заполнить форму и подтвердить согласие.',
  'Наш специалист проведет консультацию и подберет для вас оптимальный план лечения.',
  'Для оформления направления необходимо обратиться к лечащему врачу.',
  'Результаты анализов будут готовы через 2 дня, их можно получить в регистратуре или по электронной почте.',
  'При возникновении побочных эффектов или ухудшении состояния необходимо немедленно обратиться к врачу.'
];

export default function TypographyExample() {
  return (
    <div className="p-4 space-y-8">
      <Typography variant="h2">Примеры использования типографики</Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <Typography variant="h3" className="mb-4">Исходный текст</Typography>
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div key={`original-${index}`} className="border-b pb-2">
                <p className="text-gray-700 font-mono text-sm">{example}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <Typography variant="h3" className="mb-4">Обработанный текст</Typography>
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div key={`processed-${index}`} className="border-b pb-2">
                <Typography className="font-mono text-sm">{example}</Typography>
                <p className="text-xs text-gray-500 mt-1">
                  Код: {JSON.stringify(processTypography(example)).replace(/\\u00A0/g, '<NBSP>')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <Typography variant="h3" className="mb-4">Визуальная демонстрация</Typography>
        <p className="mb-2">Демонстрация работы при различной ширине контейнера:</p>
        
        <div className="space-y-4">
          {[300, 400, 500].map(width => (
            <div key={width} className="border rounded overflow-hidden">
              <div className="bg-gray-200 p-2 font-mono text-sm">Ширина: {width}px</div>
              <div className="p-4" style={{ width: `${width}px`, resize: 'horizontal', overflow: 'auto' }}>
                <Typography>
                  Для оформления направления в ГБУЗ Поликлиника №1 необходимо обратиться к лечащему врачу или заполнить форму на сайте. При наличии острых симптомов или ухудшении состояния следует немедленно вызвать скорую помощь по телефону 103.
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 