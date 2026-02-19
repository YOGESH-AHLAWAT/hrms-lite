import { useState } from 'react';
import { Employee, ValidationError } from '@/types';
import { validateEmployeeForm } from '@/utils/validation';
import { cn } from '@/utils/cn';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSave }: AddEmployeeModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Product',
    'Design',
    'Customer Support',
    'Legal',
  ];

  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateEmployeeForm(employeeId, fullName, email, department);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onSave({
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department,
    });

    // Reset form
    setEmployeeId('');
    setFullName('');
    setEmail('');
    setDepartment('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setEmployeeId('');
    setFullName('');
    setEmail('');
    setDepartment('');
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
            <h2 className="text-xl font-semibold text-slate-900">Add New Employee</h2>
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
            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., EMP001"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                  getError('employeeId')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              />
              {getError('employeeId') && (
                <p className="mt-1 text-sm text-red-600">{getError('employeeId')}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                  getError('fullName')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              />
              {getError('fullName') && (
                <p className="mt-1 text-sm text-red-600">{getError('fullName')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., john.doe@company.com"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all',
                  getError('email')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              />
              {getError('email') && (
                <p className="mt-1 text-sm text-red-600">{getError('email')}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-all',
                  getError('department')
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {getError('department') && (
                <p className="mt-1 text-sm text-red-600">{getError('department')}</p>
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
                  'Add Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
