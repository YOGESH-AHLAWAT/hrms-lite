import { ValidationError } from '@/types';
import { getEmployeeByEmployeeId, getEmployees } from './storage';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmployeeForm(
  employeeId: string,
  fullName: string,
  email: string,
  department: string,
  editingId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required field validations
  if (!employeeId.trim()) {
    errors.push({ field: 'employeeId', message: 'Employee ID is required' });
  }

  if (!fullName.trim()) {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
  }

  if (!email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!department.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  // Duplicate employee ID check
  const existingEmployee = getEmployeeByEmployeeId(employeeId.trim());
  if (existingEmployee && existingEmployee.id !== editingId) {
    errors.push({ field: 'employeeId', message: 'An employee with this ID already exists' });
  }

  // Duplicate email check
  const employees = getEmployees();
  const emailExists = employees.find(
    emp => emp.email.toLowerCase() === email.toLowerCase() && emp.id !== editingId
  );
  if (emailExists) {
    errors.push({ field: 'email', message: 'An employee with this email already exists' });
  }

  return errors;
}

export function validateAttendanceForm(
  employeeId: string,
  date: string,
  status: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!employeeId) {
    errors.push({ field: 'employeeId', message: 'Please select an employee' });
  }

  if (!date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }

  if (!status) {
    errors.push({ field: 'status', message: 'Status is required' });
  }

  return errors;
}
