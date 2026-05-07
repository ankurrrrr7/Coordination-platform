import { useState } from 'react';
import { ChevronDown, AlertTriangle, Heart, Home, Droplet, Wind, Flame, Mountain } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  tips: string[];
}

export default function DisasterGuides() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const guides: Guide[] = [
    {
      id: '1',
      title: 'Earthquake Safety',
      category: 'Natural Disaster',
      icon: <Mountain className="w-5 h-5" />,
      tips: [
        'Drop, Cover, and Hold On immediately when shaking starts',
        'Stay away from windows and heavy objects that may fall',
        'If outdoors, move away from buildings, power lines, and trees',
        'If in a vehicle, pull over safely and stay inside with seatbelt on',
        'After the quake, check for injuries and gas leaks',
        'Be prepared for aftershocks',
      ],
    },
    {
      id: '2',
      title: 'Flood Safety',
      category: 'Water Emergency',
      icon: <Droplet className="w-5 h-5" />,
      tips: [
        'Never drive through flooded roads - turn around if water blocks path',
        'Move to higher ground immediately if flooding is predicted',
        'Prepare emergency supplies: water, food, medications, flashlight',
        'Know your evacuation routes in advance',
        'Keep important documents in waterproof containers',
        'Stay informed through emergency alerts and local news',
      ],
    },
    {
      id: '3',
      title: 'Hurricane Preparedness',
      category: 'Extreme Weather',
      icon: <Wind className="w-5 h-5" />,
      tips: [
        'Board up windows and secure outdoor furniture',
        'Stock up on water (1 gallon per person per day for 3-7 days)',
        'Prepare non-perishable food and essential medications',
        'Fill bathtub with water for sanitation if main supply is cut',
        'Have a battery-powered radio and extra batteries',
        'Create a family communication plan',
      ],
    },
    {
      id: '4',
      title: 'Fire Safety',
      category: 'Building Emergency',
      icon: <Flame className="w-5 h-5" />,
      tips: [
        'Never use elevators - use stairs to evacuate',
        'Feel doors before opening to check for heat',
        'If trapped, go to the nearest window and signal for help',
        'Keep fire extinguishers in accessible locations',
        'Practice evacuation routes regularly with family',
        'Have a safe meeting point outside the building',
      ],
    },
    {
      id: '5',
      title: 'First Aid Basics',
      category: 'Medical Emergency',
      icon: <Heart className="w-5 h-5" />,
      tips: [
        'Call emergency services (911) immediately for serious injuries',
        'For severe bleeding, apply direct pressure with clean cloth',
        'For choking, perform Heimlich maneuver: abdominal thrusts',
        'For burns, cool affected area with running water for 10-20 minutes',
        'For shock, lay person flat, elevate legs, keep warm',
        'Learn CPR from certified training courses in your area',
      ],
    },
    {
      id: '6',
      title: 'Shelter & Evacuation',
      category: 'Emergency Evacuation',
      icon: <Home className="w-5 h-5" />,
      tips: [
        'Always follow official evacuation orders immediately',
        'Have a go-bag ready with essentials: ID, phone charger, medications',
        'Know multiple evacuation routes from your area',
        'If evacuating by vehicle, fill gas tank before roads become congested',
        'Leave pets with proper ID and carriers/crates',
        'Take photos/videos of your home and possessions for insurance',
      ],
    },
  ];

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('Natural')) return 'bg-yellow-50 border-yellow-200';
    if (category.includes('Water')) return 'bg-blue-50 border-blue-200';
    if (category.includes('Weather')) return 'bg-purple-50 border-purple-200';
    if (category.includes('Building')) return 'bg-orange-50 border-orange-200';
    if (category.includes('Medical')) return 'bg-red-50 border-red-200';
    if (category.includes('Evacuation')) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-bold text-gray-800">🚨 Disaster Guides & Safety Tips</h3>
      </div>

      <div className="space-y-3">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className={`border rounded-lg overflow-hidden ${getCategoryColor(guide.category)}`}
          >
            {/* Header */}
            <button
              onClick={() => toggleGuide(guide.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-700">{guide.icon}</div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">{guide.title}</h4>
                  <p className="text-xs text-gray-500">{guide.category}</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedGuide === guide.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Tips */}
            {expandedGuide === guide.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-200 border-opacity-30">
                <ul className="space-y-2">
                  {guide.tips.map((tip, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-700">
                      <span className="font-bold text-gray-400 min-w-fit">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Important:</strong> In life-threatening emergencies, always call emergency services (911) first. These guides are for preparedness and general information only.
        </p>
      </div>
    </div>
  );
}
