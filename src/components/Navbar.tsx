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
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-base font-semibold text-gray-800"
        >
          Disaster Help & Rescue
        </button>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.name} &middot;{' '}
              <span className="capitalize">{user.role}</span>
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('view-requests')}
              className={`text-sm px-3 py-1 rounded ${
                currentPage === 'view-requests'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Requests
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
