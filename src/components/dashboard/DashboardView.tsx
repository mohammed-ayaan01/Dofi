import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  AlertCircle,
  Building,
  Heart,
  Search,
  PlusCircle,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Dna,
  Eye,
  Globe2,
  BrainCircuit,
  ArrowRight,
  ArrowUp,
  Radio,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeadlinesWidget } from './DeadlinesWidget';
import { CategoryPillars } from './CategoryPillars';
import { DonationImpactCharts } from './DonationImpactCharts';
import { PatientSuccessStories } from '../stories/PatientSuccessStories';
import { ExternalStatsWidget } from './ExternalStatsWidget';
import { HERO_IMAGE } from '../../data/mockData';
import { DonationCategory } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    impactStats,
    requests,
    donors,
    setSelectedRequest,
    setSelectedDonor,
    setActiveTab,
    setIsCreateRequestModalOpen,
    setIsRegisterDonorModalOpen,
    openAiModule,
    // Live Firestore-backed counts
    liveActiveRequests,
    liveCriticalEmergencies,
    liveBloodRequests,
    liveOrganRequests,
    liveAvailableDonors,
    liveRegisteredDonors,
    liveRegisteredUsers
  } = useApp();

  const [activeListTab, setActiveListTab] = useState<'requests' | 'donors'>('requests');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('section-hero');

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setShowScrollTop(currentScroll > 250);
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }

      // Track active section for scroller tabs
      const sectionIds = [
        'section-hero',
        'section-stats',
        'section-ai-lab',
        'section-deadlines',
        'section-impact',
        'section-pillars',
        'section-stories',
        'section-feed'
      ];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine if there is any live platform activity at all
  const hasLiveActivity = liveActiveRequests > 0 || liveRegisteredDonors > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-smooth relative">
      {/* 1. Live Platform Activity Scroller Strip — Firestore-backed */}
      <div className="bg-slate-900 text-white rounded-xl p-2.5 border border-slate-800 shadow-xs flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
          <Radio className="h-3 w-3 animate-ping" />
          <span>Live Activity</span>
        </div>
        <div className="overflow-x-auto scrollbar-none flex items-center gap-6 text-xs whitespace-nowrap py-0.5">
          {!hasLiveActivity ? (
            <span className="flex items-center gap-2 text-slate-400 shrink-0 italic text-[11px]">
              No live platform activity yet — sign in and create a request to get started
            </span>
          ) : (
            <>
              {/* Active donation requests — Firestore */}
              <span className="flex items-center gap-2 text-slate-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span className="font-semibold text-white">{liveActiveRequests} active donation request{liveActiveRequests !== 1 ? 's' : ''}</span>
              </span>
              {/* Available donors — Firestore */}
              <span className="flex items-center gap-2 text-slate-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="font-semibold text-white">{liveAvailableDonors} donor{liveAvailableDonors !== 1 ? 's' : ''} available now</span>
              </span>
              {/* Registered donors total — Firestore */}
              {liveRegisteredDonors > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">{liveRegisteredDonors} registered donor{liveRegisteredDonors !== 1 ? 's' : ''}</span>
                </span>
              )}
              {/* Per-category breakdown — Firestore */}
              {liveBloodRequests > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="font-semibold text-white">{liveBloodRequests} blood request{liveBloodRequests !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-bold uppercase">blood</span>
                </span>
              )}
              {liveOrganRequests > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="font-semibold text-white">{liveOrganRequests} organ request{liveOrganRequests !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded font-bold uppercase">organ</span>
                </span>
              )}
              {liveCriticalEmergencies > 0 && (
                <span className="flex items-center gap-2 text-slate-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span className="font-semibold text-rose-300">{liveCriticalEmergencies} critical emergency{liveCriticalEmergencies !== 1 ? 's' : ''}</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>


      {/* 2. Interactive Sticky Section Scroller Bar */}
      <nav aria-label="Section scroller" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-2 px-3 sm:px-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 sm:gap-3 transition-all">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
          <Layers className="h-3.5 w-3.5 text-teal-600" />
          <span className="uppercase tracking-wider text-[11px] text-slate-600 font-bold hidden sm:inline">Scroller:</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs font-semibold">
          {[
            { id: 'section-hero', label: 'Overview', icon: '⚡' },
            { id: 'section-stats', label: 'Metrics', icon: '📊' },
            { id: 'section-ai-lab', label: 'AI Lab', icon: '🧠' },
            { id: 'section-deadlines', label: 'STAT Queue', icon: '⏱️' },
            { id: 'section-impact', label: 'Impact', icon: '📈' },
            { id: 'section-pillars', label: '4 Programs', icon: '🧬' },
            { id: 'section-stories', label: 'Stories', icon: '❤️' },
            { id: 'section-feed', label: 'Live Feed', icon: '📋' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                activeSection === item.id
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section id="section-hero" className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Hospital transplant and clinical donor matching coordination center"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/70" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Certified Healthcare Intermediary Network</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connecting Lifesaving Donors with Verified Patients & Hospitals
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A secure 4-in-1 platform integrating <strong className="text-white">Blood</strong>, <strong className="text-white">Organ</strong>, <strong className="text-white">Bone & Tissue</strong>, and <strong className="text-white">Hair</strong> donation under strict clinical ethics and anti-trafficking protocols.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateRequestModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs tracking-wide transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Request</span>
            </button>
            <button
              onClick={() => setIsRegisterDonorModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide transition-colors inline-flex items-center gap-2 backdrop-blur-xs"
            >
              <Heart className="h-4 w-4 text-rose-400" />
              <span>Register to Donate</span>
            </button>
            <button
              onClick={() => setActiveTab('find-donors')}
              className="px-4 py-2.5 text-xs text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Donors Near You</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const storiesEl = document.getElementById('patient-success-stories');
                if (storiesEl) storiesEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2.5 text-xs text-teal-300 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
              <span>Recipient Stories</span>
            </button>
          </div>
        </div>
      </section>

      {/* High-density Impact Stats Grid — Firestore-backed */}
      <section id="section-stats" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Requests</span>
            <Activity className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {liveActiveRequests}
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Live · Firestore</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Available Donors</span>
            <Users className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {liveAvailableDonors}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">Live · Ready now / 24h</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Emergency STAT</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {liveCriticalEmergencies}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">Live · Immediate triage</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Registered Donors</span>
            <Building className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {liveRegisteredDonors}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Live · Firestore</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Registered Users</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {liveRegisteredUsers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Live · Firebase Auth</div>
        </div>
      </section>

      {/* External Reference Data — NOTTO & e-RaktKosh */}
      <ExternalStatsWidget />

      {/* AI & Machine Learning Intelligence Spotlight */}
      <section id="section-ai-lab" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  BioMatch AI & Machine Learning Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-400 text-slate-950">
                  8 Engines
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calibrated survival inference, computer vision specimen inspection, and global cancer trial matching.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-suite')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open All 8 AI Modules</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Spotlight 1: BioMatch ML */}
          <div
            onClick={() => openAiModule('biomatch_ml')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Dna className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono text-teal-300 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                C-Index 0.884
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-teal-300 transition-colors">
                BioMatch ML™ Prognostics
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                LightGBM ensemble simulating 5-year Kaplan-Meier survival curves and SHAP explainability.
              </p>
            </div>
            <div className="text-[10px] text-teal-400 font-bold flex items-center gap-1 pt-1">
              <span>Launch Simulator</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Spotlight 2: VisionLab */}
          <div
            onClick={() => openAiModule('vision_lab')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                Vision AI
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                VisionLab™ Specimen Scanner
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Computer vision measuring hair bundle length & cuticle integrity, blood tube volume, and cell viability.
              </p>
            </div>
            <div className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 pt-1">
              <span>Inspect Specimen</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Spotlight 3: Global Cancer Trials */}
          <div
            onClick={() => openAiModule('oncology_trials')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Globe2 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                World Map Linked
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                Global Cancer Trial Matcher
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Match patient biomarkers with CAR-T and allograft trials at MD Anderson, MSKCC, and world hubs.
              </p>
            </div>
            <div className="text-[10px] text-blue-400 font-bold flex items-center gap-1 pt-1">
              <span>Match Protocols</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Deadlines & Urgency Queue Widget */}
      <div id="section-deadlines">
        <DeadlinesWidget />
      </div>

      {/* Recharts Donation Impact Metrics */}
      <div id="section-impact">
        <DonationImpactCharts />
      </div>

      {/* 4-in-1 Category Pillars */}
      <div id="section-pillars">
        <CategoryPillars />
      </div>

      {/* Patient Success Stories & Recipient Testimonials */}
      <div id="section-stories">
        <PatientSuccessStories />
      </div>

      {/* Recent Activity: Requests vs Donors */}
      <section id="section-feed" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveListTab('requests')}
              className={`text-sm font-bold tracking-tight pb-1 border-b-2 transition-colors ${
                activeListTab === 'requests'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Latest Requisitions ({requests.length})
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveListTab('donors')}
              className={`text-sm font-bold tracking-tight pb-1 border-b-2 transition-colors ${
                activeListTab === 'donors'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Nearby Available Donors ({donors.length})
            </button>
          </div>

          <button
            onClick={() => setActiveTab(activeListTab === 'requests' ? 'requests' : 'find-donors')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeListTab === 'requests' ? (
          <div className="divide-y divide-slate-100">
            {requests.slice(0, 4).map(req => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
                      {req.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {req.hospitalName}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {req.deadlineDate}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {req.title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.urgency === 'emergency'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : req.urgency === 'urgent'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {req.urgency}
                  </span>
                  <span className="text-xs font-medium text-slate-500 capitalize">
                    {req.status.replace('_', ' ')}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {donors.slice(0, 4).map(donor => (
              <div
                key={donor.id}
                onClick={() => setSelectedDonor(donor)}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-900">
                      {donor.donorName}
                    </div>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {donor.distanceKm} km away
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {donor.city}, {donor.state}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {donor.categories.map(c => (
                      <span key={c} className="text-[10px] font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 capitalize">
                        {c.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {donor.totalDonationsCount} donations
                  </span>
                  <span className="text-teal-700 font-semibold text-[11px]">
                    View Profile →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Floating Scroll to Top & Section Scroller Controller */}
      {showScrollTop && (
        <aside
          aria-label="Floating page scroller"
          className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="relative group">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-11 w-11 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer border-2 border-white ring-2 ring-teal-500/30"
              title="Scroll to top of page"
              aria-label="Scroll to top of page"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none">
              Scroll to top ({Math.round(scrollProgress)}%)
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
