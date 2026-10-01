import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  Search,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  X,
  Globe2,
  PhoneCall,
  ExternalLink,
  MapPin,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest, RequestStatus } from '../../types';
import {
  WORLD_CANCER_HOSPITALS,
  CancerHospital,
  getCancerHospitalPortalName,
  formatHospitalPortalNameFromQuery
} from '../../data/cancerHospitalsData';

export const HospitalPortal: React.FC = () => {
  const {
    currentUser,
    organizations,
    requests,
    donors,
    setSelectedRequest,
    setIsCreateRequestModalOpen,
    updateRequestStatus,
    openAiModule,
    selectedCancerHospital,
    setSelectedCancerHospital,
    cancerHospitalSearchQuery,
    setCancerHospitalSearchQuery
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'requisitions' | 'crossmatch' | 'facility'>('requisitions');
  const [searchQuery, setSearchQuery] = useState(cancerHospitalSearchQuery || 'MD Anderson');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [labOrderSuccessNotice, setLabOrderSuccessNotice] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync when cancerHospitalSearchQuery changes externally
  useEffect(() => {
    if (cancerHospitalSearchQuery && cancerHospitalSearchQuery !== searchQuery) {
      setSearchQuery(cancerHospitalSearchQuery);
    }
  }, [cancerHospitalSearchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Default base facility associated with current user
  const defaultBaseHospital = organizations.find(o => o.id === currentUser.organizationId) || organizations[0];

  // Matched cancer hospital based on typed or searched query
  const matchedCancerHospital: CancerHospital | null = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return selectedCancerHospital || null;
    }
    // Search by name, shortName, portalName, city, or country
    const direct = WORLD_CANCER_HOSPITALS.find(h =>
      h.name.toLowerCase().includes(trimmed) ||
      h.shortName.toLowerCase().includes(trimmed) ||
      (h.portalName && h.portalName.toLowerCase().includes(trimmed)) ||
      h.city.toLowerCase().includes(trimmed) ||
      h.country.toLowerCase().includes(trimmed)
    );
    if (direct) return direct;

    // Check by specialty or keywords
    const keywordMatch = WORLD_CANCER_HOSPITALS.find(h =>
      h.oncologySpecialties.some(s => s.toLowerCase().includes(trimmed))
    );
    if (keywordMatch) return keywordMatch;

    return null;
  }, [searchQuery, selectedCancerHospital]);

  // Autocomplete suggestions matching current input
  const autocompleteSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return WORLD_CANCER_HOSPITALS.slice(0, 8);
    return WORLD_CANCER_HOSPITALS.filter(h =>
      h.name.toLowerCase().includes(trimmed) ||
      h.shortName.toLowerCase().includes(trimmed) ||
      (h.portalName && h.portalName.toLowerCase().includes(trimmed)) ||
      h.city.toLowerCase().includes(trimmed) ||
      h.country.toLowerCase().includes(trimmed) ||
      h.oncologySpecialties.some(s => s.toLowerCase().includes(trimmed))
    );
  }, [searchQuery]);

  // Automatically computed Hospital Portal Name
  const activePortalName = useMemo(() => {
    if (matchedCancerHospital) {
      return getCancerHospitalPortalName(matchedCancerHospital);
    }
    if (searchQuery.trim()) {
      return formatHospitalPortalNameFromQuery(searchQuery);
    }
    if (selectedCancerHospital) {
      return getCancerHospitalPortalName(selectedCancerHospital);
    }
    return `${defaultBaseHospital.name} Hospital Portal`;
  }, [matchedCancerHospital, searchQuery, selectedCancerHospital, defaultBaseHospital]);

  // Active facility details
  const displayLocation = matchedCancerHospital
    ? `${matchedCancerHospital.city}${matchedCancerHospital.stateOrProvince ? `, ${matchedCancerHospital.stateOrProvince}` : ''}, ${matchedCancerHospital.country}`
    : `${defaultBaseHospital.city}, ${defaultBaseHospital.state}`;

  const displayRegulatory = matchedCancerHospital
    ? matchedCancerHospital.accreditations
    : `${defaultBaseHospital.regulatoryBody} · License: ${defaultBaseHospital.licenseNumber}`;

  const displayCoordinators = matchedCancerHospital
    ? `Dr. Rachel Vane, MD · Dr. Marcus Vance, MD (Oncology Coordination Desk)`
    : defaultBaseHospital.activeCoordinators.join(', ');

  const transplantDesk = matchedCancerHospital
    ? matchedCancerHospital.emergencyTransplantDesk
    : defaultBaseHospital.phone;

  // Requisitions for this hospital
  const hospitalRequests = useMemo(() => {
    if (matchedCancerHospital) {
      // Return requests or oncology-aligned requisitions
      return requests.slice(0, 4);
    }
    return requests.filter(r => r.hospitalId === defaultBaseHospital.id || currentUser.role === 'admin');
  }, [matchedCancerHospital, requests, defaultBaseHospital, currentUser]);

  const handleSelectHospital = (hosp: CancerHospital) => {
    setSearchQuery(hosp.shortName);
    setCancerHospitalSearchQuery(hosp.shortName);
    setSelectedCancerHospital(hosp);
    setIsSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCancerHospitalSearchQuery('');
    setSelectedCancerHospital(null);
  };

  // Top quick-select cancer hospitals
  const QUICK_CANCER_HOSPITALS = WORLD_CANCER_HOSPITALS.slice(0, 9);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Hospital Credentials & Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* CSS Selector 1 Target: div:nth-of-type(1) inside banner */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-teal-50 border border-teal-100 text-teal-700 shadow-xs shrink-0">
            <Building2 className="h-8 w-8 text-teal-700" />
          </div>
          <div className="space-y-1.5 min-w-0">
            {/* Live Portal Status & Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 border border-teal-200 text-teal-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Active Hospital Portal
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                Verified Clinical Facility
              </span>
              {matchedCancerHospital && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                  Global Oncology Center
                </span>
              )}
            </div>

            {/* Automatically Displayed Hospital Portal Name */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span className="text-slate-900">{activePortalName}</span>
            </h1>

            {/* Facility Credential & Location */}
            <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
              <span className="text-slate-800 font-semibold">{displayLocation}</span>
              <span className="text-slate-300">·</span>
              <span>Regulatory Credential: <strong className="text-slate-700">{displayRegulatory}</strong></span>
              {matchedCancerHospital?.globalRanking && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-amber-700 font-semibold">{matchedCancerHospital.globalRanking}</span>
                </>
              )}
            </p>

            {/* Duty Coordinators & Emergency Transplant Desk */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
              <span>Coordinators on Duty: <strong className="text-slate-800">{displayCoordinators}</strong></span>
              {transplantDesk && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>24/7 Oncology & Transplant Hotline: <strong className="text-rose-600 font-mono font-bold">{transplantDesk}</strong></span>
                </>
              )}
            </div>

            {/* Live Search Indicator */}
            {searchQuery.trim() && (
              <div className="text-[11px] text-teal-900 bg-teal-50/90 border border-teal-200/90 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mt-1 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>
                  Live Hospital Search: automatically displaying portal for{' '}
                  <strong>{matchedCancerHospital ? matchedCancerHospital.name : searchQuery}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openAiModule('dispatch')}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-900 to-indigo-950 hover:from-teal-800 hover:to-indigo-900 text-teal-300 font-bold text-xs rounded-lg transition border border-teal-800/60 inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span>AI STAT Dispatch</span>
          </button>

          <button
            onClick={() => setIsCreateRequestModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Cancer Hospital Search & Live Portal Switcher */}
      <div ref={searchContainerRef} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Type or Search Any Cancer Hospital
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Type any cancer hospital name below. The official hospital portal name automatically displays above in real-time.
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Reset to Base Facility
            </button>
          )}
        </div>

        {/* Search Input with Auto-complete */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setCancerHospitalSearchQuery(val);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Type or search cancer hospital (e.g. MD Anderson, Memorial Sloan Kettering, Princess Margaret, Gustave Roussy, Charité, Tata Memorial, St. Jude, Dana-Farber...)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear hospital search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {isSearchFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 sticky top-0 flex items-center justify-between">
                <span>Matching Cancer Hospitals & Clinical Portals ({autocompleteSuggestions.length})</span>
                <span className="text-teal-600 lowercase font-normal">click to load portal</span>
              </div>
              {autocompleteSuggestions.map((hosp) => (
                <button
                  key={hosp.id}
                  onClick={() => handleSelectHospital(hosp)}
                  className="w-full text-left p-3 hover:bg-teal-50/70 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                      {hosp.portalName || `${hosp.shortName} Hospital Portal`}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {hosp.name} · {hosp.city}, {hosp.country}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    Display Portal →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Select Cancer Hospital Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Popular Cancer Hospital Portals (click to test & load):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_CANCER_HOSPITALS.map((h) => {
              const isSelected =
                matchedCancerHospital?.id === h.id ||
                searchQuery.toLowerCase().includes(h.shortName.toLowerCase());
              return (
                <button
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {h.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lab Order Notice Toast */}
      {labOrderSuccessNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{labOrderSuccessNotice}</span>
          </div>
          <button
            onClick={() => setLabOrderSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3. Hospital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            {matchedCancerHospital ? 'Dedicated Bone Marrow & Transplant Beds' : 'Active Facility Requisitions'}
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {matchedCancerHospital ? `${matchedCancerHospital.boneMarrowBeds} Beds` : hospitalRequests.filter(r => r.status !== 'completed').length}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">
            {matchedCancerHospital ? 'Inpatient cellular therapy unit' : 'Under clinical management'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            {matchedCancerHospital ? 'Blood Bank & Apheresis Capacity' : 'Emergency STAT Orders'}
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1">
            {matchedCancerHospital ? matchedCancerHospital.bloodBankCapacity : hospitalRequests.filter(r => r.urgency === 'emergency' && r.status !== 'completed').length}
          </div>
          <div className="text-[11px] text-rose-500 mt-1">
            {matchedCancerHospital ? 'Active oncology donor depot' : 'Critical window active'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            {matchedCancerHospital ? 'Active Cancer Clinical Trials' : 'Compatible Donors in Radius'}
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-mono mt-1">
            {matchedCancerHospital ? `${matchedCancerHospital.clinicalTrialsCount} Trials` : donors.filter(d => d.distanceKm <= 15).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {matchedCancerHospital ? 'BMT, CAR-T & Targeted Therapies' : '<15 km transit time'}
          </div>
        </div>
      </div>

      {/* 4. Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('requisitions')}
          className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'requisitions'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hospital Requisitions ({hospitalRequests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('crossmatch')}
          className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'crossmatch'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinical Donor Cross-Match Queue
        </button>
        <button
          onClick={() => setActiveSubTab('facility')}
          className={`pb-2 px-1 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'facility'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Facility Ethics & Accreditations
        </button>
      </div>

      {/* Content for Tabs */}
      {activeSubTab === 'requisitions' && (
        <div className="space-y-3">
          {hospitalRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.urgency === 'emergency'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : req.urgency === 'urgent'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {req.urgency}
                  </span>
                  <span className="font-bold text-slate-800 uppercase text-[10px]">
                    {req.category.replace('_', ' ')}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Patient: {req.patientAlias}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {req.deadlineHoursRemaining}h remaining
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {req.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {req.medicalNotes}
                </p>

                <div className="text-[11px] text-teal-700 font-medium">
                  {req.matchedDonorIds.length} candidate donors ready for cross-match protocol
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clinical Triage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'crossmatch' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Immediate Donor Screening & Cross-Match Queue
            </h3>
            <p className="text-xs text-slate-500">
              Approved clinical matches awaiting pre-donation serology and rapid laboratory confirmation
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {donors.slice(0, 3).map(donor => (
              <div key={donor.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{donor.donorName}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-normal">
                      {donor.distanceKm} km ({donor.city})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Clearance: <strong className="text-slate-700">{donor.verificationBadge}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                    Ready for Lab Order
                  </span>
                  <button
                    onClick={() => {
                      setLabOrderSuccessNotice(
                        `Clinical screening order successfully issued for donor ${donor.donorName}. Blood Bank & Tissue Lab notified for ${activePortalName}.`
                      );
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    Issue Lab Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'facility' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">
            Institutional Ethics & Regulatory Accreditation
          </h3>
          <p>
            <strong>{activePortalName}</strong> is fully integrated with national organ procurement organizations, regional cellular registries, and regulatory clinical authorities.
          </p>

          {matchedCancerHospital ? (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 text-xs mb-1">Oncology Specializations & Protocol Wings</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {matchedCancerHospital.oncologySpecialties.map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 text-xs mb-1">Pediatric Cranial Wig Partnership</div>
                  <p className="text-[11px] text-slate-500">
                    Affiliated Guild: <strong>{matchedCancerHospital.pediatricWigGuildAffiliation}</strong>
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 text-xs mb-1">Annual Oncology Patient Influx</div>
                  <p className="text-[11px] text-slate-500">
                    Treats over <strong>{matchedCancerHospital.annualPatients}</strong> annually under verified protocols.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 text-xs mb-1">NOTA Compliance Protocol</div>
                <p className="text-[11px] text-slate-500">
                  Hospital Independent Donor Advocates ensure all living kidney and liver donations are completely voluntary and uncompensated.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 text-xs mb-1">AABB Serology Standards</div>
                <p className="text-[11px] text-slate-500">
                  All whole blood and platelet collections undergo nucleic acid testing (NAT) and rapid infectious disease screening.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
