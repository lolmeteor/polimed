/**
 * Базовый интерфейс для ответов API МИС
 */
export interface MisApiResponse {
  Success: boolean;
  ErrorList?: {
    Error: Array<{
      ErrorCode: string;
      ErrorDescription: string;
    }> | {
      ErrorCode: string;
      ErrorDescription: string;
    };
  };
}

/**
 * Интерфейс для района
 */
export interface MisDistrict {
  IdDistrict: string;
  DistrictName: string;
}

/**
 * Интерфейс для ответа со списком районов
 */
export interface MisDistrictListResponse extends MisApiResponse {
  Districts?: {
    District: MisDistrict[] | MisDistrict;
  };
}

/**
 * Интерфейс для ЛПУ
 */
export interface MisLPU {
  IdLPU: string;
  LPUName: string;
  LPUPhone?: string;
  LPUAddress?: string;
}

/**
 * Интерфейс для ответа со списком ЛПУ
 */
export interface MisLPUListResponse extends MisApiResponse {
  LPUs?: {
    LPU: MisLPU[] | MisLPU;
  };
}

/**
 * Интерфейс для специальности
 */
export interface MisSpeciality {
  IdSpeciality: string;
  SpecialityName: string;
}

/**
 * Интерфейс для ответа со списком специальностей
 */
export interface MisSpecialityListResponse extends MisApiResponse {
  Specialities?: {
    Speciality: MisSpeciality[] | MisSpeciality;
  };
}

/**
 * Интерфейс для врача
 */
export interface MisDoctor {
  IdDoc: string;
  DocName: string;
  DocPhone?: string;
  DocInfo?: string;
}

/**
 * Интерфейс для ответа со списком врачей
 */
export interface MisDoctorListResponse extends MisApiResponse {
  Doctors?: {
    Doctor: MisDoctor[] | MisDoctor;
  };
}

/**
 * Интерфейс для доступной даты
 */
export interface MisDate {
  Date: string; // В формате YYYY-MM-DD
}

/**
 * Интерфейс для ответа с доступными датами
 */
export interface MisAvailableDatesResponse extends MisApiResponse {
  Dates?: {
    Date: MisDate[] | MisDate | string[];
  };
}

/**
 * Интерфейс для доступного времени записи
 */
export interface MisAppointment {
  IdAppointment: string;
  VisitStart: string; // В формате /Date(timestamp)/
  VisitEnd: string; // В формате /Date(timestamp)/
  DocName?: string;
  RoomNumber?: string;
}

/**
 * Интерфейс для ответа с доступными записями
 */
export interface MisAvailableAppointmentsResponse extends MisApiResponse {
  Appointments?: {
    Appointment: MisAppointment[] | MisAppointment;
  };
}

/**
 * Интерфейс для результата создания записи
 */
export interface MisSetAppointmentResponse extends MisApiResponse {
  IdPat?: string;
  IdAppointment?: string;
}

/**
 * Интерфейс для пациента
 */
export interface MisPatient {
  IdPat: string;
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  BirthDate?: string;
  Phone?: string;
  CellPhone?: string;
  Email?: string;
  InsuranceNumber?: string;
  DocumentNumber?: string;
}

/**
 * Интерфейс для результата поиска пациентов
 */
export interface MisSearchPatientResponse extends MisApiResponse {
  Patients?: {
    Patient: MisPatient[] | MisPatient;
  };
  IdPat?: string;
  IdHistory?: string;
} 