import React from 'react';
import { ShieldCheck, AlertTriangle, Building2, CheckCircle2, FileText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EthicsModal: React.FC = () => {
  const { isEthicsModalOpen, setIsEthicsModalOpen } = useApp();

  if (!isEthicsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-teal-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Safety, Ethics & Regulatory Compliance</h2>
              <p className="text-xs text-slate-500">Legal framework & clinical protection standards</p>
            </div>
          </div>
          <button
            onClick={() => setIsEthicsModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Key Principle 1 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Zero-Commercialization Mandate</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Under the National Organ Transplant Act (42 U.S.C. 274e) and international WHO Guiding Principles on Human Cell, Tissue and Organ Transplantation, it is unlawful for any person to knowingly acquire, receive, or otherwise transfer any human organ or tissue for valuable consideration.
              </p>
            </div>
          </div>

          {/* Core Safeguards */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 text-sm">Our 4 Pillars of Integrity:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                  <Building2 className="h-4 w-4 text-teal-600" />
                  <span>Licensed Intermediaries Only</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All clinical matches, blood collection, bone marrow cross-typing, and surgical procedures must occur at certified transplant hospitals or accredited blood/tissue repositories.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Identity & Serology Screening</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Donors undergo government ID validation, infectious disease serology, and blood-borne pathogen verification before any clinical handoff.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>Informed Voluntary Consent</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Donors retain complete autonomy to decline, pause, or withdraw their pledge at any stage prior to clinical collection without penalty or coercion.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  <span>Strict Data Privacy</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct personal phone numbers and residential addresses are masked. Organ donor matching is hospital-mediated by default to prevent illicit contact.
                </p>
              </div>
            </div>
          </div>

          {/* Reporting */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-900 mb-1">Reporting Violations:</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you observe any user attempting to solicit payment, broker unverified biological material, or falsify medical requirements, use the "Report" button on the profile or requisition. Reports are immediately routed to our 24/7 Clinical Compliance Committee.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsEthicsModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
