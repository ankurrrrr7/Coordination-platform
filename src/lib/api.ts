const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  message?: string;
  data?: T;
  token?: string;
  count?: number;
  error?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'volunteer' | 'admin';
}

interface HelpRequest {
  _id: string;
  id?: string;
  title: string;
  type: 'food' | 'medical' | 'rescue';
  description: string;
  location: {
    text: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'pending' | 'accepted' | 'resolved';
  createdBy?: User;
  assignedTo?: User | null;
  volunteerLocation?: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timestamp?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Auth APIs
export const authAPI = {
  register: async (name: string, email: string, password: string, role: string = 'user') => {
    return apiCall<{ user: User; token: string }>('/auth/register', 'POST', {
      name,
      email,
      password,
      role,
    });
  },

  login: async (email: string, password: string) => {
    return apiCall<{ user: User; token: string }>('/auth/login', 'POST', {
      email,
      password,
    });
  },

  getProfile: async () => {
    return apiCall<{ user: User & { location?: { coordinates?: { latitude: number; longitude: number }; lastUpdated?: string } } }>('/auth/profile', 'GET');
  },

  updateLocation: async (coordinates: { latitude: number; longitude: number }) => {
    return apiCall('/auth/location', 'PUT', { coordinates });
  },
};

// Help Request APIs
export const requestAPI = {
  create: async (
    title: string,
    type: string,
    description: string,
    location: { text: string; coordinates?: { latitude: number; longitude: number } }
  ) => {
    return apiCall<HelpRequest>('/requests', 'POST', {
      title,
      type,
      description,
      location,
    });
  },

  getAll: async () => {
    return apiCall<HelpRequest[]>('/requests', 'GET');
  },

  getById: async (id: string) => {
    return apiCall<HelpRequest>(`/requests/${id}`, 'GET');
  },

  accept: async (id: string, volunteerLocation?: { coordinates: { latitude: number; longitude: number } }) => {
    return apiCall<HelpRequest>(`/requests/${id}/accept`, 'PUT', {
      volunteerLocation,
    });
  },

  updateVolunteerLocation: async (id: string, coordinates: { latitude: number; longitude: number }) => {
    return apiCall<HelpRequest>(`/requests/${id}/volunteer-location`, 'PUT', {
      coordinates,
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiCall<HelpRequest>(`/requests/${id}/status`, 'PUT', {
      status,
    });
  },

  delete: async (id: string) => {
    return apiCall(`/requests/${id}`, 'DELETE');
  },
};

export type { User, HelpRequest, ApiResponse };
