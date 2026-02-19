import { useState } from 'react';
import { Employee, AttendanceRecord, ValidationError } from '@/types';
import { validateAttendanceForm } from '@/utils/validation';
import { cn } from '@/utils/cn';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSave: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  preselectedEmployeeId?: string;
  preselectedDate?: string;
}

export function AttendanceModal({ 
  isOpen, 
  onClose, 
  employees, 
  onSave,
  preselectedEmployeeId,
  preselectedDate 
}: AttendanceModalProps) {
  const [employeeId, setEmployeeId] = useState(preselectedEmployeeId || '');
  const [date, setDate] = useState(preselectedDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Present' | 'Absent' | ''>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateAttendanceForm(employeeId, date, status);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onSave({
      employeeId,
      date,
      status: status as 'Present' | 'Absent',
    });

    // Reset form
    setEmployeeId(preselectedEmployeeId || '');
    setDate(preselectedDate || new Date().toISOString().split('T')[0]);
    setStatus('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setEmployeeId(preselectedEmployeeId || '');
    setDate(preselectedDate || new Date().toISOString().split('T')[0]);
    setStatus('');
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Mark Attendance</h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Employee Selection */}
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-slate-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!!preselectedEmployeeId}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-all',
                  getError('employeeId')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500',
                  preselectedEmployeeId && 'bg-slate-50'
                )}
              >
                <option value="">Select an employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))}
              </select>
              {getError('employeeId') && (
                <p className="mt-1 text-sm text-red-600">{getError('employeeId')}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-all',
                  getError('date')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              />
              {getError('date') && (
                <p className="mt-1 text-sm text-red-600">{getError('date')}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStatus('Present')}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-xl font-medium transition-all',
                    status === 'Present'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Absent')}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-xl font-medium transition-all',
                    status === 'Absent'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Absent
                </button>
              </div>
              {getError('status') && (
                <p className="mt-2 text-sm text-red-600">{getError('status')}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
