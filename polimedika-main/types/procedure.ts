/**
 * Интерфейс для типа процедуры
 * Используется для типизации списка процедур
 */
export interface ProcedureType {
  id: string
  name: string
  slug: string
  requiresReferral: boolean
}

/**
 * Группы процедур
 */
export enum ProcedureGroup {
  DIRECT_ACCESS = 'direct_access',     // Прямой доступ (без направления)
  REFERRAL_REQUIRED = 'referral_required', // Требуется направление
  REFERRAL_AVAILABLE = 'referral_available'  // По направлению доступно
} 