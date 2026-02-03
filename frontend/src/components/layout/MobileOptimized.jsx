import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, Home, User, Settings, LogOut } from 'lucide-react';

const MobileOptimized = ({ children, title, showBackButton = false, onBackClick }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  if (!isMobile) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
            {title}
          </h1>
        </div>
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          
          {/* Sidebar */}
          <div
            className="relative bg-white w-80 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Sidebar Content */}
            <nav className="flex-1 p-4 space-y-2">
              <a
                href="/recruiter"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Dashboard</span>
              </a>
              
              <a
                href="/recruiter/assessments"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Assessments</span>
              </a>
              
              <a
                href="/recruiter/results"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Results</span>
              </a>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <button className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Add safe area padding for mobile devices */}
        <div className="pt-4 px-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          <a
            href="/recruiter"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Home</span>
          </a>
          
          <a
            href="/recruiter/assessments"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Tests</span>
          </a>
          
          <a
            href="/recruiter/results"
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">Results</span>
          </a>
          
          <button className="flex flex-col items-center justify-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 mt-1">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileOptimized;
