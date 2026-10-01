import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Heart,
  Bone,
  Scissors
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest, DonationCategory, UrgencyLevel, RequestStatus } from '../../types';
import { RequestDetailModal } from './RequestDetailModal';

export const RequestsHub: React.FC = () => {
  const {
    requests,
    selectedRequest,
    setSelectedRequest,
    setIsCreateRequestModalOpen,
    activeFilterCategory,
    setActiveFilterCategory
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (activeFilterCategory !== 'all' && req.category !== activeFilterCategory) {
        return false;
      }

      if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) {
        return false;
      }

      if (statusFilter === 'active') {
        if (req.status === 'completed' || req.status === 'cancelled') return false;
      } else if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesHospital = req.hospitalName.toLowerCase().includes(q);
        const matchesPatient = req.patientAlias.toLowerCase().includes(q);
        const matchesNotes = req.medicalNotes.toLowerCase().includes(q);
        if (!matchesTitle && !matchesHospital && !matchesPatient && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [requests, activeFilterCategory, urgencyFilter, statusFilter, searchQuery]);

  const categoryIcons: Record<DonationCategory, React.ReactNode> = {
    blood: <Droplet className="h-4 w-4 text-rose-600" />,
    organ: <Heart className="h-4 w-4 text-teal-600" />,
    bone_tissue: <Bone className="h-4 w-4 text-indigo-600" />,
    hair: <Scissors className="h-4 w-4 text-amber-600" />
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Pending</span>;
      case 'verified':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Verified</span>;
      case 'matched':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Matched</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">In Progress</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">Completed</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Donation Requisitions & Patient Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active clinical requests, urgency deadlines, and matched donor allocations
          </p>
        </div>

        <button
          onClick={() => setIsCreateRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { id: 'all', label: 'All Requisitions' },
          { id: 'blood', label: 'Blood Banking', icon: <Droplet className="h-3.5 w-3.5 text-rose-600" /> },
          { id: 'organ', label: 'Organ Transplants', icon: <Heart className="h-3.5 w-3.5 text-teal-600" /> },
          { id: 'bone_tissue', label: 'Bone & Tissue Allografts', icon: <Bone className="h-3.5 w-3.5 text-indigo-600" /> },
          { id: 'hair', label: 'Hair for Cancer Wigs', icon: <Scissors className="h-3.5 w-3.5 text-amber-600" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterCategory(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilterCategory === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requisitions ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Pipeline ({requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed & Fulfilled ({requests.filter(r => r.status === 'completed').length})</span>
          </button>
        </div>

        {statusFilter === 'completed' ? (
          <span className="text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Viewing {filteredRequests.length} verified completed donation record(s)</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">
            Click <strong>Completed & Fulfilled</strong> to see archived and completed donation records.
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, hospital, or patient alias..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Urgency (All Levels)</option>
              <option value="emergency">Emergency STAT Only</option>
              <option value="urgent">Urgent (&lt;24h)</option>
              <option value="standard">Standard (&lt;72h)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Status: All Requisitions ({requests.length})</option>
              <option value="active">Status: Active In-Pipeline ({requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length})</option>
              <option value="pending">Status: Pending Verification</option>
              <option value="verified">Status: Verified by Board</option>
              <option value="matched">Status: Matched with Donor</option>
              <option value="in_progress">Status: Procedure in Progress</option>
              <option value="completed">✓ Status: Completed & Fulfilled ({requests.filter(r => r.status === 'completed').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No requisitions found matching current filters</h3>
            <p className="text-xs text-slate-500">Try broadening your urgency or status filters.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="p-1 rounded bg-slate-100">
                    {categoryIcons[req.category]}
                  </span>
                  <span className="font-bold text-slate-900 uppercase text-[11px]">
                    {req.category.replace('_', ' ')}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {req.hospitalName}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Patient: {req.patientAlias} ({req.patientAge}yo)
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {req.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {req.medicalNotes}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-rose-600 font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{req.deadlineHoursRemaining}h remaining</span>
                  </div>
                  <span>·</span>
                  <span className="font-mono">
                    Units: {req.unitsFulfilled || 0}/{req.unitsNeeded || 1}
                  </span>
                  <span>·</span>
                  <span className="text-teal-700 font-semibold">
                    {req.matchedDonorIds.length} candidate donors ready
                  </span>
                </div>
              </div>

              {/* Status & CTA zone */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.urgency === 'emergency'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : req.urgency === 'urgent'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {req.urgency}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800">
                  <span>Manage Request</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
