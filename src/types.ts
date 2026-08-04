export type Role = 'user' | 'admin';

export type TipoEdificacion =
  | 'Departamentos'
  | 'Escuela primaria'
  | 'Escuela secundaria'
  | 'Facultad'
  | 'Guardería'
  | 'Residencia de mayores'
  | 'Hospital'
  | 'Clínica'
  | 'Centro de salud'
  | 'Policía'
  | 'Persas'
  | 'Galería'
  | 'Paseo de compras'
  | 'Supermercado'
  | 'Estación de servicio'
  | 'Centro religioso'
  | 'Otro';

export const TIPOS_EDIFICACION_LIST: TipoEdificacion[] = [
  'Departamentos',
  'Escuela primaria',
  'Escuela secundaria',
  'Facultad',
  'Guardería',
  'Residencia de mayores',
  'Hospital',
  'Clínica',
  'Centro de salud',
  'Policía',
  'Persas',
  'Galería',
  'Paseo de compras',
  'Supermercado',
  'Estación de servicio',
  'Centro religioso',
  'Otro',
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  needsPasswordSetup?: boolean;
}

export interface TerritorioRecord {
  id: string;
  territorio: string;
  manzana: string;
  calle?: string;
  numeracion?: string;
  calleNumeracion: string;
  tipoEdificacion: TipoEdificacion;
  pisos?: string;
  cantidadDepartamentos?: string;
  porteriaVigilancia?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
}

export interface RecordFormData {
  territorio: string;
  manzana: string;
  calle?: string;
  numeracion?: string;
  calleNumeracion?: string;
  tipoEdificacion: TipoEdificacion;
  pisos?: string;
  cantidadDepartamentos?: string;
  porteriaVigilancia?: string;
  observaciones?: string;
}

export interface RecordFilterOptions {
  territorio?: string;
  tipoEdificacion?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StatsSummary {
  totalRecords: number;
  byTipoEdificacion: { name: string; count: number; percentage: number }[];
  byTerritorio: { name: string; count: number }[];
  totalUsers: number;
  recentRecordsCount: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  records: TerritorioRecord[];
  users: UserWithPassword[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
