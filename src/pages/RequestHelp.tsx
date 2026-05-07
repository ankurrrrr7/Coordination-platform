import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import LocationMap from '../components/LocationMap';
import UserLocationMap from '../components/UserLocationMap';

interface RequestHelpProps {
  onNavigate: (page: string) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function RequestHelp({ onNavigate }: RequestHelpProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'food' | 'medical' | 'rescue'>('food');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !location) {
      setError('Please select a location on the map');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await requestAPI.create(title, type, description, {
        text: location.address || `${location.latitude}, ${location.longitude}`,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setLocation(null);
      setType('food');
      setTimeout(() => {
        onNavigate('view-requests');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPage="request-help" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-600">Request Help</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-1">Request Help</h2>
        <p className="text-gray-500 text-sm mb-6">Fill in the details for your help request.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded mb-4">
            Your request has been submitted successfully.{' '}
            <button
              onClick={() => onNavigate('view-requests')}
              className="underline font-medium"
            >
              View all requests
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Brief title of your request"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'food' | 'medical' | 'rescue')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="food">Food</option>
                <option value="medical">Medical</option>
                <option value="rescue">Rescue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe your situation and what you need"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <LocationMap
                onLocationSelect={(coords) => setLocation(coords)}
                height="350px"
              />
              {/* <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">📍 Your Location</h3>
                        <UserLocationMap
                          
                          userId={user?.id}
                          height="350px"
                          showRealTime={true}
                        />
                </div> */}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white text-sm px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-sm px-5 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
