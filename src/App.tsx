import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RequestHelp from './pages/RequestHelp';
import ViewRequests from './pages/ViewRequests';

type Page = 'login' | 'signup' | 'dashboard' | 'request-help' | 'view-requests';

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('login');

  useEffect(() => {
    if (!loading) {
      if (user) {
        setPage('dashboard');
      } else {
        setPage('login');
      }
    }
  }, [user, loading]);

  function navigate(target: string) {
    setPage(target as Page);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return page === 'signup' ? (
      <Signup onNavigate={navigate} />
    ) : (
      <Login onNavigate={navigate} />
    );
  }

  switch (page) {
    case 'request-help':
      return <RequestHelp onNavigate={navigate} />;
    case 'view-requests':
      return <ViewRequests onNavigate={navigate} />;
    default:
      return <Dashboard onNavigate={navigate} />;
  }
}
