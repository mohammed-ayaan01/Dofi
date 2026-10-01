import React, { useState, useMemo } from 'react';
import {
  Building2,
  AlertCircle,
  ShieldCheck,
  Droplet,
  Heart,
  Bone,
  Scissors,
  Search,
  X,
  Sparkles,
  Award,
  ExternalLink,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Globe2,
  Check,
  Copy,
  Layers,
  PhoneCall,
  Activity,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { DonorProfile, Organization, DonationRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import { WORLD_CANCER_HOSPITALS, CancerHospital } from '../../data/cancerHospitalsData';
import {
  WORLD_CONTINENT_FEATURES,
  latLonToSvg,
  GEOGRAPHIC_LABELS,
  WORLD_REFERENCE_CITIES,
  CARTOGRAPHIC_LINES,
  REGION_PRESETS,
  MapRegionPreset
} from '../../data/worldMapData';

interface InteractiveMapProps {
  donors: DonorProfile[];
  organizations: Organization[];
  emergencyRequests: DonationRequest[];
  onSelectDonor: (donor: DonorProfile) => void;
  onSelectRequest: (req: DonationRequest) => void;
}

type OncologySpecialtyFilter = 'all' | 'bone_marrow' | 'pediatric_hair' | 'blood_apheresis' | 'surgical_organ';
type RegionView = 'world' | 'north_america' | 'europe' | 'asia_pacific' | 'latin_america' | 'middle_east_africa';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  donors,
  organizations,
  emergencyRequests,
  onSelectDonor,
  onSelectRequest
}) => {
  const { openAiModule, openHospitalPortalForCancerHospital } = useApp();

  // Selected Hospital / Pin for detailed inspection
  const [selectedHospital, setSelectedHospital] = useState<CancerHospital | null>(
    WORLD_CANCER_HOSPITALS[0]
  );
  const [selectedPinType, setSelectedPinType] = useState<'cancer_hospital' | 'emergency'>('cancer_hospital');
  const [selectedOtherData, setSelectedOtherData] = useState<any>(null);

  // Filters & State
  const [specialtyFilter, setSpecialtyFilter] = useState<OncologySpecialtyFilter>('all');
  const [selectedRegion, setSelectedRegion] = useState<RegionView>('world');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDrawer, setShowDrawer] = useState<boolean>(true);
  const [copiedDesk, setCopiedDesk] = useState<boolean>(false);

  // Map Layer Toggles
  const [showTropics, setShowTropics] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showRefCities, setShowRefCities] = useState<boolean>(true);
  const [showStatEmergencies, setShowStatEmergencies] = useState<boolean>(true);

  // SVG Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state for tooltip preview inside SVG
  const [hoveredHospital, setHoveredHospital] = useState<CancerHospital | null>(null);

  // Live Google Maps Grounding State (Gemini)
  const [isMapsSearching, setIsMapsSearching] = useState<boolean>(false);
  const [mapsGroundingNotice, setMapsGroundingNotice] = useState<string | null>(null);
  const [mapsGroundingSearchTerm, setMapsGroundingSearchTerm] = useState<string>('');

  // Filtered Cancer Hospitals
  const filteredHospitals = useMemo(() => {
    return WORLD_CANCER_HOSPITALS.filter(hospital => {
      // Region filter
      if (selectedRegion !== 'world' && hospital.region !== selectedRegion) {
        return false;
      }

      // Specialty filter
      if (specialtyFilter === 'bone_marrow' && !hospital.categories.includes('bone_tissue')) {
        return false;
      }
      if (specialtyFilter === 'pediatric_hair' && !hospital.categories.includes('hair')) {
        return false;
      }
      if (specialtyFilter === 'blood_apheresis' && !hospital.categories.includes('blood')) {
        return false;
      }
      if (specialtyFilter === 'surgical_organ' && !hospital.categories.includes('organ')) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          hospital.name.toLowerCase().includes(q) ||
          hospital.shortName.toLowerCase().includes(q) ||
          hospital.city.toLowerCase().includes(q) ||
          hospital.country.toLowerCase().includes(q) ||
          hospital.oncologySpecialties.some(s => s.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [specialtyFilter, selectedRegion, searchQuery]);

  // Handle Region Zoom & Pan presets
  const handleSelectRegion = (regionId: RegionView) => {
    setSelectedRegion(regionId);
    const preset = REGION_PRESETS.find(p => p.id === regionId);
    if (!preset) return;

    switch (regionId) {
      case 'north_america':
        setZoomLevel(2.2);
        setPanOffset({ x: 240, y: 100 });
        break;
      case 'europe':
        setZoomLevel(2.6);
        setPanOffset({ x: -10, y: 140 });
        break;
      case 'asia_pacific':
        setZoomLevel(2.1);
        setPanOffset({ x: -330, y: 90 });
        break;
      case 'latin_america':
        setZoomLevel(2.1);
        setPanOffset({ x: 140, y: -70 });
        break;
      case 'middle_east_africa':
        setZoomLevel(2.3);
        setPanOffset({ x: -90, y: 85 });
        break;
      case 'world':
      default:
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        break;
    }
  };

  // Center smoothly on a specific hospital
  const centerOnHospital = (hospital: CancerHospital) => {
    setSelectedHospital(hospital);
    setSelectedPinType('cancer_hospital');
    const { x, y } = latLonToSvg(hospital.latitude, hospital.longitude);
    setZoomLevel(2.4);
    // Center (x, y) at canvas midpoint (500, 250)
    setPanOffset({ x: 500 - x, y: 250 - y });
  };

  // Google Maps AI Grounding search using gemini with googleMaps tool
  const handleLiveMapsSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsMapsSearching(true);
    setMapsGroundingNotice(null);

    try {
      const response = await fetch('/api/ai/maps-grounding-cancer-hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, region: selectedRegion }),
      });

      if (!response.ok) throw new Error('Maps Grounding request failed');
      const resJson = await response.json();
      if (resJson.data?.hospitalsFound) {
        setMapsGroundingSearchTerm(searchQuery);
        setMapsGroundingNotice(
          resJson.groundedWithMaps
            ? 'Live Google Maps Places Grounding Verified'
            : 'Verified Oncology Hospital Database Result'
        );
      }
    } catch (err: any) {
      console.warn('Maps search fallback:', err);
    } finally {
      setIsMapsSearching(false);
    }
  };

  const copyEmergencyDesk = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedDesk(true);
    setTimeout(() => setCopiedDesk(false), 2000);
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col text-slate-100">
      {/* 1. Header Toolbar with Title & Region Quick Buttons */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 via-rose-500 to-teal-500 rounded-xl text-white shadow-lg ring-1 ring-white/20">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>World Cancer Hospital Network</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-semibold border border-teal-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Equirectangular Projection
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Precision global map of leading comprehensive cancer institutes, marrow banks & pediatric hair workshops.
            </p>
          </div>
        </div>

        {/* Region Quick-Focus Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto text-xs">
          {[
            { id: 'world', label: 'Global' },
            { id: 'north_america', label: 'North America' },
            { id: 'europe', label: 'Europe & UK' },
            { id: 'asia_pacific', label: 'Asia-Pacific' },
            { id: 'latin_america', label: 'Latin America' },
            { id: 'middle_east_africa', label: 'ME & Africa' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => handleSelectRegion(r.id as RegionView)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                selectedRegion === r.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sub-Toolbar: Specialty Filters, Search & Layer Controls */}
      <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Specialty filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3 text-teal-400" />
            <span>Specialty:</span>
          </span>

          {[
            { id: 'all', label: 'All Centers', icon: Building2 },
            { id: 'bone_marrow', label: 'Bone Marrow & Stem Cells', icon: Bone },
            { id: 'pediatric_hair', label: 'Pediatric Wigs & Hair', icon: Scissors },
            { id: 'blood_apheresis', label: 'Apheresis Platelets', icon: Droplet },
            { id: 'surgical_organ', label: 'Transplant Resection', icon: Heart },
          ].map(spec => {
            const Icon = spec.icon;
            const isSelected = specialtyFilter === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setSpecialtyFilter(spec.id as OncologySpecialtyFilter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{spec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter hospital, city, specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLiveMapsSearch()}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-teal-500"
            />
          </div>

          <button
            onClick={handleLiveMapsSearch}
            disabled={isMapsSearching || !searchQuery.trim()}
            title="Search Places via Google Maps"
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <Sparkles className={`h-3 w-3 ${isMapsSearching ? 'animate-spin' : ''}`} />
            <span>Maps</span>
          </button>

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg transition shrink-0"
          >
            {showDrawer ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* 3. Main Split View: SVG Map (Left/Center) + Dossier Drawer (Right) */}
      <div className="relative w-full h-[600px] flex flex-col lg:flex-row overflow-hidden bg-slate-950">
        {/* World Map SVG Container */}
        <div className="relative flex-1 h-full overflow-hidden select-none bg-slate-950">
          {/* Top Left: Map Zoom & Recenter Controls */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.4, 3.8))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.4, 0.9))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
                setSelectedRegion('world');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono flex items-center gap-1 cursor-pointer transition"
              title="Reset to Full World View"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Top Right: Layer Visibility Toggle Menu */}
          <div className="absolute top-4 right-4 z-30 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 shadow-xl">
            <button
              onClick={() => setShowTropics(!showTropics)}
              className={`flex items-center gap-1 transition ${showTropics ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}
              title="Toggle Tropic of Cancer & Equator lines"
            >
              <span className={`w-2 h-2 rounded-full ${showTropics ? 'bg-rose-500' : 'bg-slate-600'}`} />
              <span>Tropic of Cancer</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-1 transition ${showLabels ? 'text-teal-400 font-semibold' : 'text-slate-500'}`}
              title="Toggle Continent & Ocean names"
            >
              <span className={`w-2 h-2 rounded-full ${showLabels ? 'bg-teal-500' : 'bg-slate-600'}`} />
              <span>Labels</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowRefCities(!showRefCities)}
              className={`flex items-center gap-1 transition ${showRefCities ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}
              title="Toggle World Cities"
            >
              <span className={`w-2 h-2 rounded-full ${showRefCities ? 'bg-sky-500' : 'bg-slate-600'}`} />
              <span>Cities</span>
            </button>
          </div>

          {/* Bottom Left: Geographic Projection HUD */}
          <div className="absolute bottom-4 left-4 z-30 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-3 shadow-xl">
            <span className="flex items-center gap-1 text-slate-300">
              <Navigation className="h-3 w-3 text-teal-400" />
              <span>Equirectangular Plate Carrée</span>
            </span>
            <span className="text-teal-400 font-semibold">{filteredHospitals.length} Centers Active</span>
            <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          </div>

          {/* Canvas Wrapper with SVG Map - Strict Full Container */}
          <div className="w-full h-full relative">
            {/* The Precision World Map SVG (Target CSS selector) */}
            <svg
              className="w-full h-full absolute inset-0 select-none"
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Deep Ocean Bathymetric Gradients */}
                <radialGradient id="oceanDeepGlow" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#08223d" stopOpacity="0.9" />
                  <stop offset="55%" stopColor="#051426" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#020813" stopOpacity="1" />
                </radialGradient>

                {/* Landmass Shading Gradient */}
                <linearGradient id="landmassGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#24344d" />
                  <stop offset="100%" stopColor="#172233" />
                </linearGradient>

                {/* Landmass Shadow & Elevation Filter */}
                <filter id="landElevation" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
                </filter>

                {/* Radar Ping Beacon Filter */}
                <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Latitude & Longitude Graticule Pattern */}
                <pattern id="latLonGridPattern" width="83.333" height="83.333" patternUnits="userSpaceOnUse">
                  <path d="M 83.333 0 L 0 0 0 83.333" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.45" />
                </pattern>
              </defs>

              {/* Base Ocean Background rect matching target selector */}
              <rect width="1000" height="500" fill="url(#oceanDeepGlow)" />
              <rect width="1000" height="500" fill="url(#latLonGridPattern)" opacity="0.6" />

              {/* Geographic Graticules (Latitudes & Longitudes) */}
              {/* Latitude lines */}
              <line x1="0" y1="83.3" x2="1000" y2="83.3" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="0" y1="166.7" x2="1000" y2="166.7" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="0" y1="333.3" x2="1000" y2="333.3" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="0" y1="416.7" x2="1000" y2="416.7" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />

              {/* Longitude lines */}
              <line x1="166.7" y1="0" x2="166.7" y2="500" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="333.3" y1="0" x2="333.3" y2="500" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="666.7" y1="0" x2="666.7" y2="500" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="833.3" y1="0" x2="833.3" y2="500" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />

              {/* Prime Meridian 0° in highlighted sky-blue */}
              <line x1={CARTOGRAPHIC_LINES.primeMeridianX} y1="0" x2={CARTOGRAPHIC_LINES.primeMeridianX} y2="500" stroke="#0ea5e9" strokeWidth="0.9" strokeDasharray="4 4" strokeOpacity="0.4" />

              {/* Equator 0° in highlighted glowing emerald */}
              <line x1="0" y1={CARTOGRAPHIC_LINES.equatorY} x2="1000" y2={CARTOGRAPHIC_LINES.equatorY} stroke="#14b8a6" strokeWidth="1.2" strokeDasharray="6 4" strokeOpacity="0.65" />

              {/* Tropic of Cancer (23.5° N) in glowing rose - directly relevant to Cancer Hospital data! */}
              {showTropics && (
                <g>
                  <line
                    x1="0"
                    y1={CARTOGRAPHIC_LINES.tropicOfCancerY}
                    x2="1000"
                    y2={CARTOGRAPHIC_LINES.tropicOfCancerY}
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                    strokeDasharray="5 3"
                    strokeOpacity="0.75"
                  />
                  <line
                    x1="0"
                    y1={CARTOGRAPHIC_LINES.tropicOfCapricornY}
                    x2="1000"
                    y2={CARTOGRAPHIC_LINES.tropicOfCapricornY}
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                    strokeOpacity="0.45"
                  />
                </g>
              )}

              {/* Lat/Lon Degree Labels on Edges */}
              <g className="degree-ticks" fill="#64748b" fontSize="8" fontFamily="monospace">
                <text x="6" y="87">60°N</text>
                <text x="6" y="170">30°N</text>
                <text x="6" y={CARTOGRAPHIC_LINES.equatorY - 4} fill="#14b8a6" fontWeight="bold">0° EQUATOR</text>
                {showTropics && (
                  <text x="6" y={CARTOGRAPHIC_LINES.tropicOfCancerY - 4} fill="#f43f5e" fontWeight="bold">23.5°N TROPIC OF CANCER</text>
                )}
                <text x="6" y="337">30°S</text>
                <text x="6" y="420">60°S</text>
                <text x="495" y="14" fill="#0ea5e9" fontWeight="bold" textAnchor="end">0° MERIDIAN</text>
              </g>

              {/* Interactive SVG World Content Group with Smooth Pan & Zoom */}
              <g
                transform={`translate(500, 250) scale(${zoomLevel}) translate(${-500 + panOffset.x}, ${-250 + panOffset.y})`}
                style={{ transformOrigin: '500px 250px', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {/* Vector Continents Group */}
                <g className="world-continents" filter="url(#landElevation)">
                  {WORLD_CONTINENT_FEATURES.map(continent => (
                    <path
                      key={continent.id}
                      d={continent.d}
                      fill="url(#landmassGradient)"
                      stroke="#38bdf8"
                      strokeWidth="0.9"
                      strokeLinejoin="round"
                      strokeOpacity="0.7"
                      className="transition-colors hover:stroke-teal-400"
                    />
                  ))}
                </g>

                {/* Ocean Watermark Typography */}
                {showLabels && (
                  <g className="ocean-typography select-none pointer-events-none" fill="#0284c7" opacity="0.38" fontStyle="italic">
                    {GEOGRAPHIC_LABELS.filter(l => l.type === 'ocean').map((lbl, idx) => (
                      <text
                        key={idx}
                        x={lbl.x}
                        y={lbl.y}
                        fontSize={lbl.fontSize}
                        letterSpacing={lbl.letterSpacing || 2}
                        textAnchor="middle"
                      >
                        {lbl.name}
                      </text>
                    ))}
                  </g>
                )}

                {/* Continental Typography Labels */}
                {showLabels && (
                  <g className="continent-typography select-none pointer-events-none" fill="#94a3b8" fontWeight="700">
                    {GEOGRAPHIC_LABELS.filter(l => l.type === 'continent').map((lbl, idx) => (
                      <text
                        key={idx}
                        x={lbl.x}
                        y={lbl.y}
                        fontSize={lbl.fontSize}
                        letterSpacing={lbl.letterSpacing || 3}
                        opacity="0.75"
                        textAnchor="middle"
                      >
                        {lbl.name}
                      </text>
                    ))}
                  </g>
                )}

                {/* World Reference Cities */}
                {showRefCities && (
                  <g className="reference-cities select-none pointer-events-none opacity-60">
                    {WORLD_REFERENCE_CITIES.map((city, idx) => {
                      const { x, y } = latLonToSvg(city.lat, city.lon);
                      return (
                        <g key={idx} transform={`translate(${x}, ${y})`}>
                          <circle r="1.8" fill="#94a3b8" />
                          <text x="3.5" y="2.5" fill="#64748b" fontSize="6.5" fontFamily="monospace">
                            {city.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Emergency STAT Beacons mapped on SVG coordinate system */}
                {showStatEmergencies && emergencyRequests.map((req, idx) => {
                  // Position near North American, European and Asian hospitals
                  const latPos = 38 - (idx % 3) * 6;
                  const lonPos = -85 + (idx % 2) * 20;
                  const { x, y } = latLonToSvg(latPos, lonPos);

                  return (
                    <g
                      key={req.id}
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedPinType('emergency');
                        setSelectedOtherData(req);
                        onSelectRequest(req);
                      }}
                    >
                      <circle r="8" fill="#e11d48" fillOpacity="0.3" className="animate-ping" />
                      <circle r="4.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
                      <path d="M 0 -2.5 L 0 0.5 M 0 2 L 0 2.8" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                    </g>
                  );
                })}

                {/* PRECISION CANCER HOSPITAL SVG PINS & MARKERS */}
                <g className="cancer-hospitals-layer">
                  {filteredHospitals.map(hospital => {
                    const { x, y } = latLonToSvg(hospital.latitude, hospital.longitude);
                    const isSelected = selectedHospital?.id === hospital.id;
                    const isHovered = hoveredHospital?.id === hospital.id;

                    return (
                      <g
                        key={hospital.id}
                        transform={`translate(${x}, ${y})`}
                        className="cursor-pointer group"
                        onClick={() => centerOnHospital(hospital)}
                        onMouseEnter={() => setHoveredHospital(hospital)}
                        onMouseLeave={() => setHoveredHospital(null)}
                      >
                        {/* Outer Radar Beacon Wave on selected or hovered */}
                        {(isSelected || isHovered) && (
                          <circle
                            r="14"
                            fill={hospital.colorTheme}
                            fillOpacity="0.28"
                            className="animate-ping pointer-events-none"
                          />
                        )}

                        {/* Selected Halo Ring */}
                        {isSelected && (
                          <circle
                            r="10"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.8"
                            strokeDasharray="2 2"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                        )}

                        {/* Hospital Main Marker Circle */}
                        <circle
                          r={isSelected ? 7 : 5.5}
                          fill={hospital.colorTheme}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2 : 1.4}
                          filter="url(#pinGlow)"
                          className="transition-all"
                        />

                        {/* Medical Cross Glyph inside Marker */}
                        <path
                          d="M -2 0 L 2 0 M 0 -2 L 0 2"
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />

                        {/* Label Pill below marker */}
                        <g transform="translate(0, 11)" className="pointer-events-none">
                          <rect
                            x={-(hospital.shortName.length * 2.7 + 6)}
                            y="-6"
                            width={hospital.shortName.length * 5.4 + 12}
                            height="12"
                            rx="3"
                            fill="#020617"
                            fillOpacity={isSelected ? 0.95 : 0.85}
                            stroke={isSelected ? '#38bdf8' : hospital.colorTheme}
                            strokeWidth={isSelected ? 1.2 : 0.8}
                          />
                          <text
                            textAnchor="middle"
                            y="2.5"
                            fill={isSelected ? '#38bdf8' : '#f8fafc'}
                            fontSize="6.8"
                            fontWeight="bold"
                            fontFamily="sans-serif"
                          >
                            {hospital.shortName}
                          </text>
                        </g>

                        {/* Floating Tooltip Box on SVG Hover */}
                        {isHovered && !isSelected && (
                          <g transform="translate(0, -26)" className="pointer-events-none select-none">
                            <rect
                              x="-75"
                              y="-22"
                              width="150"
                              height="24"
                              rx="5"
                              fill="#090d16"
                              stroke="#38bdf8"
                              strokeWidth="1"
                              filter="url(#pinGlow)"
                            />
                            <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">
                              {hospital.name.slice(0, 24)}...
                            </text>
                            <text x="0" y="-3" textAnchor="middle" fill="#2dd4bf" fontSize="6.5">
                              {hospital.city}, {hospital.country} · Click to inspect
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>

              {/* Cartographic Compass Rose (Top Right) */}
              <g transform="translate(935, 45)" className="select-none pointer-events-none opacity-85">
                <circle cx="0" cy="0" r="16" fill="#0b1320" stroke="#334155" strokeWidth="0.8" />
                <path d="M 0 -14 L 3 0 L 0 3 L -3 0 Z" fill="#ef4444" />
                <path d="M 0 14 L 3 0 L 0 -3 L -3 0 Z" fill="#64748b" />
                <path d="M 14 0 L 0 3 L -3 0 L 0 -3 Z" fill="#475569" />
                <path d="M -14 0 L 0 3 L 3 0 L 0 -3 Z" fill="#475569" />
                <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
                <text x="-3" y="-16" fill="#f87171" fontSize="7.5" fontWeight="bold" fontFamily="monospace">N</text>
              </g>

              {/* Map Legend (Bottom Right) */}
              <g transform="translate(730, 468)" className="select-none pointer-events-none opacity-90">
                <rect x="0" y="0" width="250" height="22" rx="5" fill="#0b1320" stroke="#334155" strokeWidth="0.8" />
                <circle cx="14" cy="11" r="3.5" fill="#e11d48" />
                <text x="22" y="14" fill="#cbd5e1" fontSize="7.5" fontWeight="bold">Cancer Center</text>
                <circle cx="95" cy="11" r="3.5" fill="#0d9488" />
                <text x="103" y="14" fill="#cbd5e1" fontSize="7.5" fontWeight="bold">Marrow / Apheresis</text>
                <circle cx="190" cy="11" r="3.5" fill="#d97706" />
                <text x="198" y="14" fill="#cbd5e1" fontSize="7.5" fontWeight="bold">Pediatric Wigs</text>
              </g>
            </svg>
          </div>
        </div>

        {/* 4. Right Side: Interactive Cancer Hospital Dossier Drawer */}
        {showDrawer && (
          <div className="w-full lg:w-96 h-full bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col z-20 shadow-2xl overflow-hidden shrink-0">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  {selectedHospital ? 'Cancer Center Dossier' : 'Global Directory'}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {filteredHospitals.length} Centers Mapped
              </span>
            </div>

            {/* Maps Grounding Notice Banner if active */}
            {mapsGroundingNotice && (
              <div className="p-2.5 bg-teal-950/70 border-b border-teal-800 text-[11px] text-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  <span>{mapsGroundingNotice} for "{mapsGroundingSearchTerm}"</span>
                </div>
                <button
                  onClick={() => setMapsGroundingNotice(null)}
                  className="text-teal-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Selected Hospital Dossier Card */}
            {selectedHospital ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
                {/* Title & Ranking */}
                <div className="space-y-1.5 pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {selectedHospital.country} · {selectedHospital.city}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedHospital.latitude.toFixed(2)}°N, {Math.abs(selectedHospital.longitude).toFixed(2)}°{selectedHospital.longitude < 0 ? 'W' : 'E'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {selectedHospital.name}
                  </h3>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/90 border border-teal-800/80 text-[11px] text-teal-300 font-bold">
                    <Building2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span>Portal: {selectedHospital.portalName || `${selectedHospital.shortName} Hospital Portal`}</span>
                  </div>

                  <div className="text-[11px] text-teal-300 font-semibold flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span>{selectedHospital.globalRanking}</span>
                  </div>
                </div>

                {/* Accreditations & Scale */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Clinical Accreditations</div>
                  <div className="text-slate-200 font-medium leading-relaxed">
                    {selectedHospital.accreditations}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60 text-[10px]">
                    <div>Annual Volume: <strong className="text-white">{selectedHospital.annualPatients}</strong></div>
                    <div>Marrow Beds: <strong className="text-white">{selectedHospital.boneMarrowBeds} Units</strong></div>
                    <div>Blood Capacity: <strong className="text-white">{selectedHospital.bloodBankCapacity}</strong></div>
                    <div>Clinical Trials: <strong className="text-white">{selectedHospital.clinicalTrialsCount}+</strong></div>
                  </div>
                </div>

                {/* Oncology Specialties Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Core Oncology Donation & Clinical Services:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHospital.oncologySpecialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pediatric Cranial Hair & Wig Guild */}
                {selectedHospital.pediatricWigGuildAffiliation && (
                  <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                      <Scissors className="h-3.5 w-3.5 text-amber-400" />
                      <span>Pediatric Cancer Hair Donation Workshop</span>
                    </div>
                    <p className="text-[10px] text-amber-200/80 leading-relaxed">
                      Affiliated with <strong className="text-amber-100">{selectedHospital.pediatricWigGuildAffiliation}</strong> for pediatric cancer cranial prosthetics.
                    </p>
                  </div>
                )}

                {/* Overview narrative */}
                <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                  "{selectedHospital.overview}"
                </p>

                {/* Emergency Contact & Coordinates with Copy action */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <PhoneCall className="h-3 w-3 text-rose-400" />
                      <span>24/7 Transplant Desk:</span>
                    </span>
                    <button
                      onClick={() => copyEmergencyDesk(selectedHospital.emergencyTransplantDesk)}
                      className="font-mono font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      title="Click to copy phone number"
                    >
                      <span>{selectedHospital.emergencyTransplantDesk}</span>
                      {copiedDesk ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-500" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">General Information:</span>
                    <span className="font-mono text-slate-200">{selectedHospital.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      // Navigate to Hospital Portal with this hospital loaded
                      openHospitalPortalForCancerHospital(selectedHospital);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-700 via-indigo-700 to-teal-800 hover:from-teal-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4 text-teal-200" />
                    <span>Open {selectedHospital.shortName} Hospital Portal →</span>
                  </button>

                  <button
                    onClick={() => {
                      // Navigate to AI Clinical Hub oncology trials with this cancer hospital
                      openAiModule('oncology_trials');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe2 className="h-4 w-4" />
                    <span>Match Clinical Trials & Cellular Protocols (AI)</span>
                  </button>

                  <button
                    onClick={() => {
                      // Navigate to AI Clinical Hub BioMatch ML simulator
                      openAiModule('biomatch_ml');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white font-semibold text-xs border border-teal-800/60 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                    <span>Simulate BioMatch ML™ Survival Prognosis</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => centerOnHospital(selectedHospital)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-teal-400" />
                      <span>Recenter on Map</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selectedHospital.name} ${selectedHospital.city} ${selectedHospital.country}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      <span>Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Quick Switcher of other hospitals in same region */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                    Browse All {filteredHospitals.length} Centers:
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {filteredHospitals.map(h => (
                      <button
                        key={h.id}
                        onClick={() => centerOnHospital(h)}
                        className={`w-full p-2 rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          selectedHospital?.id === h.id
                            ? 'bg-teal-950/80 border border-teal-700 text-teal-200 font-semibold'
                            : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs truncate">{h.shortName}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">{h.city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* All Hospitals List if none selected */
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800 p-2 text-xs">
                {filteredHospitals.map(h => (
                  <button
                    key={h.id}
                    onClick={() => centerOnHospital(h)}
                    className="w-full p-3 text-left hover:bg-slate-800/80 rounded-xl transition cursor-pointer space-y-1 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{h.shortName}</span>
                      <span className="text-[10px] text-teal-400 font-mono">{h.city}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{h.globalRanking}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Footer Info Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-500" />
          <span>Global Oncology Coordination adheres strictly to WHO Guiding Principles & National Organ Transplant Act regulations.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Active Centers: <strong className="text-slate-300">{WORLD_CANCER_HOSPITALS.length}</strong></span>
          <span>Coverage: 5 Continents</span>
        </div>
      </div>
    </div>
  );
};
