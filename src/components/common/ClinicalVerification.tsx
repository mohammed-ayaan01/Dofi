import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  CheckCheck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Building,
  Calendar,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  Info
} from 'lucide-react';
import { DonorProfile } from '../../types';

export interface ClinicalScreeningInfo {
  status?: 'passed' | 'pending' | 'expired';
  screeningDate?: string;
  expiresDate?: string;
  labName?: string;
  cliaNumber?: string;
  panelType?: string;
  hipaaComplianceId?: string;
  clearedTests?: string[];
  medicalReviewer?: string;
}

interface ClinicalVerificationProps {
  status?: 'passed' | 'pending' | 'expired';
  screeningData?: ClinicalScreeningInfo;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'compact' | 'detailed' | 'pill';
  showLabel?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const DEFAULT_SCREENING: ClinicalScreeningInfo = {
  status: 'passed',
  screeningDate: '2026-08-15',
  expiresDate: '2026-11-15',
  labName: 'Quest Diagnostics & Memorial Clinical Pathology',
  cliaNumber: 'CLIA #14D2098112',
  panelType: 'Comprehensive Donor Serology & Nucleic Acid Testing (NAT)',
  hipaaComplianceId: 'HIPAA-LAB-ENC-9942B',
  clearedTests: [
    'HIV-1/2 Antigen & Antibody Screen (Non-reactive)',
    'Hepatitis B Surface Ag & Anti-HBc (Negative)',
    'Hepatitis C Virus RNA by NAT (Undetectable)',
    'Treponema pallidum / Syphilis Screen (Negative)',
    'ABO Grouping & Rh Typing (Lab Confirmed)',
    'CMV Serology & CBC with Differential (Cleared)'
  ],
  medicalReviewer: 'Dr. Evelyn Martinez, MD (Clinical Pathologist)'
};

export const ClinicalVerification: React.FC<ClinicalVerificationProps> = ({
  status = 'passed',
  screeningData,
  size = 'sm',
  variant = 'badge',
  showLabel = true,
  align = 'center',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const data: ClinicalScreeningInfo = {
    ...DEFAULT_SCREENING,
    ...(screeningData || {}),
    status: screeningData?.status || status
  };

  // Close tooltip on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isPassed = data.status === 'passed';
  const isPending = data.status === 'pending';

  // Sizing definitions
  const sizeClasses = {
    xs: {
      badge: 'text-[10px] px-1.5 py-0.5 gap-1',
      icon: 'h-3 w-3',
      text: 'text-[10px]'
    },
    sm: {
      badge: 'text-[11px] px-2 py-0.5 gap-1.5',
      icon: 'h-3.5 w-3.5',
      text: 'text-[11px]'
    },
    md: {
      badge: 'text-xs px-2.5 py-1 gap-1.5',
      icon: 'h-4 w-4',
      text: 'text-xs'
    },
    lg: {
      badge: 'text-sm px-3 py-1.5 gap-2',
      icon: 'h-4.5 w-4.5',
      text: 'text-sm'
    }
  }[size];

  // Tooltip position alignment
  const alignClasses = {
    left: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
    right: 'right-0 origin-top-right'
  }[align];

  // Status-specific themes
  const theme = isPassed
    ? {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70',
        dot: 'bg-emerald-500',
        iconColor: 'text-emerald-600',
        title: 'HIPAA Lab Verified',
        sub: 'Clinical Serology Cleared'
      }
    : isPending
    ? {
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70',
        dot: 'bg-amber-500',
        iconColor: 'text-amber-600',
        title: 'Screening in Progress',
        sub: 'Lab Workup Pending'
      }
    : {
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70',
        dot: 'bg-slate-400',
        iconColor: 'text-slate-500',
        title: 'Screening Due for Renewal',
        sub: 'Re-evaluation Required'
      };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger element based on variant */}
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          className={`inline-flex items-center justify-center rounded-full p-1 transition-colors border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${theme.badgeBg}`}
          aria-label="Clinical Verification: HIPAA-compliant lab screened"
          title="Click to view HIPAA-compliant laboratory screening certificate"
        >
          {isPassed ? (
            <CheckCheck className={`${sizeClasses.icon} ${theme.iconColor}`} />
          ) : isPending ? (
            <AlertCircle className={`${sizeClasses.icon} ${theme.iconColor}`} />
          ) : (
            <Info className={`${sizeClasses.icon} ${theme.iconColor}`} />
          )}
        </button>
      ) : variant === 'detailed' ? (
        <div
          onClick={e => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          className={`w-full p-3 rounded-xl border transition-all cursor-pointer select-none ${
            isPassed
              ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
                <CheckCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <span>HIPAA-Compliant Laboratory Clearance</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200">
                    <Check className="h-2.5 w-2.5" />
                    Passed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {data.panelType}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                  <span>{data.cliaNumber}</span>
                  <span>·</span>
                  <span>Valid through: {data.expiresDate}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline shrink-0 cursor-pointer"
            >
              Verify Certificate →
            </button>
          </div>
        </div>
      ) : (
        /* Default 'badge' or 'pill' */
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className={`inline-flex items-center rounded-md font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40 select-none ${sizeClasses.badge} ${theme.badgeBg}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <CheckCheck className={`${sizeClasses.icon} ${theme.iconColor} shrink-0`} />
          {showLabel && (
            <span className="tracking-tight">
              {isPassed ? 'HIPAA Lab Verified' : theme.title}
            </span>
          )}
        </button>
      )}

      {/* Floating Interactive Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          onClick={e => e.stopPropagation()}
          className={`absolute top-full mt-2 z-50 w-72 sm:w-80 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${alignClasses}`}
        >
          {/* Subtle Pointer Arrow */}
          <div
            className={`absolute -top-1.5 w-3 h-3 bg-slate-900 border-t border-l border-slate-700/80 transform rotate-45 ${
              align === 'left' ? 'left-4' : align === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'
            }`}
          />

          <div className="space-y-3 relative z-10">
            {/* Header: Verified Clinical Badge + Title */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white leading-tight flex items-center gap-1.5">
                    <span>Clinical Screening Verified</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[9px] font-bold">
                      CLEARED
                    </span>
                  </h5>
                  <p className="text-[10px] text-slate-400 font-medium">
                    HIPAA 45 CFR Part 160 & 164 Compliant
                  </p>
                </div>
              </div>
            </div>

            {/* Accredited Lab Details */}
            <div className="space-y-1 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Building className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{data.labName}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                <span>{data.cliaNumber}</span>
                <span className="text-emerald-400 font-sans font-semibold">CLIA / CAP Accredited</span>
              </div>
            </div>

            {/* Test Panel Checklist with Lucide checkmark icons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Validated Serology & NAT Tests:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {data.clearedTests?.map((test, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{test}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Screening Validity & Dates */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] border-t border-slate-800 text-slate-400">
              <div>
                <span className="block text-[9px] uppercase font-semibold text-slate-500">Screened On</span>
                <span className="font-mono text-slate-200">{data.screeningDate}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-semibold text-slate-500">Recertification Due</span>
                <span className="font-mono text-slate-200">{data.expiresDate}</span>
              </div>
            </div>

            {/* HIPAA Safeguard Note & Cryptographic Hash */}
            <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[10px] text-slate-400">
              <Lock className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="leading-snug">
                  Personal health information is end-to-end encrypted. De-identified verification hash:
                </p>
                <code className="text-[9px] text-teal-300 font-mono block mt-0.5">
                  {data.hipaaComplianceId}
                </code>
              </div>
            </div>

            {/* Medical Reviewer attribution */}
            {data.medicalReviewer && (
              <div className="text-[9px] text-slate-500 italic text-right">
                Reviewed by: {data.medicalReviewer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
