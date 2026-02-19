"""
HRMS Lite - FastAPI Backend
A lightweight Human Resource Management System API

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Literal
from datetime import date, datetime
import sqlite3
import uuid
import os

# Initialize FastAPI app
app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight Human Resource Management System API",
    version="1.0.0"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = os.environ.get("DB_PATH", "hrms_lite.db")


# ==================== PYDANTIC MODELS ====================

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=100, description="Employee's full name")
    email: EmailStr = Field(..., description="Employee's email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")

    @validator('employee_id', 'full_name', 'department')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()


class Employee(EmployeeCreate):
    id: str
    created_at: str


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., description="Employee's internal ID")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    status: Literal["Present", "Absent"] = Field(..., description="Attendance status")

    @validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')


class AttendanceRecord(AttendanceCreate):
    id: str
    created_at: str


class EmployeeWithAttendance(Employee):
    present_days: int
    absent_days: int


class DashboardStats(BaseModel):
    total_employees: int
    total_departments: int
    present_today: int
    absent_today: int
    total_present: int
    total_absent: int
    departments: List[dict]


class ErrorResponse(BaseModel):
    detail: str


# ==================== DATABASE FUNCTIONS ====================

def get_db_connection():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create employees table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            employee_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Create attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id TEXT PRIMARY KEY,
            employee_id TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
            created_at TEXT NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
            UNIQUE(employee_id, date)
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)')
    
    conn.commit()
    conn.close()


# ==================== API ENDPOINTS ====================

@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "HRMS Lite API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


# -------------------- EMPLOYEE ENDPOINTS --------------------

@app.get("/api/employees", response_model=List[EmployeeWithAttendance], tags=["Employees"])
async def get_employees():
    """Get all employees with their attendance summary."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            e.*,
            COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) as present_days,
            COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) as absent_days
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employee_id
        GROUP BY e.id
        ORDER BY e.created_at DESC
    ''')
    
    employees = []
    for row in cursor.fetchall():
        employees.append({
            "id": row["id"],
            "employee_id": row["employee_id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "department": row["department"],
            "created_at": row["created_at"],
            "present_days": row["present_days"],
            "absent_days": row["absent_days"]
        })
    
    conn.close()
    return employees


@app.get("/api/employees/{employee_id}", response_model=EmployeeWithAttendance, tags=["Employees"])
async def get_employee(employee_id: str):
    """Get a specific employee by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            e.*,
            COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) as present_days,
            COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) as absent_days
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employee_id
        WHERE e.id = ?
        GROUP BY e.id
    ''', (employee_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return {
        "id": row["id"],
        "employee_id": row["employee_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "department": row["department"],
        "created_at": row["created_at"],
        "present_days": row["present_days"],
        "absent_days": row["absent_days"]
    }


@app.post("/api/employees", response_model=Employee, status_code=status.HTTP_201_CREATED, tags=["Employees"])
async def create_employee(employee: EmployeeCreate):
    """Create a new employee."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check for duplicate employee_id
    cursor.execute('SELECT id FROM employees WHERE employee_id = ?', (employee.employee_id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this Employee ID already exists"
        )
    
    # Check for duplicate email
    cursor.execute('SELECT id FROM employees WHERE LOWER(email) = LOWER(?)', (employee.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this email already exists"
        )
    
    # Create new employee
    new_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO employees (id, employee_id, full_name, email, department, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (new_id, employee.employee_id, employee.full_name, employee.email.lower(), 
          employee.department, created_at))
    
    conn.commit()
    conn.close()
    
    return {
        "id": new_id,
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "email": employee.email.lower(),
        "department": employee.department,
        "created_at": created_at
    }


@app.delete("/api/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Employees"])
async def delete_employee(employee_id: str):
    """Delete an employee and their attendance records."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if employee exists
    cursor.execute('SELECT id FROM employees WHERE id = ?', (employee_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Delete attendance records first
    cursor.execute('DELETE FROM attendance WHERE employee_id = ?', (employee_id,))
    
    # Delete employee
    cursor.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
    
    conn.commit()
    conn.close()
    
    return None


# -------------------- ATTENDANCE ENDPOINTS --------------------

@app.get("/api/attendance", response_model=List[AttendanceRecord], tags=["Attendance"])
async def get_attendance(
    employee_id: Optional[str] = None,
    date: Optional[str] = None
):
    """Get attendance records with optional filters."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM attendance WHERE 1=1'
    params = []
    
    if employee_id:
        query += ' AND employee_id = ?'
        params.append(employee_id)
    
    if date:
        query += ' AND date = ?'
        params.append(date)
    
    query += ' ORDER BY date DESC, created_at DESC'
    
    cursor.execute(query, params)
    
    records = []
    for row in cursor.fetchall():
        records.append({
            "id": row["id"],
            "employee_id": row["employee_id"],
            "date": row["date"],
            "status": row["status"],
            "created_at": row["created_at"]
        })
    
    conn.close()
    return records


@app.post("/api/attendance", response_model=AttendanceRecord, status_code=status.HTTP_201_CREATED, tags=["Attendance"])
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee. Updates if record exists for the same date."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify employee exists
    cursor.execute('SELECT id FROM employees WHERE id = ?', (attendance.employee_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Check if attendance already exists for this date
    cursor.execute(
        'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
        (attendance.employee_id, attendance.date)
    )
    existing = cursor.fetchone()
    
    created_at = datetime.now().isoformat()
    
    if existing:
        # Update existing record
        cursor.execute(
            'UPDATE attendance SET status = ?, created_at = ? WHERE id = ?',
            (attendance.status, created_at, existing["id"])
        )
        record_id = existing["id"]
    else:
        # Create new record
        record_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO attendance (id, employee_id, date, status, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (record_id, attendance.employee_id, attendance.date, attendance.status, created_at))
    
    conn.commit()
    conn.close()
    
    return {
        "id": record_id,
        "employee_id": attendance.employee_id,
        "date": attendance.date,
        "status": attendance.status,
        "created_at": created_at
    }


@app.delete("/api/attendance/{record_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Attendance"])
async def delete_attendance(record_id: str):
    """Delete an attendance record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id FROM attendance WHERE id = ?', (record_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    cursor.execute('DELETE FROM attendance WHERE id = ?', (record_id,))
    conn.commit()
    conn.close()
    
    return None


# -------------------- DASHBOARD ENDPOINTS --------------------

@app.get("/api/dashboard", response_model=DashboardStats, tags=["Dashboard"])
async def get_dashboard_stats():
    """Get dashboard statistics."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    today = date.today().isoformat()
    
    # Total employees
    cursor.execute('SELECT COUNT(*) as count FROM employees')
    total_employees = cursor.fetchone()["count"]
    
    # Total departments
    cursor.execute('SELECT COUNT(DISTINCT department) as count FROM employees')
    total_departments = cursor.fetchone()["count"]
    
    # Present today
    cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"', (today,))
    present_today = cursor.fetchone()["count"]
    
    # Absent today
    cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Absent"', (today,))
    absent_today = cursor.fetchone()["count"]
    
    # Total present
    cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE status = "Present"')
    total_present = cursor.fetchone()["count"]
    
    # Total absent
    cursor.execute('SELECT COUNT(*) as count FROM attendance WHERE status = "Absent"')
    total_absent = cursor.fetchone()["count"]
    
    # Department distribution
    cursor.execute('''
        SELECT department, COUNT(*) as count 
        FROM employees 
        GROUP BY department 
        ORDER BY count DESC
    ''')
    departments = [{"name": row["department"], "count": row["count"]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "present_today": present_today,
        "absent_today": absent_today,
        "total_present": total_present,
        "total_absent": total_absent,
        "departments": departments
    }


# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
