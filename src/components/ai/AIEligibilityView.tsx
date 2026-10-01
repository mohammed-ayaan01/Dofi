import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Heart,
  HelpCircle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  Flame,
  Check,
  Info
} from 'lucide-react';
import { DonationCategory, AIEligibilityResult } from '../../types';

export const AIEligibilityView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DonationCategory>('blood');
  const [mode, setMode] = useState<'conversational' | 'structured'>('conversational');

  // Conversational input
  const [freeformPrompt, setFreeformPrompt] = useState<string>(
    'I am 26, got a tattoo in a sterile studio 4 months ago, take iron supplements, weight is 145 lbs, and want to donate whole blood or platelets.'
  );

  // Structured fields
  const [donorAge, setDonorAge] = useState<string>('26');
  const [weightLbs, setWeightLbs] = useState<string>('145');
  const [hemoglobin, setHemoglobin] = useState<string>('13.8');
  const [medications, setMedications] = useState<string>('Daily multivitamin, no prescription blood thinners');
  const [recentTravel, setRecentTravel] = useState<string>('No travel outside the United States in past 3 years');
  const [pastSurgeries, setPastSurgeries] = useState<string>('Wisdom tooth extraction 2 years ago');
  const [tattoosPiercingsMonthsAgo, setTattoosPiercingsMonthsAgo] = useState<number>(4);
  const [chronicConditions, setChronicConditions] = useState<string>('None, no diabetes or cardiovascular disease');
  const [lifestyleNotes, setLifestyleNotes] = useState<string>('Non-smoker, exercises 3x per week');
  const [hairLengthInches, setHairLengthInches] = useState<number>(12);
  const [hairTreated, setHairTreated] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIEligibilityResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presetScenarios = [
    {
      label: 'Healthy First-Time Donor',
      category: 'blood' as DonationCategory,
      text: 'I am 22 years old, 150 lbs, never donated before. I have no tattoos or piercings, take no daily medications, and feel completely healthy.',
    },
    {
      label: 'Recent Tattoo / Piercing',
      category: 'blood' as DonationCategory,
      text: 'I am 28, 160 lbs. I got an ear piercing and small tattoo 2 months ago in a state-regulated shop. Hemoglobin is usually 14.1. Am I eligible today?',
    },
    {
      label: 'Platelet Donor on Aspirin',
      category: 'blood' as DonationCategory,
      text: 'I am 35, regular blood donor, but I took two aspirin tablets yesterday for a headache. Can I donate platelets or whole blood this afternoon?',
    },
    {
      label: 'Bone Marrow Registry Applicant',
      category: 'bone_tissue' as DonationCategory,
      text: 'I am 31 years old, weigh 170 lbs, have asthma well-controlled with an albuterol inhaler. Want to join the NMDP registry with a cheek swab kit.',
    },
    {
      label: 'Pediatric Wig Hair Donor',
      category: 'hair' as DonationCategory,
      text: 'I have 14 inches of virgin untreated brunette wavy hair. Never dyed or bleached. Can I mail it in for pediatric cancer wigs?',
    },
  ];

  const handleRunScreening = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload: any = {
      category: activeCategory,
    };

    if (mode === 'conversational') {
      payload.freeformDescription = freeformPrompt;
    } else {
      payload.donorAge = donorAge;
      payload.weightLbs = weightLbs;
      payload.hemoglobin = hemoglobin;
      payload.medications = medications;
      payload.recentTravel = recentTravel;
      payload.pastSurgeries = pastSurgeries;
      payload.tattoosPiercingsMonthsAgo = tattoosPiercingsMonthsAgo;
      payload.chronicConditions = chronicConditions;
      payload.lifestyleNotes = lifestyleNotes;
      if (activeCategory === 'hair') {
        payload.hairLengthInches = hairLengthInches;
        payload.hairTreated = hairTreated;
      }
    }

    try {
      const response = await fetch('/api/ai/screen-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Screening server error (${response.status})`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setModelUsed(resJson.modelUsed || 'Gemini 3.1 Flash Lite');
      } else {
        throw new Error(resJson.error || 'Failed to screen donor');
      }
    } catch (err: any) {
      console.error('Eligibility screening error:', err);
      setErrorMessage(err.message || 'Error executing AI screening');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FULLY_ELIGIBLE':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'CONDITIONALLY_ELIGIBLE':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'TEMPORARILY_DEFERRED':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'PERMANENTLY_INELIGIBLE':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-800/40">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span>AI Donor Safety & Triage Copilot</span>
            <span className="text-emerald-400/60">•</span>
            <span>FDA 21 CFR 640 & AABB Standards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Donor Eligibility & Deferral Roadmap
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Confidential clinical pre-screening across Blood & Platelets, Living Organ Pledges, Bone Marrow Registries, and Hair Donation. Know your eligibility before visiting the collection center.
          </p>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-fit">
        {[
          { id: 'blood', label: 'Blood & Apheresis' },
          { id: 'organ', label: 'Living Organ Pledge' },
          { id: 'bone_tissue', label: 'Bone Marrow Registry' },
          { id: 'hair', label: 'Hair for Cancer Wigs' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as DonationCategory)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mode Switcher & Presets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              Input Mode: How would you like to evaluate your eligibility?
            </h3>
            <p className="text-xs text-slate-500">
              Type your circumstances freely, or use our clinical checklist.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('conversational')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === 'conversational'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Natural Language Prompt
            </button>
            <button
              onClick={() => setMode('structured')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === 'structured'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Checklist
            </button>
          </div>
        </div>

        {/* Quick presets pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Clinical Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetScenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveCategory(sc.category);
                  setFreeformPrompt(sc.text);
                  setMode('conversational');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs text-slate-700 font-medium transition cursor-pointer"
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode A: Conversational */}
        {mode === 'conversational' ? (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Describe your current health, medications, recent travel, procedures, or questions:
            </label>
            <textarea
              rows={4}
              value={freeformPrompt}
              onChange={e => setFreeformPrompt(e.target.value)}
              placeholder="e.g., I am 29 years old, got a small wrist tattoo 5 weeks ago, take allergy medication..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-teal-600 transition leading-relaxed"
            />
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Your responses remain anonymous and are never stored without consent.</span>
              <span>Program: <strong className="text-slate-700 uppercase">{activeCategory}</strong></span>
            </div>
          </div>
        ) : (
          /* Mode B: Structured */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Donor Age</label>
              <input
                type="number"
                value={donorAge}
                onChange={e => setDonorAge(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Weight (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={e => setWeightLbs(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Recent Hemoglobin (g/dL)</label>
              <input
                type="text"
                value={hemoglobin}
                onChange={e => setHemoglobin(e.target.value)}
                placeholder="e.g. 13.5 (or Unknown)"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Current Medications</label>
              <input
                type="text"
                value={medications}
                onChange={e => setMedications(e.target.value)}
                placeholder="e.g. Blood thinners, aspirin, accutane, iron"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Most Recent Tattoo / Piercing</label>
              <select
                value={tattoosPiercingsMonthsAgo}
                onChange={e => setTattoosPiercingsMonthsAgo(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value={1}>Within last 30 days (1 mo)</option>
                <option value={2}>2 months ago</option>
                <option value={4}>3 - 6 months ago</option>
                <option value={12}>Over 12 months ago / None</option>
              </select>
            </div>

            {activeCategory === 'hair' && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Hair Length (Inches)</label>
                  <input
                    type="number"
                    value={hairLengthInches}
                    onChange={e => setHairLengthInches(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-1 flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hairTreated}
                      onChange={e => setHairTreated(e.target.checked)}
                      className="h-4 w-4 rounded accent-teal-600"
                    />
                    <span>Has hair been bleached or chemically lightened?</span>
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-teal-600" />
            <span>Instant clinical evaluation powered by Google GenAI</span>
          </div>

          <button
            onClick={handleRunScreening}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Assessing Criteria...' : 'Evaluate Eligibility'}</span>
          </button>
        </div>
      </div>

      {/* Error if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results Section */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 animate-pulse">
            <Sparkles className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Evaluating Clinical Regulatory Standards...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cross-referencing AABB, FDA 21 CFR, UNOS, and NMDP donor eligibility tables.
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Main Decision Banner */}
          <div className={`p-6 rounded-2xl border ${getStatusColor(result.eligibilityStatus)} space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 shadow-xs inline-block">
                  {result.statusBadge}
                </span>
                <h3 className="text-xl font-extrabold">{result.headline}</h3>
              </div>

              {result.deferralDurationDays > 0 && (
                <div className="bg-white/90 p-3 rounded-xl border border-amber-300 text-center shrink-0">
                  <div className="text-2xl font-mono font-extrabold text-amber-800">
                    {result.deferralDurationDays} Days
                  </div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">
                    Deferral Window
                  </div>
                  {result.deferralUntilDate && (
                    <div className="text-[10px] text-amber-900 font-mono mt-0.5">
                      Until {result.deferralUntilDate}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {result.clinicalReasoning}
            </p>
          </div>

          {/* Evaluated Clinical Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Evaluated Regulatory Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.evaluatedRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{rule.ruleName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {rule.standard}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{rule.detail}</p>
                  </div>

                  <span
                    className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      rule.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rule.passed ? <Check className="h-3.5 w-3.5" /> : '!'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation & Nutrition Roadmap */}
          <div className="p-5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
            <div className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-700" />
              <span>Recommended Pre-Donation Preparation Steps</span>
            </div>
            <ul className="space-y-2 text-xs text-teal-900">
              {result.preparationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-200 text-teal-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Alternative Ways to Help */}
          {result.safeAlternatives?.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Alternative Ways You Can Support Today:
              </span>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                {result.safeAlternatives.map((alt, idx) => (
                  <li key={idx}>{alt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{result.medicalDisclaimer}</span>
            <span className="text-slate-400 font-mono text-[10px]">Model: {modelUsed}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
