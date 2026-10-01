import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Map,
  LayoutGrid,
  ShieldCheck,
  Droplet,
  Heart,
  Bone,
  Scissors,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonorProfile, DonationCategory, BloodGroup } from '../../types';
import { InteractiveMap } from './InteractiveMap';

export const DonorFinder: React.FC = () => {
  const {
    donors,
    organizations,
    requests,
    activeFilterCategory,
    setActiveFilterCategory,
    selectedDonor,
    setSelectedDonor,
    setSelectedRequest,
    setIsRegisterDonorModalOpen
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [targetProcedureDate, setTargetProcedureDate] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const emergencyRequests = requests.filter(r => r.urgency === 'emergency' && r.status !== 'completed');

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      // Category filter
      if (activeFilterCategory !== 'all' && !donor.categories.includes(activeFilterCategory)) {
        return false;
      }

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = donor.donorName.toLowerCase().includes(q);
        const matchesCity = donor.city.toLowerCase().includes(q);
        const matchesBlood = donor.bloodDetails?.bloodGroup.toLowerCase().includes(q);
        const matchesOrgan = donor.organDetails?.organsPledged.some(o => o.toLowerCase().includes(q));
        const matchesTissue = donor.boneTissueDetails?.tissueTypes.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesBlood && !matchesOrgan && !matchesTissue) {
          return false;
        }
      }

      // Blood group filter
      if (selectedBloodGroup !== 'all') {
        if (!donor.bloodDetails || donor.bloodDetails.bloodGroup !== selectedBloodGroup) {
          return false;
        }
      }

      // Availability filter
      if (availabilityFilter !== 'all') {
        if (availabilityFilter === 'has_scheduled_slot') {
          const hasAvailableSlot = donor.scheduledSlots && donor.scheduledSlots.some(s => s.status === 'available');
          if (!hasAvailableSlot) return false;
        } else if (donor.availabilityStatus !== availabilityFilter) {
          return false;
        }
      }

      // Target procedure date filter (exact match on scheduled availability)
      if (targetProcedureDate) {
        const matchesDate = donor.scheduledSlots?.some(
          s => s.status === 'available' && s.date === targetProcedureDate
        );
        if (!matchesDate) return false;
      }

      // Distance filter
      if (donor.distanceKm > maxDistance) {
        return false;
      }

      // Verified only
      if (verifiedOnly && !donor.isVerified) {
        return false;
      }

      return true;
    });
  }, [donors, activeFilterCategory, searchQuery, selectedBloodGroup, availabilityFilter, targetProcedureDate, maxDistance, verifiedOnly]);

  const categoryIcons: Record<DonationCategory, React.ReactNode> = {
    blood: <Droplet className="h-3.5 w-3.5 text-rose-600" />,
    organ: <Heart className="h-3.5 w-3.5 text-teal-600" />,
    bone_tissue: <Bone className="h-3.5 w-3.5 text-indigo-600" />,
    hair: <Scissors className="h-3.5 w-3.5 text-amber-600" />
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Find Nearby Donors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search verified donors across blood, organ pledges, bone marrow, and hair categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle (Grid vs Map) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-3.5 w-3.5 text-rose-600" />
              <span>Interactive Map & Drives</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </button>
          </div>

          <button
            onClick={() => setIsRegisterDonorModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            + Register as Donor
          </button>
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { id: 'all', label: 'All Categories' },
          { id: 'blood', label: 'Blood Donors', icon: <Droplet className="h-3.5 w-3.5 text-rose-600" /> },
          { id: 'organ', label: 'Organ Pledges', icon: <Heart className="h-3.5 w-3.5 text-teal-600" /> },
          { id: 'bone_tissue', label: 'Bone & Tissue', icon: <Bone className="h-3.5 w-3.5 text-indigo-600" /> },
          { id: 'hair', label: 'Hair Donors', icon: <Scissors className="h-3.5 w-3.5 text-amber-600" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterCategory(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search donor name, city, tissue or specs..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Blood group subfilter if relevant */}
          <div>
            <select
              value={selectedBloodGroup}
              onChange={e => setSelectedBloodGroup(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Blood Group (All)</option>
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                <option key={bg} value={bg}>
                  Type {bg} {bg === 'O-' ? '(Universal Donor)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="all">Availability (All)</option>
              <option value="has_scheduled_slot">Has Scheduled Slots (Procedure Ready)</option>
              <option value="available_now">Available Immediately</option>
              <option value="available_24h">Available in 24 Hours</option>
              <option value="on_call">On-Call for Emergencies</option>
              <option value="cooldown">In Cooldown Window</option>
            </select>
          </div>

          {/* Target Procedure Date Filter */}
          <div className="relative">
            <Calendar className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="date"
              value={targetProcedureDate}
              onChange={e => setTargetProcedureDate(e.target.value)}
              title="Target Procedure Date Match"
              className="w-full text-xs pl-8 pr-2 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            />
          </div>

          {/* Distance Filter */}
          <div>
            <select
              value={maxDistance}
              onChange={e => setMaxDistance(Number(e.target.value))}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value={5}>Within 5 km</option>
              <option value={15}>Within 15 km</option>
              <option value={30}>Within 30 km</option>
              <option value={50}>Within 50 km (Regional)</option>
              <option value={150}>Any Distance</option>
            </select>
          </div>
        </div>

        {/* Filter metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Show verified clinical donors only</span>
          </label>

          <span className="font-mono text-slate-500 tabular-nums">
            Found {filteredDonors.length} matching donor profiles
          </span>
        </div>
      </div>

      {/* Quick Map Callout Banner when in Grid mode */}
      {viewMode === 'grid' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-rose-50/70 via-teal-50/70 to-indigo-50/70 border border-teal-200/70 text-xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <span className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
              <Map className="h-4 w-4" />
            </span>
            <div>
              <span className="font-bold text-slate-900 block">
                Global Oncology & Cancer Hospitals World Map
              </span>
              <span className="text-slate-600 text-[11px]">
                Explore world-leading cancer institutes (MD Anderson, MSKCC, Gustave Roussy, Tata Memorial, etc.), leukemia marrow banks, and pediatric cancer hair workshops with Google Maps AI Grounding.
              </span>
            </div>
          </div>
          <button
            onClick={() => setViewMode('map')}
            className="px-3.5 py-1.5 font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 rounded-lg border border-rose-200 shadow-xs transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch World Cancer Map</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Main View: Grid vs Interactive Map */}
      {viewMode === 'map' ? (
        <InteractiveMap
          donors={filteredDonors}
          organizations={organizations}
          emergencyRequests={emergencyRequests}
          onSelectDonor={donor => setSelectedDonor(donor)}
          onSelectRequest={req => setSelectedRequest(req)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <Search className="h-8 w-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No donors match your search filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your distance radius or changing blood group and category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedBloodGroup('all');
                  setAvailabilityFilter('all');
                  setMaxDistance(50);
                  setSearchQuery('');
                  setVerifiedOnly(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredDonors.map(donor => (
              <div
                key={donor.id}
                onClick={() => setSelectedDonor(donor)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
                        {donor.avatarUrl ? (
                          <img
                            src={donor.avatarUrl}
                            alt={donor.donorName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          donor.donorName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {donor.donorName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{donor.city}, {donor.state}</span>
                          <span>·</span>
                          <span className="font-mono text-emerald-700 font-semibold">{donor.distanceKm} km</span>
                        </div>
                      </div>
                    </div>

                    {donor.isVerified && (
                      <span className="p-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200" title="Clinically Verified">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Registered Categories */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {donor.categories.map(c => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 capitalize"
                      >
                        {categoryIcons[c]}
                        <span>{c.replace('_', ' ')}</span>
                      </span>
                    ))}
                  </div>

                  {/* Specific Details Highlight */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                    {donor.bloodDetails && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Blood Group:</span>
                        <span className="font-mono font-bold text-rose-700">
                          {donor.bloodDetails.bloodGroup} ({donor.bloodDetails.components.map(c => c.replace('_', ' ')).join(', ')})
                        </span>
                      </div>
                    )}
                    {donor.organDetails && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Pledged Organs:</span>
                        <span className="font-medium text-teal-800 capitalize truncate max-w-[140px]">
                          {donor.organDetails.organsPledged.join(', ')}
                        </span>
                      </div>
                    )}
                    {donor.boneTissueDetails && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Bone Marrow Swab:</span>
                        <span className="font-medium text-indigo-700 capitalize">
                          {donor.boneTissueDetails.swabKitStatus}
                        </span>
                      </div>
                    )}
                    {donor.hairDetails && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Hair Specs:</span>
                        <span className="font-medium text-amber-800">
                          {donor.hairDetails.lengthInches}" {donor.hairDetails.condition.replace('_', ' ')}
                        </span>
                      </div>
                    )}

                    {/* Scheduled Procedure Slots Badge */}
                    {donor.scheduledSlots && donor.scheduledSlots.length > 0 && (
                      <div className="flex items-center justify-between text-[11px] bg-teal-50 border border-teal-200/80 rounded-md px-2 py-1 text-teal-900 mt-2">
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar className="h-3 w-3 text-teal-600 shrink-0" />
                          <span>{donor.scheduledSlots.length} Procedure Slot{donor.scheduledSlots.length > 1 ? 's' : ''} Ready</span>
                        </div>
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded text-teal-800 font-bold border border-teal-200 shrink-0">
                          {donor.scheduledSlots[0].date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="capitalize">{donor.availabilityStatus.replace('_', ' ')}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-teal-700 font-bold hover:text-teal-800 text-[11px]">
                    <span>View Profile</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
