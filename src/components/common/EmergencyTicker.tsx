import React from 'react';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmergencyTicker: React.FC = () => {
  const { requests, setSelectedRequest } = useApp();
  
  const emergencyRequests = requests.filter(
    r => r.urgency === 'emergency' && r.status !== 'completed' && r.status !== 'cancelled'
  );

  if (emergencyRequests.length === 0) return null;

  return (
    <div className="bg-rose-900/90 border-b border-rose-800 text-rose-100 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-5 items-center gap-1 bg-rose-600 text-white font-bold px-2 rounded text-[11px] uppercase tracking-wide shrink-0 animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            Active Emergency
          </span>
          <div className="flex items-center gap-3 truncate">
            <span className="font-medium text-white truncate">
              {emergencyRequests[0].title}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-rose-300 font-mono">
              <Clock className="h-3 w-3" />
              Expires: {emergencyRequests[0].deadlineDate}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelectedRequest(emergencyRequests[0])}
          className="inline-flex items-center gap-1 text-white hover:text-rose-200 font-medium shrink-0 group transition-colors"
        >
          <span>View Clinical Triage & Donors ({emergencyRequests.length} Active)</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
