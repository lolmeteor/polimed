import { Appointment } from './appointment'

export interface UserProfile {
  id: string
  fullName: string
  firstName?: string
  lastName?: string
  patronymic?: string
  birthDate?: string
  age?: number
  phone?: string
  appointments?: Appointment[]
}

