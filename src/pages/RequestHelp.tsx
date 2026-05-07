import { useState, FormEvent, useCallback, useEffect } from 'react';
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
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  // Redirect volunteers to dashboard
  if (user?.role === 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onNavigate={onNavigate} currentPage="request-help" />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">Volunteers can only accept help requests, not create new ones.</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        setImagePreview(result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  }

  const handleLocationSelect = useCallback((coords: LocationData) => {
    setLocation(coords);
  }, []);

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
      }, image);
      setSuccess(true);
      setShowAlert(true);
      setTitle('');
      setDescription('');
      setLocation(null);
      setType('food');
      setImage(null);
      setImagePreview(null);
      setTimeout(() => {
        onNavigate('view-requests');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPage="request-help" />
      
      {/* Success Alert Toast */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Request Submitted!</h3>
              <p className="text-sm text-gray-600 mt-1">Your help request has been posted. Volunteers will soon see it and can accept your request.</p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium hover:file:bg-gray-50 cursor-pointer"
                />
                {image && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Image selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
            </div>
            {imagePreview && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded object-cover" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <LocationMap
                onLocationSelect={handleLocationSelect}
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
