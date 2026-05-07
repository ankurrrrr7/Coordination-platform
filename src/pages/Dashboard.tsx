import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { requestAPI, HelpRequest } from '../lib/api';
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
  const [acceptedRequests, setAcceptedRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'volunteer') {
      fetchAcceptedRequests();
      const interval = setInterval(fetchAcceptedRequests, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  async function fetchAcceptedRequests() {
    try {
      const response = await requestAPI.getAll();
      const allRequests = (response.data || []) as HelpRequest[];
      const accepted = allRequests.filter(
        (req) => req.status === 'accepted' && req.assignedTo?.id === user?.id
      );
      setAcceptedRequests(accepted);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }

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
          {user?.role !== 'volunteer' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
          )}

          <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${user?.role !== 'volunteer' ? '' : 'sm:col-span-2'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800">View Requests</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {user?.role === 'volunteer' 
                ? 'Browse and accept active help requests in the area.'
                : 'Browse all active help requests in the area.'}
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
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Your Location</h3>
              </div>
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

        {/* Bottom Section - Conditional Content */}
        {user?.role === 'volunteer' ? (
          // Volunteer: Show Active Accepted Requests
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Active Requests</h3>
            {acceptedRequests.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21l-4.35-4.35m0 0a7 7 0 10-9.9 0" />
                </svg>
                <p className="text-gray-600 mb-4">No active requests yet. Visit the requests page to accept new ones.</p>
                <button
                  onClick={() => onNavigate('view-requests')}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
                >
                  View All Requests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acceptedRequests.map((req) => (
                  <div key={req._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                          req.type === 'food' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          req.type === 'medical' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                        </span>
                        <h4 className="text-sm font-medium text-gray-800 mt-2">{req.title}</h4>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">{req.description.substring(0, 80)}...</p>
                    <p className="text-xs text-gray-500 mt-2">Location: {req.location.text}</p>
                    {req.image && (
                      <div className="mt-3 mb-3">
                        <img src={req.image} alt={req.title} className="w-full h-24 rounded object-cover border border-gray-300" />
                      </div>
                    )}
                    <button
                      onClick={() => onNavigate('view-requests')}
                      className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // User: Show Safety Guidelines
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Safety Guidelines When Requesting Help</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 11a3 3 0 110-6 3 3 0 010 6zm0 0v4m0 0H5m4 0h4m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Provide Accurate Information</h4>
                    <p className="text-sm text-gray-700">Be honest and precise about your situation. Accurate details help volunteers respond more effectively.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Share Clear Images</h4>
                    <p className="text-sm text-gray-700">If including images, ensure they're clear and show the situation. This helps volunteers understand better.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Keep Location Accurate</h4>
                    <p className="text-sm text-gray-700">Always set your location precisely so volunteers can reach you quickly in emergencies.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Priority Communication</h4>
                    <p className="text-sm text-gray-700">Requests will be prioritized based on urgency. Medical emergencies get priority response.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.697m8.367 11.192A6 6 0 007.06 5.06m5.417 8.83a6.5 6.5 0 10-9.2-9.2m8.366 11.193A6.5 6.5 0 006.06 4.06" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Stay Safe with Volunteers</h4>
                    <p className="text-sm text-gray-700">Meet volunteers in safe locations. Verify their identity and share your request details clearly.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h6a1 1 0 011 1v4a1 1 0 11-2 0V4H3v10h4a1 1 0 110 2H3a1 1 0 01-1-1V3zM14 4a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Monitor Your Request</h4>
                    <p className="text-sm text-gray-700">Check the status of your requests regularly. Update volunteers if the situation changes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
