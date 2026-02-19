export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent';
  createdAt: string;
}

export type Page = 'dashboard' | 'employees' | 'attendance';

export interface ValidationError {
  field: string;
  message: string;
}
