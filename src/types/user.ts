
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isApproved: boolean;
  faceData?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Karyawan' | 'HR' | 'IT' | 'Admin' | 'Super Admin';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  status: 'Present' | 'Late' | 'Absent';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface faceRegisterData {
  user_id: string,
  face_encoding: string,
  face_image_url: string, // Dalam implementasi nyata, upload ke cloud storage
  confidence_score: any, // Simulasi confidence score
  is_active: boolean
}
