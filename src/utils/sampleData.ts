import { Employee, AttendanceRecord } from '@/types';
import { getEmployees, saveEmployees, saveAttendanceRecords } from './storage';

const sampleEmployees: Omit<Employee, 'id' | 'createdAt'>[] = [
  { employeeId: 'EMP001', fullName: 'John Smith', email: 'john.smith@company.com', department: 'Engineering' },
  { employeeId: 'EMP002', fullName: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Marketing' },
  { employeeId: 'EMP003', fullName: 'Michael Chen', email: 'michael.chen@company.com', department: 'Engineering' },
  { employeeId: 'EMP004', fullName: 'Emily Davis', email: 'emily.davis@company.com', department: 'Human Resources' },
  { employeeId: 'EMP005', fullName: 'David Wilson', email: 'david.wilson@company.com', department: 'Sales' },
  { employeeId: 'EMP006', fullName: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Finance' },
  { employeeId: 'EMP007', fullName: 'James Taylor', email: 'james.taylor@company.com', department: 'Engineering' },
  { employeeId: 'EMP008', fullName: 'Jennifer Martinez', email: 'jennifer.martinez@company.com', department: 'Product' },
];

export function initializeSampleData(): void {
  // Only initialize if no data exists
  if (getEmployees().length > 0) {
    return;
  }

  // Create employees with IDs
  const employees: Employee[] = sampleEmployees.map((emp, index) => ({
    ...emp,
    id: `emp-${Date.now()}-${index}`,
    createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
  }));

  saveEmployees(employees);

  // Generate some sample attendance records
  const today = new Date();
  const attendanceRecords: AttendanceRecord[] = [];

  // Generate attendance for last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateString = date.toISOString().split('T')[0];

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    employees.forEach((emp, empIndex) => {
      // Random attendance (80% present rate)
      const isPresent = Math.random() > 0.2;
      
      attendanceRecords.push({
        id: `att-${Date.now()}-${dayOffset}-${empIndex}`,
        employeeId: emp.id,
        date: dateString,
        status: isPresent ? 'Present' : 'Absent',
        createdAt: new Date().toISOString(),
      });
    });
  }

  saveAttendanceRecords(attendanceRecords);
}

export function clearAllData(): void {
  localStorage.removeItem('hrms_employees');
  localStorage.removeItem('hrms_attendance');
}
