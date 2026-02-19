# HRMS Lite - Human Resource Management System

A lightweight, full-stack Human Resource Management System built with **React** (Frontend) and **Python FastAPI** (Backend).

![HRMS Lite Dashboard](https://hrms-lite-three-gamma.vercel.app/?_vercel_share=FoIPFM9ZBtWwd8NAY6SpNsqD5PmTMmeZ)

## 🚀 Features

### Employee Management
- ✅ Add new employees with Employee ID, Full Name, Email, and Department
- ✅ View all employees in a searchable, filterable table
- ✅ Delete employees with confirmation
- ✅ Duplicate handling (Employee ID and Email)
- ✅ Form validation with meaningful error messages

### Attendance Management
- ✅ Mark daily attendance (Present/Absent) for employees
- ✅ View attendance records grouped by date or employee
- ✅ Filter attendance by date and/or employee
- ✅ Display total present/absent days per employee

### Dashboard (Bonus)
- ✅ Total employees and department count
- ✅ Present/Absent today statistics
- ✅ Department distribution visualization
- ✅ Overall attendance rate chart
- ✅ Recent employees table

### UI/UX
- ✅ Clean, professional, production-ready design
- ✅ Responsive layout (mobile-friendly)
- ✅ Loading states, empty states, error handling
- ✅ Toast notifications for actions
- ✅ Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite
- **Validation**: Pydantic
- **Server**: Uvicorn

## 📁 Project Structure

```
hrms-lite/
├── backend/                 # Python FastAPI Backend
│   ├── main.py             # Main API application
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile           # Deployment config
│   ├── runtime.txt        # Python version
│   ├── render.yaml        # Render deployment config
│   └── README.md          # Backend documentation
│
├── src/                    # React Frontend
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── EmployeeList.tsx
│   │   ├── AddEmployeeModal.tsx
│   │   ├── AttendanceManagement.tsx
│   │   ├── AttendanceModal.tsx
│   │   └── Sidebar.tsx
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions
│   │   ├── api.ts         # API service layer
│   │   ├── storage.ts     # localStorage operations
│   │   └── validation.ts  # Form validation
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
│
├── index.html             # HTML template
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── README.md              # This file
```

## 🏃‍♂️ Running Locally

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file to connect to the backend:
```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Without Backend (Demo Mode)

The frontend can run standalone using localStorage for data persistence:

```bash
npm install
npm run dev
```

Sample data will be automatically generated on first load.

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
4. Add a persistent disk mounted at `/data`
5. Set environment variable: `DB_PATH=/data/hrms_lite.db`

### Frontend Deployment (Vercel/Netlify)

1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.com`

## 📡 API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees with attendance summary |
| GET | `/api/employees/{id}` | Get employee by ID |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance records |
| GET | `/api/attendance?employee_id={id}` | Filter by employee |
| GET | `/api/attendance?date={date}` | Filter by date (YYYY-MM-DD) |
| POST | `/api/attendance` | Mark attendance |
| DELETE | `/api/attendance/{id}` | Delete attendance record |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## 📝 API Request/Response Examples

### Create Employee

**Request:**
```json
POST /api/employees
Content-Type: application/json

{
    "employee_id": "EMP001",
    "full_name": "John Smith",
    "email": "john.smith@company.com",
    "department": "Engineering"
}
```

**Response (201 Created):**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_id": "EMP001",
    "full_name": "John Smith",
    "email": "john.smith@company.com",
    "department": "Engineering",
    "created_at": "2024-01-15T10:30:00.000000"
}
```

### Mark Attendance

**Request:**
```json
POST /api/attendance
Content-Type: application/json

{
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-01-15",
    "status": "Present"
}
```

**Response (201 Created):**
```json
{
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-01-15",
    "status": "Present",
    "created_at": "2024-01-15T10:30:00.000000"
}
```

## ⚠️ Assumptions & Limitations

1. **Single Admin User**: No authentication/authorization implemented (as per requirements)
2. **No Leave Management**: Out of scope
3. **No Payroll**: Out of scope
4. **SQLite Database**: Suitable for demo/small-scale; consider PostgreSQL for production
5. **Frontend-Only Mode**: Can run without backend using localStorage
6. **Date Format**: Uses ISO format (YYYY-MM-DD) for dates

## 🔧 Error Handling

The API returns appropriate HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete successful) |
| 400 | Bad Request (Validation error, Duplicate) |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

Error responses include a `detail` field with a human-readable message.

## 📄 License

MIT License

## 👤 Author

Built for HRMS Lite Assignment

---

🚀 **Live Demo**: [Your deployed URL here]

📦 **GitHub**: [Your repository URL here]
