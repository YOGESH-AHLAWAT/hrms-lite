import { useState } from 'react';
import { Page } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { EmployeeList } from '@/components/EmployeeList';
import { AttendanceManagement } from '@/components/AttendanceManagement';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <AttendanceManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile toggle */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false);
          }} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">HRMS Lite</span>
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-900 font-medium capitalize">{currentPage}</span>
              </nav>
            </div>

            {/* Header Right */}
            <div className="flex items-center gap-4">
              {/* Date Display */}
              <div className="hidden sm:block text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Notification Bell */}
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User Avatar */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <span className="text-sm font-medium text-slate-900">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
            <p>© 2024 HRMS Lite. All rights reserved.</p>
            <p>Built with React, Vite & Tailwind CSS</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
