/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { EthicsBanner } from './components/common/EthicsBanner';
import { EmergencyTicker } from './components/common/EmergencyTicker';
import { Navbar } from './components/common/Navbar';
import { EthicsModal } from './components/common/EthicsModal';
import { ReportModal } from './components/common/ReportModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { DonorFinder } from './components/discovery/DonorFinder';
import { RequestsHub } from './components/requests/RequestsHub';
import { CreateRequestModal } from './components/requests/CreateRequestModal';
import { RequestDetailModal } from './components/requests/RequestDetailModal';
import { DonorRegistrationModal } from './components/donate/DonorRegistrationModal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AIClinicalHub } from './components/ai/AIClinicalHub';
import { RegistrationsDatabaseView } from './components/database/RegistrationsDatabaseView';
import { RegistrationsAuthWrapper } from './components/database/RegistrationsAuthWrapper';
import { DonorDetailModal } from './components/discovery/DonorDetailModal';
import { HeartHandshake, ShieldCheck, Lock, Heart, FileCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedRequest,
    setSelectedRequest,
    selectedDonor,
    setSelectedDonor,
    setIsEthicsModalOpen
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Legal & Safety Ethics Banner */}
      <EthicsBanner />

      {/* 2. Emergency Active Ticker */}
      <EmergencyTicker />

      {/* 3. Top Navigation Bar (3-Zone Top Bar Contract) */}
      <Navbar />

      {/* 4. Active Content Tab View */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'find-donors' && <DonorFinder />}
        {activeTab === 'requests' && <RequestsHub />}
        {activeTab === 'hospital' && <HospitalPortal />}
        {activeTab === 'ai-suite' && <AIClinicalHub />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'registrations' && (
          <RegistrationsAuthWrapper>
            <RegistrationsDatabaseView />
          </RegistrationsAuthWrapper>
        )}
      </main>

      {/* Modals & Dialogs */}
      <CreateRequestModal />
      <DonorRegistrationModal />
      <EthicsModal />
      <ReportModal />
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {selectedDonor && (
        <DonorDetailModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}

      {/* Clean Professional Healthcare Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Column 1: Platform Wordmark & Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="h-6 w-6 rounded bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                  DF
                </div>
                <span>Dofi</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                4-in-1 Healthcare Donor & Recipient Assistance Platform uniting Blood, Organ, Bone Marrow & Tissue, and Hair donation under verified clinical oversight.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 900, behavior: 'smooth' });
                  }}
                  className="text-teal-400 hover:text-teal-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Patient Success Stories →</span>
                </button>
              </div>
            </div>

            {/* Column 2: 4 Donation Programs */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Programs & Registries
              </div>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => { setActiveTab('find-donors'); }} className="hover:text-white transition-colors">Blood & Platelet Apheresis</button></li>
                <li><button onClick={() => { setActiveTab('find-donors'); }} className="hover:text-white transition-colors">Living & Deceased Organ Pledges</button></li>
                <li><button onClick={() => { setActiveTab('find-donors'); }} className="hover:text-white transition-colors">Bone Marrow HLA & Allografts</button></li>
                <li><button onClick={() => { setActiveTab('find-donors'); }} className="hover:text-white transition-colors">Hair for Pediatric Cranial Prosthetics</button></li>
              </ul>
            </div>

            {/* Column 3: Clinical & Ethics Compliance */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Clinical Governance
              </div>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">National Organ Transplant Act (NOTA)</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">WHO Guiding Principles on Transplantation</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">FDA Blood Banking & Serology Standards</button></li>
                <li><button onClick={() => setIsEthicsModalOpen(true)} className="hover:text-white transition-colors">Zero-Commercialization Mandate</button></li>
              </ul>
            </div>

            {/* Column 4: Hospital & Emergency Dispatch */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Clinical Dispatch
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                24/7 STAT Emergency Blood & Organ Matching coordination line accessible to accredited trauma centers and transplant boards.
              </p>
              <div className="text-teal-400 font-mono text-xs font-bold pt-1">
                +1 (800) 555-CARE (2273)
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Dofi. All clinical matching and procedural operations conducted through accredited healthcare entities.
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                <span>Strict Non-Commercial Platform</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
