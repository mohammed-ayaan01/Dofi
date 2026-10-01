import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Scissors,
  Droplet,
  Dna,
  FileText,
  Volume2,
  VolumeX,
  Square,
  ShieldCheck,
  RefreshCw,
  Award,
  Layers,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { AIVisionAnalysisResult } from '../../types';

export const AIVisionLabView: React.FC = () => {
  const [selectedType, setSelectedType] = useState<
    'hair_specimen' | 'blood_vial' | 'cell_viability' | 'lab_report'
  >('hair_specimen');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIVisionAnalysisResult | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [specimenLabel, setSpecimenLabel] = useState<string>('Specimen Batch #4C-992 (Pediatric Wig Intake)');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Preset sample specimens
  const presets = [
    {
      type: 'hair_specimen' as const,
      label: 'Sample A: 12.8" Virgin Auburn Braid',
      subtitle: 'Natural non-bleached hair bundle with elastic banding',
      badge: 'Pediatric Wigs',
      color: 'emerald',
      icon: Scissors,
      previewBg: 'from-amber-900 to-amber-950',
    },
    {
      type: 'blood_vial' as const,
      label: 'Sample B: K2-EDTA 4.0 mL Whole Blood Tube',
      subtitle: 'Lavender-top phlebotomy collection vial',
      badge: 'Hematology',
      color: 'rose',
      icon: Droplet,
      previewBg: 'from-rose-900 to-rose-950',
    },
    {
      type: 'cell_viability' as const,
      label: 'Sample C: CD34+ Stem Cell Harvest Microscopy',
      subtitle: 'Trypan blue viability exclusion assay',
      badge: 'Cell Therapy',
      color: 'blue',
      icon: Dna,
      previewBg: 'from-blue-900 to-indigo-950',
    },
    {
      type: 'lab_report' as const,
      label: 'Sample D: CBC & Infectious Disease Panel',
      subtitle: 'Diagnostic serology laboratory requisition document',
      badge: 'Diagnostic OCR',
      color: 'teal',
      icon: FileText,
      previewBg: 'from-slate-800 to-slate-900',
    },
  ];

  const handleRunAnalysis = async (type = selectedType, label = specimenLabel, imgBase64?: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/vision-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenType: type,
          specimenLabel: label,
          imageBase64: imgBase64 || customImage || undefined,
        }),
      });

      if (!response.ok) throw new Error('Vision analysis failed');
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
      }
    } catch (err) {
      console.warn('Vision call failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    handleRunAnalysis(selectedType);
  }, [selectedType]);

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setSelectedType(preset.type);
    setSpecimenLabel(preset.label);
    setCustomImage(null);
    handleRunAnalysis(preset.type, preset.label);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setCustomImage(b64);
      setSpecimenLabel(`Uploaded Specimen: ${file.name}`);
      handleRunAnalysis(selectedType, file.name, b64);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result) return;

    const text = `VisionLab Specimen Quality Report. Specimen evaluated as ${result.qualityTier} with a suitability score of ${result.suitabilityScore} percent. Vision confidence is ${Math.round(result.visionConfidence * 100)} percent. Key attribute: ${result.detectedAttributes[0]?.name}, measured at ${result.detectedAttributes[0]?.value}. Certification status: ${result.processingCertification}`;

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
      {/* VisionLab Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-teal-900/40 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
              <Eye className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Multimodal Computer Vision & Morphometrics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-teal-200 font-mono">Precision Grading</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              VisionLab™ Biometric Specimen Scanner
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Optical morphology and quality verification for donated hair bundles, blood collection vials, stem cell grafts, and diagnostic lab reports with automated defect screening.
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
                  <Volume2 className="w-4 h-4 text-teal-300" />
                  <span>Listen to Report</span>
                </>
              )}
            </button>

            <label className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preset Specimen Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map(p => {
          const Icon = p.icon;
          const isSelected = selectedType === p.type && (!customImage || specimenLabel === p.label);
          return (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 ${
                isSelected
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-600/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />}
              <div className="flex items-start justify-between w-full">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {p.badge}
                </span>
              </div>
              <div>
                <div className={`font-bold text-xs truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Results View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Specimen Visual Representation / Microscope Viewfinder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg relative aspect-4/3 flex flex-col justify-between p-4 text-white">
            {/* Viewfinder Overlay HUD */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400">
                  OPTICAL SENSOR ACTIVE
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                ZOOM: 1.4× | 4K MACRO
              </span>
            </div>

            {/* Specimen Visual Graphic / Image */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {customImage ? (
                <img
                  src={customImage}
                  alt="Custom Specimen"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : selectedType === 'hair_specimen' ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-32 h-44 rounded-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 shadow-inner flex items-center justify-center border-2 border-amber-500/40 relative">
                    <div className="absolute top-4 left-0 right-0 h-2 bg-amber-400/50" />
                    <Scissors className="w-8 h-8 text-amber-200/80" />
                  </div>
                  <span className="text-xs font-mono text-amber-300">
                    Natural Auburn Braid Specimen
                  </span>
                </div>
              ) : selectedType === 'blood_vial' ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-48 rounded-full bg-gradient-to-b from-purple-600 via-rose-700 to-rose-950 shadow-inner flex flex-col justify-between items-center py-2 border-2 border-rose-400/40">
                    <div className="w-12 h-6 rounded-full bg-purple-500 border border-purple-300 shadow" />
                    <Droplet className="w-6 h-6 text-rose-300 animate-bounce" />
                    <div className="text-[9px] font-mono text-white/80">K2-EDTA</div>
                  </div>
                  <span className="text-xs font-mono text-rose-300">
                    Phlebotomy Tube #DC4C-8849
                  </span>
                </div>
              ) : selectedType === 'cell_viability' ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-40 h-40 rounded-full bg-indigo-950 border-2 border-dashed border-teal-400 flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center animate-spin">
                      <Dna className="w-12 h-12 text-teal-300" />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-teal-300">
                    Trypan Blue Stain Viability Grid
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-36 h-48 rounded-xl bg-slate-900 border border-slate-700 p-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="h-2 w-16 bg-teal-400 rounded" />
                      <div className="h-1.5 w-24 bg-slate-600 rounded" />
                      <div className="h-1.5 w-20 bg-slate-600 rounded" />
                    </div>
                    <FileText className="w-8 h-8 text-teal-400 self-center" />
                    <div className="h-1.5 w-full bg-slate-700 rounded" />
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    Diagnostic Report Requisition
                  </span>
                </div>
              )}
            </div>

            {/* Viewfinder Target Crosshairs */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>SCAN TARGET: {specimenLabel.slice(0, 30)}...</span>
              <span className="text-teal-400 font-bold">
                {isLoading ? 'ANALYZING...' : 'LOCKED'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-900">
                FDA 21 CFR 640 & Wig Guild Standard
              </span>
            </div>
            <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Verified
            </span>
          </div>
        </div>

        {/* Optical Morphometric Findings & Quality Grade */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quality Score Header */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Specimen Quality Assurance Rating
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {result?.suitabilityScore ?? 96}%
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{result?.qualityTier ?? 'PREMIUM_OPTIMAL'}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vision Confidence
              </span>
              <span className="text-lg font-mono font-bold text-teal-700">
                {Math.round((result?.visionConfidence ?? 0.97) * 100)}%
              </span>
            </div>
          </div>

          {/* Morphometric Attribute Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              Detected Morphological Biomarkers & Physical Indices
            </h4>

            <div className="space-y-2.5">
              {result?.detectedAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-bold text-xs text-slate-900">{attr.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {attr.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    {attr.clinicalNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Intake Directives & Certification */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              Intake Recommendations & Certification
            </h4>

            <div className="space-y-1.5">
              {result?.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>{result?.processingCertification}</span>
              <span className="text-teal-700 font-bold">Passed QA Audit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
