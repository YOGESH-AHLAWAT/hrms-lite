import { useEffect, useState } from 'react';
import { Employee, AttendanceRecord } from '@/types';
import { fetchEmployees, fetchAttendance, markAttendance, EmployeeWithAttendance } from '@/utils/api';
import { AttendanceModal } from './AttendanceModal';
import { cn } from '@/utils/cn';

export function AttendanceManagement() {
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'byDate' | 'byEmployee'>('byDate');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empData, attData] = await Promise.all([
        fetchEmployees(),
        fetchAttendance()
      ]);
      setEmployees(empData);
      setAttendance(attData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMarkAttendance = async (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    try {
      await markAttendance({
        employee_id: record.employeeId,
        date: record.date,
        status: record.status,
      });
      await loadData();
      showNotification('success', 'Attendance marked successfully!');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to mark attendance');
    }
  };

  const getEmployeeById = (id: string) => employees.find(e => e.id === id);

  // Filter attendance records
  const filteredAttendance = attendance.filter(rec => {
    const matchesDate = !dateFilter || rec.date === dateFilter;
    const matchesEmployee = !employeeFilter || rec.employeeId === employeeFilter;
    return matchesDate && matchesEmployee;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by date
  const groupedByDate = filteredAttendance.reduce((acc, rec) => {
    if (!acc[rec.date]) {
      acc[rec.date] = [];
    }
    acc[rec.date].push(rec);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  // Get unique dates sorted
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">Error loading attendance</p>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all transform ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1">Track and manage employee attendance</p>
        </div>
        <button
          onClick={() => {
            setSelectedEmployee(null);
            setShowModal(true);
          }}
          disabled={employees.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Mark Attendance
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No employees found</h3>
            <p className="text-slate-500">Add employees first to mark their attendance</p>
          </div>
        </div>
      ) : (
        <>
          {/* View Mode Toggle & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('byDate')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-all',
                    viewMode === 'byDate'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  By Date
                </button>
                <button
                  onClick={() => setViewMode('byEmployee')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-all',
                    viewMode === 'byEmployee'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  By Employee
                </button>
              </div>

              {/* Filters */}
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                {viewMode === 'byDate' && (
                  <div className="sm:w-48">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
                <div className="sm:w-64">
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                {(dateFilter || employeeFilter) && (
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setEmployeeFilter('');
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {viewMode === 'byDate' ? (
            /* Attendance By Date View */
            <div className="space-y-4">
              {sortedDates.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No attendance records</h3>
                    <p className="text-slate-500 mb-4">
                      {dateFilter || employeeFilter 
                        ? 'No records match your filters' 
                        : 'Start by marking attendance for your employees'}
                    </p>
                    {!dateFilter && !employeeFilter && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                sortedDates.map(date => {
                  const records = groupedByDate[date];
                  const presentCount = records.filter(r => r.status === 'Present').length;
                  const absentCount = records.filter(r => r.status === 'Absent').length;

                  return (
                    <div key={date} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* Date Header */}
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{formatDate(date)}</h3>
                            <p className="text-sm text-slate-500">{records.length} records</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-sm text-slate-600">{presentCount} Present</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-sm text-slate-600">{absentCount} Absent</span>
                          </div>
                        </div>
                      </div>

                      {/* Records */}
                      <div className="divide-y divide-slate-100">
                        {records.map(rec => {
                          const emp = getEmployeeById(rec.employeeId);
                          if (!emp) return null;
                          return (
                            <div key={rec.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{emp.fullName}</p>
                                  <p className="text-sm text-slate-500">{emp.employeeId} • {emp.department}</p>
                                </div>
                              </div>
                              <span className={cn(
                                'px-3 py-1 rounded-full text-sm font-medium',
                                rec.status === 'Present'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              )}>
                                {rec.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Attendance By Employee View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(employeeFilter ? employees.filter(e => e.id === employeeFilter) : employees).map(emp => {
                const totalDays = emp.present_days + emp.absent_days;
                const attendanceRate = totalDays > 0 ? ((emp.present_days / totalDays) * 100).toFixed(0) : 0;

                return (
                  <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{emp.fullName}</p>
                          <p className="text-sm text-slate-500">{emp.employeeId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Mark Attendance"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Attendance Rate</span>
                        <span className="font-semibold text-slate-900">{attendanceRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{emp.present_days}</p>
                          <p className="text-xs text-slate-500">Present</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{emp.absent_days}</p>
                          <p className="text-xs text-slate-500">Absent</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{totalDays}</p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {emp.department}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Mark Attendance Modal */}
      <AttendanceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEmployee(null);
        }}
        employees={employees}
        onSave={handleMarkAttendance}
        preselectedEmployeeId={selectedEmployee?.id}
      />
    </div>
  );
}
