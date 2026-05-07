import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UserLocationMap from '../components/UserLocationMap';
import WeatherWidget from '../components/WeatherWidget';
import AlertsWidget from '../components/AlertsWidget';
import DisasterGuides from '../components/DisasterGuides';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPage="dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {user?.role === 'volunteer'
            ? 'You are signed in as a volunteer. You can view and accept help requests.'
            : 'You can submit help requests or view existing ones.'}
        </p>

        {/* Quick Actions - Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-3xl">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🆘</span>
              </div>
              <h3 className="text-base font-semibold text-gray-800">Request Help</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Submit a new request for food, medical aid, or rescue.
            </p>
            <button
              onClick={() => onNavigate('request-help')}
              className="w-full bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Request Help
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <h3 className="text-base font-semibold text-gray-800">View Requests</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Browse all active help requests in the area.
            </p>
            <button
              onClick={() => onNavigate('view-requests')}
              className="w-full bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              View Requests
            </button>
          </div>
        </div>

        {/* Top Row - Location Map with Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Left Sidebar - Weather */}
          <div className="lg:col-span-3">
            <WeatherWidget />
          </div>

          {/* Center - User Location Map */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-4">📍 Your Location</h3>
              <UserLocationMap
                userId={user?.id}
                height="350px"
                showRealTime={true}
              />
            </div>
          </div>

          {/* Right Sidebar - Alerts */}
          <div className="lg:col-span-3">
            <AlertsWidget />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Active Requests</p>
                <p className="text-2xl font-bold text-orange-800 mt-1">12</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Volunteers Online</p>
                <p className="text-2xl font-bold text-green-800 mt-1">8</p>
              </div>
              <span className="text-3xl">👨‍💼</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">5</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
