import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Mail,
  Heart,
  Droplet,
  Bone,
  Scissors,
  Lock,
  Flag,
  X,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { DonorProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { DonationScheduler } from './DonationScheduler';

interface DonorDetailModalProps {
  donor: DonorProfile | null;
  onClose: () => void;
}

export const DonorDetailModal: React.FC<DonorDetailModalProps> = ({ donor, onClose }) => {
  const { setReportingTarget, setIsReportModalOpen, currentUser, openAiWithDonor } = useApp();
  const [connectMessageSent, setConnectMessageSent] = useState(false);

  if (!donor) return null;

  const handleReport = () => {
    setReportingTarget({
      id: donor.id,
      name: donor.donorName,
      type: 'donor'
    });
    setIsReportModalOpen(true);
  };

  const handleInitiateReferral = () => {
    setConnectMessageSent(true);
    setTimeout(() => setConnectMessageSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-xs flex items-center justify-center text-slate-500 font-bold text-lg">
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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{donor.donorName}</h3>
                {donor.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Donor
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>{donor.city}, {donor.state}</span>
                <span>·</span>
                <span className="font-mono text-emerald-700 font-medium">{donor.distanceKm} km away</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Availability and Stats Ribbon */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Availability</span>
              <span className="text-xs font-bold text-slate-900 capitalize">
                {donor.availabilityStatus.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Total Donations</span>
              <span className="text-xs font-bold text-teal-700 tabular-nums">
                {donor.totalDonationsCount} Lifesaving Acts
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Last Contribution</span>
              <span className="text-xs font-bold text-slate-700">
                {donor.lastDonationDate || 'Recently Cleared'}
              </span>
            </div>
          </div>

          {/* Verification Badge Details */}
          <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-lg flex items-center gap-2.5 text-teal-900">
            <FileCheck2 className="h-4 w-4 text-teal-600 shrink-0" />
            <div>
              <div className="font-bold text-[11px] text-teal-950">Clinical Verification Status</div>
              <div className="text-[11px] text-teal-800">{donor.verificationBadge}</div>
            </div>
          </div>

          {/* Category Specific Sections */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Category Clearances & Specifications
            </h4>

            {donor.bloodDetails && (
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                    <Droplet className="h-4 w-4 text-rose-600" />
                    <span>Blood Banking Clearance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-bold text-xs">
                    {donor.bloodDetails.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Components Cleared:</span>{' '}
                    <span className="font-medium text-slate-800 capitalize">
                      {donor.bloodDetails.components.map(c => c.replace('_', ' ')).join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Hemoglobin:</span>{' '}
                    <span className="font-medium text-slate-800 font-mono">
                      {donor.bloodDetails.hemoglobinLevel || '14.5 g/dL'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {donor.organDetails && (
              <div className="p-3.5 rounded-lg border border-teal-200 bg-teal-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                    <Heart className="h-4 w-4 text-teal-600" />
                    <span>Organ Pledge & Registry Link</span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                    Registry Ref: {donor.organDetails.transplantCenterRegistryId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Pledged Organs:</strong>{' '}
                  {donor.organDetails.organsPledged.map(o => o.replace('_', ' ')).join(', ')}
                </p>
                <p className="text-[10px] text-teal-800 bg-teal-100/50 p-2 rounded border border-teal-200/60">
                  Non-Commercial Mandate: Organ matches are facilitated strictly through accredited transplant hospitals. Direct commercial solicitation is illegal under NOTA.
                </p>
              </div>
            )}

            {donor.boneTissueDetails && (
              <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                    <Bone className="h-4 w-4 text-indigo-600" />
                    <span>Bone Marrow & Tissue Registry</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Swab Kit: {donor.boneTissueDetails.swabKitStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Available Tissues:</span>{' '}
                  <span className="font-medium text-slate-800 capitalize">
                    {donor.boneTissueDetails.tissueTypes.map(t => t.replace('_', ' ')).join(', ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="text-slate-400">Registry ID:</span>{' '}
                  <span className="font-mono text-indigo-700 font-medium">
                    {donor.boneTissueDetails.marrowRegistryId}
                  </span>
                </div>
              </div>
            )}

            {donor.hairDetails && (
              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Scissors className="h-4 w-4 text-amber-600" />
                    <span>Hair Donation Specifications</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {donor.hairDetails.lengthInches} Inches
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Condition:</span>{' '}
                    <span className="font-medium text-slate-800 capitalize">
                      {donor.hairDetails.condition.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Color / Texture:</span>{' '}
                    <span className="font-medium text-slate-800 capitalize">
                      {donor.hairDetails.color} ({donor.hairDetails.texture})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Donation Procedure Scheduler Feature */}
          <DonationScheduler donor={donor} />

          {/* Privacy & Mediation Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-slate-500">
            <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-700">Patient Privacy Protection:</span>{' '}
              This donor uses <strong className="text-slate-800 capitalize">{donor.privacySetting.replace('_', ' ')}</strong> mode. Phone number and full address remain protected until an authorized hospital coordinator approves the clinical cross-match.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReport}
            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Report Concern</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                openAiWithDonor(donor);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-600 hover:to-indigo-700 text-white font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              <span>AI Cross-Match</span>
            </button>

            {connectMessageSent ? (
              <span className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                <span>Referral Request Dispatched!</span>
              </span>
            ) : (
              <button
                onClick={handleInitiateReferral}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Initiate Hospital Coordination</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
