import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI, HelpRequest } from '../lib/api';
import Navbar from '../components/Navbar';
import RouteDisplay from '../components/RouteDisplay';

interface ViewRequestsProps {
  onNavigate: (page: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
};

const TYPE_COLORS: Record<string, string> = {
  food: 'bg-orange-50 text-orange-700 border-orange-200',
  medical: 'bg-red-50 text-red-700 border-red-200',
  rescue: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function ViewRequests({ onNavigate }: ViewRequestsProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  async function fetchRequests() {
    try {
      const response = await requestAPI.getAll();
      const allRequests = (response.data || []) as HelpRequest[];
      setRequests(allRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleAccept(requestId: string) {
    if (!user) return;
    setAccepting(requestId);
    setError('');

    // Get volunteer location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await requestAPI.accept(requestId, {
              coordinates: { latitude, longitude },
            });
            await fetchRequests();
            setExpandedRequest(requestId);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept request');
          } finally {
            setAccepting(null);
          }
        },
        (err) => {
          console.log('Geolocation error:', err);
          // Accept without location
          acceptRequestWithoutLocation(requestId);
        }
      );
    } else {
      // Browser doesn't support geolocation
      acceptRequestWithoutLocation(requestId);
    }
  }

  async function acceptRequestWithoutLocation(requestId: string) {
    try {
      await requestAPI.accept(requestId);
      await fetchRequests();
      setExpandedRequest(requestId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPage="view-requests" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Help Requests</h2>
            <p className="text-gray-500 text-sm mt-1">All submitted requests for assistance</p>
          </div>
          <button
            onClick={() => onNavigate('request-help')}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Request
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-16">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16 bg-white border border-gray-200 rounded-lg">
            No requests found.{' '}
            <button
              onClick={() => onNavigate('request-help')}
              className="text-blue-600 hover:underline"
            >
              Submit the first one
            </button>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${TYPE_COLORS[req.type]}`}
                      >
                        {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLORS[req.status]}`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 truncate">{req.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                    {req.image && (
                      <div className="mt-3 mb-2">
                        <img 
                          src={req.image} 
                          alt={req.title} 
                          className="max-h-40 rounded object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Location: {req.location.text}
                    </p>
                  </div>

                  {user?.role === 'volunteer' && req.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(req._id)}
                      disabled={accepting === req._id}
                      className="shrink-0 bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {accepting === req._id ? 'Accepting...' : 'Accept'}
                    </button>
                  )}

                  {user?.role === 'volunteer' && req.status === 'accepted' && req.assignedTo?.id === user.id && (
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === req._id ? null : req._id)}
                      className="shrink-0 bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700"
                    >
                      {expandedRequest === req._id ? 'Hide Route' : 'View Route'}
                    </button>
                  )}
                </div>

                {/* Route Display */}
                {expandedRequest === req._id && req.status === 'accepted' && req.location.coordinates && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="text-sm font-medium text-gray-800">Route to Help Request</h4>
                    </div>
                    <RouteDisplay
                      requestLocation={req.location.coordinates}
                      volunteerLocation={req.volunteerLocation?.coordinates || null}
                      height="350px"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
