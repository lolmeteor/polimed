interface ClinicAddress {
  shortAddress: string;  // Короткий адрес для слотов записи
  fullAddress: string;   // Полный адрес для карт
  description: string;   // Описание услуг
}

export const CLINIC_ADDRESSES: ClinicAddress[] = [
  {
    shortAddress: 'ул. Братьев Кашириных, д.130а',
    fullAddress: '454003, г. Челябинск, ул. Братьев Кашириных, д.130а',
    description: 'Консультативно-диагностический центр: прием терапевтов, врачей-специалистов, УЗИ, ФГДС, рентген, женская консультация, дневной стационар'
  },
  {
    shortAddress: 'ул. Полянка, д.2а',
    fullAddress: '454100, г. Челябинск, ул. Полянка, д.2а',
    description: 'Центр терапевтического приема, прием врачей-специалистов, УЗИ, женская консультация, дневной стационар'
  },
  {
    shortAddress: 'ул. Академика Королева, д.15',
    fullAddress: '454004, г. Челябинск, ул. Академика Королева, д.15',
    description: 'Центр терапевтического приема, прием врачей-специалистов, женская консультация'
  },
  {
    shortAddress: 'ул. 40-летия Победы, д.52',
    fullAddress: '454128, г. Челябинск, ул. 40-летия Победы, д.52',
    description: 'Центр терапевтического приема, прием врачей-специалистов'
  },
  {
    shortAddress: 'ул. Татищева, д. 256, ЖК «Ньютон»',
    fullAddress: '454003, г. Челябинск, ул. Татищева, д. 256, ЖК «Ньютон»',
    description: 'Центр терапевтического приема, прием врачей-специалистов, УЗИ, женская консультация, дневной стационар'
  },
  {
    shortAddress: 'п. Западный, ЖК «Твоя Привилегия», ул. Спортивная, д.13',
    fullAddress: '456518, Челябинская обл. п. Западный, ЖК «Твоя Привилегия», ул. Спортивная, д.13',
    description: 'Консультативно-диагностический центр: прием терапевтов, прием педиатров, врачей-специалистов, УЗИ, рентген, женская консультация, дневной стационар'
  }
];

// Экспортируем только короткие адреса для обратной совместимости
export const clinicAddresses = CLINIC_ADDRESSES.map(addr => addr.shortAddress);

/**
 * Список адресов клиник для тестовых данных
 */
export const clinicAddressesForTests = [
  'ул. Братьев Кашириных, д. 130а',
  'ул. Спортивная, д. 13',
  'пр. Ленина, д. 85'
] 