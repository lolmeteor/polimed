/**
 * Сервис для проверки наличия направлений на процедуры и к специалистам
 * В будущем будет интегрирован с API клиники
 */

// Типы направлений
export type ReferralType = 'specialist' | 'procedure';

// Интерфейс для записи о направлении
interface Referral {
  userId: string;
  type: ReferralType;
  slug: string; // slug специалиста или процедуры
  expiresAt?: Date; // срок действия направления, если есть
}

// Специалисты, доступные без направления
export const directAccessSpecialists = [
  'surgeon', 'gynecologist', 'otolaryngologist', 'ophthalmologist'
];

// Процедуры, доступные без направления
export const directAccessProcedures = [
  'blood-sampling', 'vaccination', 'fog'
];

// Моковая база данных направлений
const mockReferrals: Referral[] = [
  // Направления к специалистам
  { userId: 'user1', type: 'specialist', slug: 'cardiologist' },
  { userId: 'user1', type: 'specialist', slug: 'neurologist' },
  { userId: 'user2', type: 'specialist', slug: 'endocrinologist' },
  
  // Направления на процедуры
  { userId: 'user1', type: 'procedure', slug: 'xray' },
  { userId: 'user1', type: 'procedure', slug: 'abdominal-ultrasound' },
  { userId: 'user1', type: 'procedure', slug: 'fgds' },
];

export class ReferralService {
  /**
   * Проверяет наличие направления
   * @param userId - ID пользователя
   * @param type - тип (специалист или процедура)
   * @param slug - идентификатор специалиста или процедуры
   * @returns true, если доступ разрешен
   */
  static async checkReferral(userId: string, type: ReferralType, slug: string): Promise<boolean> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Проверка на прямой доступ (без направления)
    if (type === 'specialist' && directAccessSpecialists.includes(slug)) {
      return true;
    }
    
    if (type === 'procedure' && directAccessProcedures.includes(slug)) {
      return true;
    }
    
    // Для демо-версии: пользователь user1 будет иметь все нужные направления
    if (userId === 'user1') {
      return true;
    }
    
    // Поиск направления в базе
    const hasReferral = mockReferrals.some(ref => 
      ref.userId === userId && 
      ref.type === type && 
      ref.slug === slug && 
      (!ref.expiresAt || new Date() < ref.expiresAt)
    );
    
    return hasReferral;
  }
  
  /**
   * Получает список всех доступных специалистов для пользователя
   * @param userId - ID пользователя
   * @returns массив слагов доступных специалистов
   */
  static async getAvailableSpecialists(userId: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Специалисты, доступные напрямую
    const available = [...directAccessSpecialists];
    
    // Для демо-версии: пользователь user1 будет иметь все направления
    if (userId === 'user1') {
      return [
        ...available,
        'cardiologist', 'neurologist', 'endocrinologist', 'gastroenterologist',
        'urologist', 'rheumatologist', 'pulmonologist'
      ];
    }
    
    // Добавляем специалистов с направлениями
    const referrals = mockReferrals.filter(ref => 
      ref.userId === userId && 
      ref.type === 'specialist' && 
      (!ref.expiresAt || new Date() < ref.expiresAt)
    );
    
    available.push(...referrals.map(ref => ref.slug));
    
    return available;
  }
  
  /**
   * Получает список всех доступных процедур для пользователя
   * @param userId - ID пользователя
   * @returns массив слагов доступных процедур
   */
  static async getAvailableProcedures(userId: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Процедуры, доступные напрямую
    const available = [...directAccessProcedures];
    
    // Для демо-версии: пользователь user1 будет иметь все направления
    if (userId === 'user1') {
      return [
        ...available,
        'xray', 'abdominal-ultrasound', 'pelvic-ultrasound', 'fibrocolonoscopy',
        'mammography', 'holter', 'smad', 'fgds', 'heart-ultrasound',
        'neck-vessels-ultrasound', 'truzi', 'external-respiration', 'ktg',
        'ekg', 'injections', 'day-hospital', 'leg-vessels-ultrasound'
      ];
    }
    
    // Добавляем процедуры с направлениями
    const referrals = mockReferrals.filter(ref => 
      ref.userId === userId && 
      ref.type === 'procedure' && 
      (!ref.expiresAt || new Date() < ref.expiresAt)
    );
    
    available.push(...referrals.map(ref => ref.slug));
    
    return available;
  }
} 