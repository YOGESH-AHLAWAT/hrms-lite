/**
 * API Service Layer for HRMS Lite
 * 
 * This module provides functions to communicate with the Python FastAPI backend.
 * Set the API_BASE_URL environment variable to point to your deployed backend.
 * 
 * For local development: http://localhost:8000
 * For production: Set VITE_API_URL in your environment
 */

import { Employee, AttendanceRecord } from '@/types';

// API Base URL - defaults to localStorage simulation if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Check if we're using a real API or localStorage simulation
const USE_API = !!API_BASE_URL;

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ==================== EMPLOYEE API ====================

export interface EmployeeWithAttendance extends Employee {
  present_days: number;
  absent_days: number;
}

export interface CreateEmployeeData {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export async function fetchEmployees(): Promise<EmployeeWithAttendance[]> {
  if (!USE_API) {
    // Fallback to localStorage
    const { getEmployees, getPresentDaysCount, getAbsentDaysCount } = await import('./storage');
    const employees = getEmployees();
    return employees.map(emp => ({
      ...emp,
      present_days: getPresentDaysCount(emp.id),
      absent_days: getAbsentDaysCount(emp.id),
    }));
  }
  
  const data = await apiRequest<any[]>('/api/employees');
  return data.map(emp => ({
    id: emp.id,
    employeeId: emp.employee_id,
    fullName: emp.full_name,
    email: emp.email,
    department: emp.department,
    createdAt: emp.created_at,
    present_days: emp.present_days,
    absent_days: emp.absent_days,
  }));
}

export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  if (!USE_API) {
    const { addEmployee } = await import('./storage');
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      employeeId: data.employee_id,
      fullName: data.full_name,
      email: data.email.toLowerCase(),
      department: data.department,
      createdAt: new Date().toISOString(),
    };
    addEmployee(newEmployee);
    return newEmployee;
  }
  
  const emp = await apiRequest<any>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return {
    id: emp.id,
    employeeId: emp.employee_id,
    fullName: emp.full_name,
    email: emp.email,
    department: emp.department,
    createdAt: emp.created_at,
  };
}

export async function removeEmployee(id: string): Promise<void> {
  if (!USE_API) {
    const { deleteEmployee } = await import('./storage');
    deleteEmployee(id);
    return;
  }
  
  await apiRequest(`/api/employees/${id}`, {
    method: 'DELETE',
  });
}

// ==================== ATTENDANCE API ====================

export interface CreateAttendanceData {
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export async function fetchAttendance(
  employeeId?: string,
  date?: string
): Promise<AttendanceRecord[]> {
  if (!USE_API) {
    const { getAttendanceRecords } = await import('./storage');
    let records = getAttendanceRecords();
    if (employeeId) {
      records = records.filter(r => r.employeeId === employeeId);
    }
    if (date) {
      records = records.filter(r => r.date === date);
    }
    return records;
  }
  
  let endpoint = '/api/attendance';
  const params = new URLSearchParams();
  if (employeeId) params.append('employee_id', employeeId);
  if (date) params.append('date', date);
  if (params.toString()) endpoint += `?${params.toString()}`;
  
  const data = await apiRequest<any[]>(endpoint);
  return data.map(rec => ({
    id: rec.id,
    employeeId: rec.employee_id,
    date: rec.date,
    status: rec.status,
    createdAt: rec.created_at,
  }));
}

export async function markAttendance(data: CreateAttendanceData): Promise<AttendanceRecord> {
  if (!USE_API) {
    const { addAttendanceRecord } = await import('./storage');
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId: data.employee_id,
      date: data.date,
      status: data.status,
      createdAt: new Date().toISOString(),
    };
    addAttendanceRecord(newRecord);
    return newRecord;
  }
  
  const rec = await apiRequest<any>('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return {
    id: rec.id,
    employeeId: rec.employee_id,
    date: rec.date,
    status: rec.status,
    createdAt: rec.created_at,
  };
}

// ==================== DASHBOARD API ====================

export interface DashboardStats {
  total_employees: number;
  total_departments: number;
  present_today: number;
  absent_today: number;
  total_present: number;
  total_absent: number;
  departments: { name: string; count: number }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!USE_API) {
    const { getEmployees, getAttendanceRecords } = await import('./storage');
    const employees = getEmployees();
    const attendance = getAttendanceRecords();
    const todayString = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === todayString);
    
    const departments = [...new Set(employees.map(e => e.department))];
    const departmentCounts = departments.map(dept => ({
      name: dept,
      count: employees.filter(e => e.department === dept).length,
    }));
    
    return {
      total_employees: employees.length,
      total_departments: departments.length,
      present_today: todayAttendance.filter(a => a.status === 'Present').length,
      absent_today: todayAttendance.filter(a => a.status === 'Absent').length,
      total_present: attendance.filter(a => a.status === 'Present').length,
      total_absent: attendance.filter(a => a.status === 'Absent').length,
      departments: departmentCounts,
    };
  }
  
  return apiRequest<DashboardStats>('/api/dashboard');
}
