# HRMS Lite - Python Backend

A lightweight Human Resource Management System API built with FastAPI and SQLite.

## Features

- **Employee Management**: Add, view, and delete employees
- **Attendance Tracking**: Mark and view attendance records
- **Dashboard Statistics**: Get overview of HR metrics
- **RESTful API**: Clean, well-documented endpoints
- **Validation**: Server-side validation with meaningful error messages
- **SQLite Database**: Simple, file-based persistence

## Tech Stack

- **Framework**: FastAPI (Python 3.8+)
- **Database**: SQLite
- **Validation**: Pydantic
- **Server**: Uvicorn

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
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

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/{id}` | Get employee by ID |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance records |
| GET | `/api/attendance?employee_id={id}` | Filter by employee |
| GET | `/api/attendance?date={date}` | Filter by date |
| POST | `/api/attendance` | Mark attendance |
| DELETE | `/api/attendance/{id}` | Delete attendance record |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## Request/Response Examples

### Create Employee

**Request:**
```json
POST /api/employees
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
    "id": "uuid-here",
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
{
    "employee_id": "uuid-here",
    "date": "2024-01-15",
    "status": "Present"
}
```

**Response (201 Created):**
```json
{
    "id": "uuid-here",
    "employee_id": "uuid-here",
    "date": "2024-01-15",
    "status": "Present",
    "created_at": "2024-01-15T10:30:00.000000"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Validation error or duplicate data
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Invalid request format
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
    "detail": "Error message here"
}
```

## Deployment

### Using Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DB_PATH=/data/hrms_lite.db`
6. Add a persistent disk mounted at `/data`

### Using Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect Python and install dependencies
4. Set start command in Procfile or railway.toml:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Using Heroku

1. Add a `Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. Deploy via Heroku CLI or GitHub integration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PATH` | Path to SQLite database file | `hrms_lite.db` |
| `PORT` | Server port (set by hosting platform) | `8000` |

## License

MIT License
