import { useEffect, useState } from 'react';
import { AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  category: string;
}

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recent alerts
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Flood Warning',
        description: 'Heavy rainfall in your area. Stay safe and avoid flooded areas.',
        timestamp: '2 hours ago',
        category: 'Weather',
      },
      {
        id: '2',
        type: 'info',
        title: 'Volunteer Needed',
        description: '5 active help requests in your area needing immediate assistance.',
        timestamp: '1 hour ago',
        category: 'Community',
      },
      {
        id: '3',
        type: 'success',
        title: 'Request Completed',
        description: 'Your recent help request has been successfully resolved.',
        timestamp: '30 minutes ago',
        category: 'Update',
      },
      {
        id: '4',
        type: 'info',
        title: 'Network Alert',
        description: 'Server maintenance scheduled for tonight 2 AM - 4 AM UTC.',
        timestamp: '15 minutes ago',
        category: 'System',
      },
      {
        id: '5',
        type: 'warning',
        title: 'Safety Advisory',
        description: 'Extreme heat warning. Ensure proper hydration and stay indoors.',
        timestamp: 'Just now',
        category: 'Health',
      },
    ];

    // Simulate loading delay
    setTimeout(() => {
      setAlerts(sampleAlerts);
      setLoading(false);
    }, 500);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Weather':
        return 'bg-blue-100 text-blue-800';
      case 'Community':
        return 'bg-purple-100 text-purple-800';
      case 'Health':
        return 'bg-red-100 text-red-800';
      case 'System':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-400 text-sm">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">🔔 Recent Alerts & Updates</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No alerts at this time
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 transition-all hover:shadow-md ${getAlertStyle(
                alert.type
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{alert.title}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(
                        alert.category
                      )}`}
                    >
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{alert.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-blue-600 text-xs font-medium hover:text-blue-700 py-2">
          View All Alerts →
        </button>
      </div>
    </div>
  );
}
