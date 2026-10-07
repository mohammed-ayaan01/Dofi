/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  FileText,
  RefreshCw,
  Info,
  Droplet,
  Scale,
  Calendar,
  Pill,
  Activity,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BLOOD_DONOR_DEMO_POLICY } from '../../data/donorPolicy';
import { BloodGroup, DonorEligibilityScreeningResult } from '../../types';
import { downloadEligibilityPDF, createEligibilityPDF } from '../../utils/generateEligibilityPDF';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const DonorAIToolsView: React.FC = () => {
  const { currentUser, firebaseUser, donors } = useApp();

  const currentDonorProfile = donors.find(d => d.userId === currentUser.id || (firebaseUser && d.userId === firebaseUser.uid))
    || (currentUser.role === 'donor' ? donors.find(d => d.id === 'dnr_001') : undefined);

  // Form State
  const [candidateName, setCandidateName] = useState(currentUser.name || 'Marcus Vance');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    (currentDonorProfile?.bloodDetails?.bloodGroup as BloodGroup) || 'O+'
  );
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [hemoglobin, setHemoglobin] = useState<number>(14.2);
  const [lastDonatedMonths, setLastDonatedMonths] = useState<number | ''>(4);
  const [recentMedicationAspirin, setRecentMedicationAspirin] = useState<boolean>(false);
  const [recentFeverInfection, setRecentFeverInfection] = useState<boolean>(false);

  // Execution & Output State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [screeningResult, setScreeningResult] = useState<DonorEligibilityScreeningResult | null>(null);
  const [profileSyncNotice, setProfileSyncNotice] = useState<string | null>(null);

  // Quick Preset Handlers
  const applyPreset = (type: 'eligible' | 'deferral_infection' | 'underweight' | 'aspirin') => {
    setErrorBanner(null);
    if (type === 'eligible') {
      setAge(28);
      setWeightKg(68);
      setHemoglobin(14.2);
      setLastDonatedMonths(4);
      setRecentMedicationAspirin(false);
      setRecentFeverInfection(false);
    } else if (type === 'deferral_infection') {
      setAge(31);
      setWeightKg(72);
      setHemoglobin(13.8);
      setLastDonatedMonths(5);
      setRecentMedicationAspirin(false);
      setRecentFeverInfection(true); // Active/recent infection
    } else if (type === 'underweight') {
      setAge(22);
      setWeightKg(46); // Under 50kg
      setHemoglobin(12.1);
      setLastDonatedMonths(6);
      setRecentMedicationAspirin(false);
      setRecentFeverInfection(false);
    } else if (type === 'aspirin') {
      setAge(35);
      setWeightKg(75);
      setHemoglobin(15.0);
      setLastDonatedMonths(3);
      setRecentMedicationAspirin(true); // Aspirin intake
      setRecentFeverInfection(false);
    }
  };

  const handleRunScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorBanner(null);
    setProfileSyncNotice(null);

    try {
      const response = await fetch('/api/ai/donor-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName,
          bloodGroup,
          age: Number(age),
          weightKg: Number(weightKg),
          hemoglobin: Number(hemoglobin),
          lastDonatedMonths: lastDonatedMonths === '' ? null : Number(lastDonatedMonths),
          recentMedicationAspirin,
          recentFeverInfection,
        }),
      });

      const rawText = await response.text();
      let json: any = null;
      if (rawText && rawText.trim().length > 0) {
        try {
          json = JSON.parse(rawText);
        } catch {
          json = null;
        }
      }

      if (!response.ok) {
        const code = json?.code;
        const msg = json?.error;

        if (response.status === 503 || code === 'MISSING_API_KEY') {
          throw new Error('AI service is not configured.');
        } else if (response.status === 429 || code === 'QUOTA_EXCEEDED') {
          throw new Error('AI service quota exceeded. Please try again later.');
        } else if (response.status === 401 || code === 'INVALID_API_KEY') {
          throw new Error('AI service authentication failed. Invalid API key.');
        } else if (response.status === 403 || code === 'API_FORBIDDEN') {
          throw new Error('AI service access forbidden.');
        } else if (code === 'NO_CANDIDATES' || code === 'EMPTY_CONTENT') {
          throw new Error('AI service returned no usable result. Please try again.');
        } else if (code === 'SCHEMA_MISMATCH' || code === 'MALFORMED_JSON') {
          throw new Error('AI service returned an invalid result. Please try again.');
        } else if (code === 'SAFETY_BLOCKED') {
          throw new Error('AI service request was blocked by content safety policies.');
        } else {
          throw new Error(msg || `Server returned error (${response.status})`);
        }
      }

      if (!json || !json.success || !json.data) {
        throw new Error('AI service returned no usable result. Please try again.');
      }

      const enriched: DonorEligibilityScreeningResult = {
        ...json.data,
        reportId: `DF-SCR-${Date.now().toString().slice(-6)}`,
        generatedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setScreeningResult(enriched);
    } catch (err: any) {
      console.error('[DonorAIToolsView] Screening error:', err);
      setErrorBanner(err.message || 'AI service returned an invalid result. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!screeningResult) return;
    downloadEligibilityPDF(screeningResult, candidateName, bloodGroup);
  };

  const handlePrintReport = () => {
    if (!screeningResult) return;
    const doc = createEligibilityPDF(screeningResult, candidateName, bloodGroup);
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  const handleApplyToProfile = () => {
    if (!screeningResult) return;
    // Store in local storage for the donor session
    try {
      const record = {
        status: screeningResult.status,
        statusLabel: screeningResult.statusLabel,
        evaluatedAt: new Date().toISOString(),
        candidateName,
        bloodGroup,
      };
      localStorage.setItem('dofi_latest_donor_screening', JSON.stringify(record));
      setProfileSyncNotice('Screening assessment logged to active donor session. Note: This preliminary triage does not replace certified on-site clinical screening.');
      setTimeout(() => setProfileSyncNotice(null), 7000);
    } catch (err) {
      console.warn('Failed to save screening record:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Clinical Tools — Donor Pre-Screening
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Evaluate preliminary blood donation eligibility against standard clinical demonstration criteria powered by Google Gemini. Generate verifiable A4 PDF reports for blood bank presentation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Droplet className="h-3.5 w-3.5 text-teal-600" />
            <span>Blood Donation Domain Only</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <span>Donor Role Protected</span>
          </span>
        </div>
      </div>

      {/* 2. Mandatory Medical Safety Callout Banner */}
      <aside aria-label="Clinical safety warning" className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs text-rose-900 leading-relaxed">
            <div className="font-bold text-sm text-rose-950 flex items-center gap-2">
              <span>Mandatory Medical Safety Notice — Preliminary Pre-Screening Only</span>
            </div>
            <p>
              This tool provides <strong>preliminary AI-assisted donor screening assessment</strong> based on reference blood banking guidelines. It is <strong>NOT a definitive medical approval, medical clearance, or guarantee of eligibility</strong>.
            </p>
            <p className="text-rose-800">
              Final donor qualification, physical hemoglobin pinprick, blood pressure, and certified serological screening must be performed in-person by certified transfusion staff at the blood bank or hospital.
            </p>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace: Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form & Reference Policy (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleRunScreening} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                <span>Candidate Parameters</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Step 1 of 2
              </span>
            </div>

            {/* Quick Presets for Jury / Testers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">Quick Test Scenarios:</label>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset('eligible')}
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-left truncate transition cursor-pointer"
                >
                  ✓ Standard Eligible (28y, 68kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('deferral_infection')}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium text-left truncate transition cursor-pointer"
                >
                  ⏳ Recent Infection (14-day)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('underweight')}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 font-medium text-left truncate transition cursor-pointer"
                >
                  ⚠ Underweight (&lt;50 kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('aspirin')}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 font-medium text-left truncate transition cursor-pointer"
                >
                  💊 Aspirin Intake (48h)
                </button>
              </div>
            </div>

            {/* Candidate Name & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Age (Years)</label>
                  <span className="text-[10px] text-slate-400">Ref: 18–65</span>
                </div>
                <input
                  type="number"
                  min="16"
                  max="85"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Weight (kg)</label>
                  <span className="text-[10px] text-slate-400">Min: 50 kg</span>
                </div>
                <input
                  type="number"
                  min="30"
                  max="200"
                  step="0.5"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
            </div>

            {/* Hemoglobin & Interval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Hemoglobin (g/dL)</label>
                  <span className="text-[10px] text-slate-400">Min: 12.5–13.0</span>
                </div>
                <input
                  type="number"
                  min="8"
                  max="20"
                  step="0.1"
                  required
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(Number(e.target.value))}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Last Donated (Months)</label>
                  <span className="text-[10px] text-slate-400">Min: ≥3 mo</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={lastDonatedMonths}
                  onChange={(e) => setLastDonatedMonths(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Leave empty if first-time"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
            </div>

            {/* Medication & Infection Toggles */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={recentMedicationAspirin}
                  onChange={(e) => setRecentMedicationAspirin(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900">Recent Aspirin / NSAID Intake (Past 48 Hours)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Temporarily inhibits platelet aggregation. May require 48-hour platelet deferral (whole blood donation remains acceptable).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={recentFeverInfection}
                  onChange={(e) => setRecentFeverInfection(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900">Recent Fever, Cough, or Acute Infection (Past 14 Days)</span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Donors must be fully symptom-free from febrile illnesses or active systemic infections for at least 14 days before donation.
                  </span>
                </div>
              </label>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-semibold">AI Evaluation Failed</strong>
                  <span className="font-medium text-rose-950 block">{errorBanner}</span>
                  <p className="text-[11px] text-rose-700">
                    Dofi operates under a strict clinical integrity policy and does not fabricate mock evaluation data.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Sync Notice */}
            {profileSyncNotice && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-start gap-2">
                <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{profileSyncNotice}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-teal-200" />
                  <span>Evaluating Parameters with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-teal-200" />
                  <span>Generate AI Donor Eligibility Report</span>
                </>
              )}
            </button>
          </form>

          {/* Configurable Demonstration Policy Reference Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-800">Demo Reference Policy</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                WHO / AABB Reference
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {BLOOD_DONOR_DEMO_POLICY.policyName}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Age Limit</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {BLOOD_DONOR_DEMO_POLICY.criteria.age.min}–{BLOOD_DONOR_DEMO_POLICY.criteria.age.max} {BLOOD_DONOR_DEMO_POLICY.criteria.age.unit}
                </div>
              </div>

              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Min Weight</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  ≥ {BLOOD_DONOR_DEMO_POLICY.criteria.weight.minKg} {BLOOD_DONOR_DEMO_POLICY.criteria.weight.unit}
                </div>
              </div>

              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Min Hemoglobin</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  ≥ {BLOOD_DONOR_DEMO_POLICY.criteria.hemoglobin.generalMin} {BLOOD_DONOR_DEMO_POLICY.criteria.hemoglobin.unit}
                </div>
              </div>

              <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Whole Blood Interval</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  ≥ {BLOOD_DONOR_DEMO_POLICY.criteria.donationIntervalMonths.wholeBloodMinMonths} {BLOOD_DONOR_DEMO_POLICY.criteria.donationIntervalMonths.unit}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic border-t border-slate-200/60 pt-2 leading-relaxed">
              {BLOOD_DONOR_DEMO_POLICY.disclaimer}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Screening Report & Downloadable Artifact (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* State 1: Loading Skeleton */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-pulse">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-200 rounded"></div>
                  <div className="h-3 w-64 bg-slate-100 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          )}

          {/* State 2: Empty / Initial Guide State */}
          {!isLoading && !screeningResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center ring-1 ring-teal-500/20">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Ready for AI Clinical Pre-Screening
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fill in your clinical parameters on the left or select a quick test scenario to evaluate donation fitness under standard blood banking references.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>6 Clinical Checks</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Age, weight, hemoglobin, donation rest interval, NSAID/aspirin, and active symptoms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-teal-600" />
                    <span>Vector A4 PDF</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clean printable and downloadable report ready to take directly to the hospital blood bank.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    <span>Safety Guaranteed</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Transparent triage and zero claims of final medical clearance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* State 3: Screening Report Result Card */}
          {!isLoading && screeningResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 tracking-tight text-lg">DOFI</span>
                    <span className="text-xs text-slate-500 font-medium">| Clinical Screening Report</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>ID: <code className="font-mono text-slate-700 font-bold">{screeningResult.reportId}</code></span>
                    <span>•</span>
                    <span>Date: {screeningResult.generatedAt}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {screeningResult.status === 'eligible_for_review' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Eligible for Review</span>
                    </span>
                  )}
                  {screeningResult.status === 'temporarily_deferred' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Temporarily Deferred</span>
                    </span>
                  )}
                  {screeningResult.status === 'needs_manual_review' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
                      <AlertTriangle className="h-4 w-4 text-indigo-600" />
                      <span>Needs Manual Review</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate Info Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Candidate</span>
                  <span className="font-bold text-slate-900 truncate block">{candidateName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Blood Group</span>
                  <span className="font-bold text-teal-700">{bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Age / Weight</span>
                  <span className="font-bold text-slate-800">{age} yrs / {weightKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Hemoglobin</span>
                  <span className="font-bold text-slate-800">{hemoglobin} g/dL</span>
                </div>
              </div>

              {/* Status Banner Explanation */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  screeningResult.status === 'eligible_for_review'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : screeningResult.status === 'temporarily_deferred'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {screeningResult.statusLabel || (
                    screeningResult.status === 'eligible_for_review'
                      ? 'Preliminary Criteria Satisfied'
                      : screeningResult.status === 'temporarily_deferred'
                      ? 'Temporary Deferral Recommended'
                      : 'Clinical Evaluation Recommended'
                  )}
                </div>
                <p>{screeningResult.summary}</p>
              </div>

              {/* Parameter Evaluation Table */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Evaluated Parameters Breakdown
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {(screeningResult.parameters || []).map((param, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition">
                      <div className="space-y-0.5 sm:max-w-[60%]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{param.name}</span>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {param.value}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          {param.reason}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {param.status === 'pass' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="h-3 w-3 text-emerald-600" />
                            Pass
                          </span>
                        )}
                        {param.status === 'review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Review
                          </span>
                        )}
                        {param.status === 'flag' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            Flag
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Box */}
              {screeningResult.recommendation && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900 block">Next Steps &amp; Recommendations:</span>
                  <p className="text-slate-600 leading-relaxed">{screeningResult.recommendation}</p>
                </div>
              )}

              {/* Disclaimer Notice */}
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 leading-relaxed">
                <strong className="text-slate-700">Clinical Disclaimer:</strong> {screeningResult.disclaimer}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-xs hover:shadow transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF Report</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    <span>Print Report</span>
                  </button>
                </div>

                <button
                  onClick={handleApplyToProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 text-teal-600" />
                  <span>Log to Session Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
