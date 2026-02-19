import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchEmployees, DashboardStats, EmployeeWithAttendance } from '@/utils/api';

export function Dashboard() {
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [empData, statsData] = await Promise.all([
          fetchEmployees(),
          fetchDashboardStats()
        ]);
        setEmployees(empData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
        <p className="text-lg font-medium">Error loading dashboard</p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  const presentToday = stats?.present_today || 0;
  const absentToday = stats?.absent_today || 0;
  const totalPresent = stats?.total_present || 0;
  const totalAbsent = stats?.total_absent || 0;
  const departments = stats?.departments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's an overview of your HR system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total_employees || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3">Across {stats?.total_departments || 0} departments</p>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Departments</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total_departments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3">Active departments</p>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Present Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{presentToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3">
            {(stats?.total_employees || 0) > 0 ? ((presentToday / (stats?.total_employees || 1)) * 100).toFixed(0) : 0}% of workforce
          </p>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Absent Today</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{absentToday}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3">
            {(stats?.total_employees || 0) > 0 ? ((absentToday / (stats?.total_employees || 1)) * 100).toFixed(0) : 0}% of workforce
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Department Distribution</h2>
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>No departments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {departments.map(dept => {
                const percentage = ((dept.count / (stats?.total_employees || 1)) * 100);
                return (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{dept.name}</span>
                      <span className="text-slate-500">{dept.count} employees</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Attendance Summary</h2>
          {totalPresent + totalAbsent === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray={`${(totalPresent / (totalPresent + totalAbsent)) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">
                      {totalPresent + totalAbsent > 0
                        ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(0)
                        : 0}%
                    </span>
                    <span className="text-xs text-slate-500">Attendance</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Present: {totalPresent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                  <span className="text-sm text-slate-600">Absent: {totalAbsent}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Employees</h2>
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No employees added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Employee ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Department</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">{emp.employeeId}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{emp.fullName}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{emp.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {emp.department}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
