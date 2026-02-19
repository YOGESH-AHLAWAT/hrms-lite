import { Employee, AttendanceRecord } from '@/types';

const EMPLOYEES_KEY = 'hrms_employees';
const ATTENDANCE_KEY = 'hrms_attendance';

// Employee Operations
export function getEmployees(): Employee[] {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function addEmployee(employee: Employee): void {
  const employees = getEmployees();
  employees.push(employee);
  saveEmployees(employees);
}

export function deleteEmployee(id: string): void {
  const employees = getEmployees().filter(emp => emp.id !== id);
  saveEmployees(employees);
  
  // Also delete attendance records for this employee
  const attendance = getAttendanceRecords().filter(rec => rec.employeeId !== id);
  saveAttendanceRecords(attendance);
}

export function getEmployeeById(id: string): Employee | undefined {
  return getEmployees().find(emp => emp.id === id);
}

export function getEmployeeByEmployeeId(employeeId: string): Employee | undefined {
  return getEmployees().find(emp => emp.employeeId === employeeId);
}

// Attendance Operations
export function getAttendanceRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function addAttendanceRecord(record: AttendanceRecord): void {
  const records = getAttendanceRecords();
  // Check if attendance already marked for this employee on this date
  const existingIndex = records.findIndex(
    r => r.employeeId === record.employeeId && r.date === record.date
  );
  
  if (existingIndex !== -1) {
    // Update existing record
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  saveAttendanceRecords(records);
}

export function getAttendanceByEmployee(employeeId: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(rec => rec.employeeId === employeeId);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return getAttendanceRecords().filter(rec => rec.date === date);
}

export function getPresentDaysCount(employeeId: string): number {
  return getAttendanceRecords().filter(
    rec => rec.employeeId === employeeId && rec.status === 'Present'
  ).length;
}

export function getAbsentDaysCount(employeeId: string): number {
  return getAttendanceRecords().filter(
    rec => rec.employeeId === employeeId && rec.status === 'Absent'
  ).length;
}
