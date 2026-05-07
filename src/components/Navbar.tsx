import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, logout } = useAuth();

  function handleSignOut() {
    logout();
    onNavigate('login');
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo/Brand */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="hidden sm:inline">Disaster Help & Rescue</span>
            <span className="sm:hidden">DHR</span>
          </button>

          {/* Center/Right section */}
          <div className="flex items-center gap-6">
            {/* User Info */}
            {user && (
              <div className="hidden md:flex flex-col items-end gap-0.5">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                  {user.role}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => onNavigate('view-requests')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentPage === 'view-requests'
                    ? 'bg-red text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center gap-1.5 ">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Requests
                </span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-red-500  transition-all duration-200 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
