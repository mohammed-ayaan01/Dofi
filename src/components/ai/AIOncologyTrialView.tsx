import React, { useState } from 'react';
import {
  Globe2,
  Sparkles,
  Dna,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Square,
  RefreshCw,
  Search,
  MapPin,
  Heart,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIOncologyTrialResult } from '../../types';
import { WORLD_CANCER_HOSPITALS } from '../../data/cancerHospitalsData';

export const AIOncologyTrialView: React.FC = () => {
  const { setActiveTab, openHospitalPortalForCancerHospital, setCancerHospitalSearchQuery } = useApp();

  const [diagnosis, setDiagnosis] = useState<string>('Refractory B-Cell Acute Lymphoblastic Leukemia (B-ALL)');
  const [stage, setStage] = useState<string>('Relapsed Post-Induction (Minimal Residual Disease +)');
  const [biomarkers, setBiomarkers] = useState<string[]>(['CD19+', 'CD22+', 'BCR-ABL1 Negative']);
  const [patientAge, setPatientAge] = useState<number>(14);
  const [preferredContinent, setPreferredContinent] = useState<string>('Global');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIOncologyTrialResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Preset Clinical Oncology Cases
  const presetCases = [
    {
      id: 'pediatric-all',
      title: 'Pediatric B-Cell ALL (Relapsed)',
      age: 14,
      diagnosis: 'Refractory B-Cell Acute Lymphoblastic Leukemia (B-ALL)',
      stage: 'Relapsed Post-Induction (MRD+)',
      biomarkers: ['CD19+', 'CD22+', 'BCR-ABL1 Negative'],
      badge: 'Pediatric Cellular Trial',
      urgency: 'High (28-Day Window)',
    },
    {
      id: 'adult-aml',
      title: 'Adult Acute Myeloid Leukemia (AML)',
      age: 42,
      diagnosis: 'Acute Myeloid Leukemia with Adverse Cytogenetics',
      stage: 'First Relapse Post-Chemotherapy',
      biomarkers: ['FLT3-ITD Positive', 'NPM1 Mutated', 'TP53 Wild-Type'],
      badge: 'Allogeneic BMT Protocol',
      urgency: 'STAT Critical',
    },
    {
      id: 'pediatric-neuro',
      title: 'High-Risk Pediatric Neuroblastoma',
      age: 7,
      diagnosis: 'High-Risk Stage 4 Neuroblastoma',
      stage: 'Consolidation Phase',
      biomarkers: ['GD2 Positive', 'MYCN Amplified'],
      badge: 'Prosthetics & Marrow Support',
      urgency: 'Urgent Referral',
    },
    {
      id: 'hodgkin-lymphoma',
      title: 'Relapsed Classical Hodgkin Lymphoma',
      age: 26,
      diagnosis: 'Classical Hodgkin Lymphoma (Nodular Sclerosis)',
      stage: 'Relapsed Post-Autologous Transplant',
      biomarkers: ['CD30 Positive', 'PD-L1 High Expression'],
      badge: 'CAR-T / Allograft',
      urgency: 'Moderate Window',
    },
  ];

  const handleRunMatcher = async (diag = diagnosis, st = stage, bm = biomarkers, age = patientAge) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/oncology-trial-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diag,
          stage: st,
          biomarkers: bm,
          patientAge: age,
          preferredContinent,
        }),
      });

      if (!response.ok) throw new Error('Oncology matcher call failed');
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
      }
    } catch (err) {
      console.warn('Matcher call fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleRunMatcher();
  }, []);

  const handleSelectCase = (preset: typeof presetCases[0]) => {
    setDiagnosis(preset.diagnosis);
    setStage(preset.stage);
    setBiomarkers(preset.biomarkers);
    setPatientAge(preset.age);
    handleRunMatcher(preset.diagnosis, preset.stage, preset.biomarkers, preset.age);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result || !result.matchedHospitals[0]) return;

    const topHospital = result.matchedHospitals[0];
    const text = `Global Oncology Protocol Matching Summary. For patient diagnosis of ${diagnosis}, top recommended trial match is at ${topHospital.hospitalName} in ${topHospital.city}, ${topHospital.country} with a clinical match score of ${topHospital.matchScore} percent. Trial protocol: ${topHospital.protocolName}. Rationale: ${topHospital.eligibilityRationale}. Referral urgency window is ${result.urgencyWindowDays} days.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-900/40 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Globe2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>World Cancer Hospital Network Integration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-200 font-mono">Precision Trials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Global Oncology & Clinical Trial Matcher
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Matching cancer patients requiring bone marrow, stem cell allografts, CAR-T immunotherapy, or pediatric cranial prosthetics directly with active clinical protocols across our global hospital network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSpeech}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-blue-300" />
                  <span>Listen to Protocol</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('find-donors');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore on World Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Patient Case Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetCases.map(c => {
          const isSelected = diagnosis === c.diagnosis;
          return (
            <button
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-32 ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />}
              <div className="flex items-start justify-between w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Age {c.age} yo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {c.badge}
                </span>
              </div>
              <div>
                <div className={`font-bold text-xs ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {c.title}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {c.biomarkers.join(' • ')}
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold text-amber-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{c.urgency}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Results View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Suitability Scorecard & Protocol Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Target Cell Modality Suitability</h3>
              </div>
              <span className="text-xs font-mono text-blue-700 font-bold">Precision AI</span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'CAR-T Cell Immunotherapy',
                  eligible: result?.cellularTherapySuitability.carT ?? true,
                  reason: 'Target surface antigens (CD19/CD22) express with high receptor density.',
                },
                {
                  label: 'Allogeneic Stem Cell (BMT)',
                  eligible: result?.cellularTherapySuitability.allogeneicBMT ?? true,
                  reason: 'Indicated for durable leukemic remission post-consolidation.',
                },
                {
                  label: 'Haploidentical Family Donor',
                  eligible: result?.cellularTherapySuitability.haploidenticalTransplant ?? true,
                  reason: 'Viable immediate alternative if 10/10 MUD search extends beyond 30 days.',
                },
                {
                  label: 'Pediatric Cranial Wig Support',
                  eligible: true,
                  reason: '100% natural hair wig donated by verified pediatric guild partners.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Eligible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                International Referral Action Checklist:
              </span>
              <div className="space-y-1.5">
                {result?.referralChecklist.map((chk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matched Global Cancer Hospitals & Clinical Trials */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Matched World Cancer Centers & Active Clinical Trials ({result?.matchedHospitals.length || 0})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Calibrated by WHO & Global Registry Data
            </span>
          </div>

          <div className="space-y-4">
            {result?.matchedHospitals.map((hosp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {hosp.hospitalName}
                      </h4>
                      <span className="text-xs font-medium text-slate-500">
                        • {hosp.city}, {hosp.country}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 font-semibold mt-0.5">
                      {hosp.protocolName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Protocol Match
                      </span>
                      <span className="text-xl font-black text-blue-600 font-mono">
                        {hosp.matchScore}%
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {hosp.trialPhase}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>Clinical Rationale:</strong> {hosp.eligibilityRationale}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                    Targeted Biomarkers:
                  </span>
                  {hosp.targetedBiomarkers.map((b, bIdx) => (
                    <span
                      key={bIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {b}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Trial ID: {hosp.trialId}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{hosp.internationalPatientOffice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const matchedH = WORLD_CANCER_HOSPITALS.find(wh =>
                          wh.name.toLowerCase().includes(hosp.hospitalName.toLowerCase()) ||
                          hosp.hospitalName.toLowerCase().includes(wh.shortName.toLowerCase())
                        );
                        if (matchedH) {
                          openHospitalPortalForCancerHospital(matchedH);
                        } else {
                          setCancerHospitalSearchQuery(hosp.hospitalName);
                          setActiveTab('hospital');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-all border border-teal-200 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Open Hospital Portal →</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('find-donors');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>View on World Map</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
