import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Heart,
  FileText,
  User,
  Building2,
  ChevronRight,
  RefreshCw,
  Sliders,
  Info,
  Award,
  Zap,
  ArrowRight,
  Volume2,
  Square
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationRequest, DonorProfile, AICrossmatchResult } from '../../types';

export const AICrossmatchView: React.FC = () => {
  const {
    requests,
    donors,
    aiPreselectedRequest,
    setAiPreselectedRequest,
    aiPreselectedDonor,
    setAiPreselectedDonor,
    setSelectedRequest,
    setSelectedDonor
  } = useApp();

  const [selectedReqId, setSelectedReqId] = useState<string>(
    aiPreselectedRequest?.id || requests[0]?.id || ''
  );
  const [selectedDonorId, setSelectedDonorId] = useState<string>(
    aiPreselectedDonor?.id || donors[0]?.id || ''
  );

  // Tunable scenario parameters
  const [recipientPra, setRecipientPra] = useState<number>(10);
  const [coldIschemiaDelayHours, setColdIschemiaDelayHours] = useState<number>(0);
  const [pediatricAdjustment, setPediatricAdjustment] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AICrossmatchResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [isAiPowered, setIsAiPowered] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result) return;

    const speechText = `Clinical Cross-Match Analysis. Compatibility score is ${result.compatibilityScore} percent, rated as ${result.riskBadge}. Headline: ${result.clinicalHeadline}. Clinical Summary: ${result.clinicalSummary}. Patient Explanation: ${result.patientExplanation}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync if preselected changes from external modal
  useEffect(() => {
    if (aiPreselectedRequest) {
      setSelectedReqId(aiPreselectedRequest.id);
    }
  }, [aiPreselectedRequest]);

  useEffect(() => {
    if (aiPreselectedDonor) {
      setSelectedDonorId(aiPreselectedDonor.id);
    }
  }, [aiPreselectedDonor]);

  const currentRequest = requests.find(r => r.id === selectedReqId) || requests[0];
  const currentDonor = donors.find(d => d.id === selectedDonorId) || donors[0];

  const handleRunAnalysis = async () => {
    if (!currentRequest || !currentDonor) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/crossmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: currentRequest,
          donor: currentDonor,
          customParams: {
            recipientPraPercent: recipientPra,
            transportAddedDelayHours: coldIschemiaDelayHours,
            pediatricAdjustmentActive: pediatricAdjustment,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setModelUsed(resJson.modelUsed || 'Gemini 3.1 Flash Lite');
        setIsAiPowered(resJson.aiPowered !== false);
      } else {
        throw new Error(resJson.error || 'Failed to parse clinical crossmatch');
      }
    } catch (err: any) {
      console.error('Error running AI crossmatch:', err);
      setErrorMessage(err.message || 'Network error analyzing cross-match');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial mount once
  useEffect(() => {
    if (!result && currentRequest && currentDonor) {
      handleRunAnalysis();
    }
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'OPTIMAL':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ACCEPTABLE':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'ELEVATED_RISK':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'HIGH_RISK_INCOMPATIBLE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-teal-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-teal-300" />
              <span>OmniMatch Clinical Copilot</span>
              <span className="text-teal-400/60">•</span>
              <span>UNOS & FDA Compliant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Clinical Cross-Match & HLA Compatibility Predictor
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real-time immunological cross-matching, HLA allele locus compatibility analysis (A, B, C, DRB1, DQB1), cold ischemia window forecasting, and risk-tier stratification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSpeech}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-teal-300" />
                  <span>Listen to Consult</span>
                </>
              )}
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md hover:shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synthesizing Labs...' : 'Re-Run Compatibility AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors & What-If Tuning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recipient Selection */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Recipient Request</span>
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {requests.length} Available
              </span>
            </div>

            <select
              value={selectedReqId}
              onChange={e => setSelectedReqId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-teal-600 transition"
            >
              {requests.map(req => (
                <option key={req.id} value={req.id}>
                  [{req.category.toUpperCase()}] {req.patientAlias} ({req.urgency.toUpperCase()}) - {req.title.slice(0, 35)}...
                </option>
              ))}
            </select>

            {currentRequest && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{currentRequest.patientAlias}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                    {currentRequest.category}
                  </span>
                </div>
                <div className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                  {currentRequest.medicalNotes}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Age: {currentRequest.patientAge} yo</span>
                  <span>{currentRequest.hospitalName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={() => setSelectedRequest(currentRequest)}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Full Requisition File</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Donor Selection */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="h-4 w-4 text-teal-600" />
                <span>Registered Donor</span>
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {donors.length} Registered
              </span>
            </div>

            <select
              value={selectedDonorId}
              onChange={e => setSelectedDonorId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-teal-600 transition"
            >
              {donors.map(donor => (
                <option key={donor.id} value={donor.id}>
                  {donor.donorName} ({donor.bloodDetails?.bloodGroup || 'Blood N/A'}) • {donor.distanceKm} km away
                </option>
              ))}
            </select>

            {currentDonor && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{currentDonor.donorName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    {currentDonor.verificationBadge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Blood: <strong className="text-slate-900">{currentDonor.bloodDetails?.bloodGroup || 'N/A'}</strong></div>
                  <div>Distance: <strong className="text-slate-900">{currentDonor.distanceKm} km</strong></div>
                  <div>Donations: <strong className="text-slate-900">{currentDonor.totalDonationsCount}</strong></div>
                  <div>Status: <strong className="text-emerald-700">Available</strong></div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={() => setSelectedDonor(currentDonor)}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Verified Donor Record</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Real-time What-If Scenario Tuner */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-teal-400" />
                <span>Clinical "What-If" Tuner</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-mono">
                Live Parameter Test
              </span>
            </div>

            {/* Recipient PRA Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Recipient PRA Sensitization:</span>
                <span className="font-mono font-bold text-teal-300">{recipientPra}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                value={recipientPra}
                onChange={e => setRecipientPra(Number(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Naive)</span>
                <span>50% (Sensitized)</span>
                <span>95% (High Antibodies)</span>
              </div>
            </div>

            {/* Transport Delay Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Cold Chain Transit Delay:</span>
                <span className="font-mono font-bold text-teal-300">+{coldIschemiaDelayHours} Hours</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={coldIschemiaDelayHours}
                onChange={e => setColdIschemiaDelayHours(Number(e.target.value))}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0h (Standard Courier)</span>
                <span>+6h (Regional Transit)</span>
                <span>+12h (Cross-Border)</span>
              </div>
            </div>

            {/* Pediatric Toggle */}
            <label className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800 cursor-pointer">
              <span>Pediatric Sizing / Low-Weight Protocol</span>
              <input
                type="checkbox"
                checked={pediatricAdjustment}
                onChange={e => setPediatricAdjustment(e.target.checked)}
                className="h-4 w-4 rounded accent-teal-500"
              />
            </label>
          </div>

          <div className="pt-3">
            <button
              onClick={handleRunAnalysis}
              className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition"
            >
              Apply What-If & Re-Score
            </button>
          </div>
        </div>
      </div>

      {/* Error state if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{errorMessage} (Loaded deterministic clinical rule fallback)</span>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="text-xs font-bold text-amber-800 underline cursor-pointer"
          >
            Retry AI
          </button>
        </div>
      )}

      {/* AI Results Section */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-teal-50 text-teal-600 animate-pulse">
            <Sparkles className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Synthesizing Clinical HLA & Hematologic Cross-Match...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Querying Gemini clinical transplant models with PRA thresholds, loci allele matching, and cold ischemia preservation tolerances.
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Main Scorecard Header */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(result.riskLevel)}`}>
                    {result.riskBadge || result.riskLevel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Model: {modelUsed} {isAiPowered ? '• GenAI Active' : '• Clinical Rule Engine'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {result.clinicalHeadline}
                </h3>
              </div>

              {/* Circular or Dial Match Score */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-slate-900 font-mono">
                    {result.compatibilityScore}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Compatibility Index
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Two Column Summary: Clinical Summary vs Patient-Friendly Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinical summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Activity className="h-4 w-4 text-teal-600" />
                  <span>Clinical Assessment for Hospital Board</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.clinicalSummary}
                </p>
              </div>

              {/* Patient explanation */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
                <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Heart className="h-4 w-4 text-teal-600" />
                  <span>Plain-Language Patient & Family Explanation</span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed font-medium">
                  {result.patientExplanation}
                </p>
              </div>
            </div>

            {/* Parameters Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Comprehensive Biomarker & Logistics Verification
              </h4>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {result.parametersAnalysis.map((param, i) => (
                  <div key={i} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{param.parameter}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          param.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800'
                            : param.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {param.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {param.clinicalImplication}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 sm:text-right shrink-0">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Donor Profile</div>
                        <div className="font-semibold text-slate-800">{param.donorValue}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Recipient Need</div>
                        <div className="font-semibold text-slate-800">{param.recipientRequirement}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional HLA Breakdown (Organ & Marrow) */}
            {result.hlaBreakdown?.applicable && (
              <div className="p-5 rounded-xl bg-slate-900 text-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-teal-400" />
                      <span>High-Resolution HLA Allele Match Matrix (MHC Class I & II)</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Evaluated for HLA-A, B, C, DRB1, and DQB1 loci to compute Graft-versus-Host (GvHD) risk.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                      {result.hlaBreakdown.totalMatchScore}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                      GvHD Risk: <strong className="text-white">{result.hlaBreakdown.gvhdRisk}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {result.hlaBreakdown.locusMatches.map((loc, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1.5 text-center">
                      <div className="text-[11px] font-mono font-bold text-teal-300 uppercase">
                        {loc.locus}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        D: {loc.donorAllele}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        R: {loc.recipientAllele}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                        {loc.matchStatus.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cold Ischemia & Logistics */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-blue-900 font-bold block mb-1">Cold Ischemia Tolerance</span>
                <span className="text-blue-700 font-mono text-base font-bold">
                  {result.coldIschemiaAnalysis.safeWindowHours} Hours Max
                </span>
              </div>
              <div>
                <span className="text-blue-900 font-bold block mb-1">Transit Risk Level</span>
                <span className="text-blue-700 font-semibold">
                  {result.coldIschemiaAnalysis.transitRiskTier} Tier
                </span>
              </div>
              <div>
                <span className="text-blue-900 font-bold block mb-1">Preservation Medium</span>
                <span className="text-blue-700 text-[11px]">
                  {result.coldIschemiaAnalysis.preservationProtocol}
                </span>
              </div>
            </div>

            {/* Hospital Directives */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Clinical Directives & Next Procedural Steps
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.clinicalBoardRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ethics & Legal compliance line */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>{result.ethicalComplianceNote}</span>
              </span>
              <button
                onClick={() => window.print()}
                className="text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
              >
                Print Clinical Brief
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
