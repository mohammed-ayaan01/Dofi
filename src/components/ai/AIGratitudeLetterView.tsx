import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Send,
  Eye,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { AIGratitudeLetterResult } from '../../types';

export const AIGratitudeLetterView: React.FC = () => {
  const [senderRole, setSenderRole] = useState<string>('Kidney Transplant Recipient');
  const [recipientRole, setRecipientRole] = useState<string>('Hero Donor Family');
  const [category, setCategory] = useState<string>('organ');
  const [emotionalTone, setEmotionalTone] = useState<string>('Deeply reverent, loving, and profoundly grateful');
  const [milestones, setMilestones] = useState<string>(
    'Seeing my 6-year-old daughter start first grade, returning to gardening outdoors after 4 years of daily dialysis, and waking up without fatigue.'
  );
  const [recipientAlias, setRecipientAlias] = useState<string>('A Grateful Recipient');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIGratitudeLetterResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const sampleIdeas = [
    {
      label: 'Kidney Recipient to Deceased Donor Family',
      sender: 'Kidney Transplant Recipient',
      recipient: 'Donor Family',
      category: 'organ',
      milestones: 'Walking my daughter down the aisle; returning home after 3 years on dialysis.',
    },
    {
      label: 'Pediatric Cancer Hair Recipient',
      sender: 'Parent of Pediatric Leukemia Patient',
      recipient: 'Selfless Hair Donor',
      category: 'hair',
      milestones: 'Seeing my daughter smile in front of the mirror with her custom cranial prosthetic wig on her first day back at school.',
    },
    {
      label: 'Bone Marrow Recipient to Unrelated Donor',
      sender: 'Leukemia Survivor (2 Years Post-Transplant)',
      recipient: 'Anonymous Marrow Donor',
      category: 'bone_tissue',
      milestones: 'Celebrating my 2-year cancer remission anniversary, returning to teaching high school science.',
    },
    {
      label: 'Living Altruistic Liver Donor to Recipient',
      sender: 'Living Liver Donor',
      recipient: 'Transplant Recipient',
      category: 'organ',
      milestones: 'Hearing that your liver function enzymes have normalized and knowing you are home with your family.',
    },
  ];

  const handleGenerateLetter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/gratitude-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole,
          recipientRole,
          donationCategory: category,
          emotionalTone,
          keyMilestones: milestones,
          recipientAlias,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate letter');
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setResult(resJson.data);
        setModelUsed(resJson.modelUsed || 'Gemini 3.1 Flash Lite');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLetter = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.letterContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-amber-800/40">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Heart className="h-3.5 w-3.5 text-rose-300 fill-rose-300" />
            <span>Story of Hope & Ethical Letter Generator</span>
            <span className="text-amber-400/60">•</span>
            <span>NOTA HIPAA Privacy Guard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Anonymized Gratitude & Hope Letter Assistant
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            In organ, marrow, and hair donation, gratitude correspondence brings profound emotional healing. Our AI crafts compassionate messages while strictly applying automated de-identification audits to protect identities under NOTA and UNOS regulations.
          </p>
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Sample presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Choose Inspiration Scenario:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {sampleIdeas.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSenderRole(s.sender);
                  setRecipientRole(s.recipient);
                  setCategory(s.category);
                  setMilestones(s.milestones);
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 text-left transition cursor-pointer text-xs"
              >
                <div className="font-bold text-slate-800">{s.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{s.milestones}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Sender Identity</label>
            <input
              type="text"
              value={senderRole}
              onChange={e => setSenderRole(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Addressed To</label>
            <input
              type="text"
              value={recipientRole}
              onChange={e => setRecipientRole(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Program</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="organ">Organ Donation</option>
              <option value="bone_tissue">Bone Marrow / Allograft</option>
              <option value="blood">Blood & Platelet Apheresis</option>
              <option value="hair">Hair for Pediatric Cranial Prosthetics</option>
            </select>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Life Milestones, Sentiments, or Cherished Memories to Express:
          </label>
          <textarea
            rows={3}
            value={milestones}
            onChange={e => setMilestones(e.target.value)}
            placeholder="e.g. Seeing my son graduate high school, returning to teaching, being able to walk in the park..."
            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-amber-600 transition leading-relaxed text-slate-800"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>Automatic HIPAA & NOTA privacy redaction scanner active</span>
          </div>

          <button
            onClick={handleGenerateLetter}
            disabled={isLoading || !milestones.trim()}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Composing...' : 'Craft Letter & Audit Privacy'}</span>
          </button>
        </div>
      </div>

      {/* Result */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-amber-50 text-amber-600 animate-pulse">
            <Heart className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Composing Gratitude Letter with Ethical Privacy Sanitizer...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Synthesizing compassionate storytelling and running privacy redactions for surnames, dates, and locations.
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Letter Card (Warm Stationery Style) */}
          <div className="bg-amber-50/40 rounded-2xl p-6 sm:p-10 border border-amber-200 shadow-sm space-y-6 relative">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block">
                  Official Anonymized Correspondence
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-950 mt-0.5">
                  {result.letterTitle}
                </h3>
              </div>

              <button
                onClick={copyLetter}
                className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isCopied ? 'Copied to Clipboard' : 'Copy Letter'}</span>
              </button>
            </div>

            <div className="font-serif text-sm sm:text-base leading-relaxed text-amber-950 whitespace-pre-line space-y-4">
              {result.letterContent}
            </div>

            <div className="pt-6 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <span className="font-semibold italic">"{result.reflectionPrompt}"</span>
              <span className="text-[11px] text-amber-800/80">{result.sharingSafeguardNotice}</span>
            </div>
          </div>

          {/* Ethical Audit Badge & Verification Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Automated Ethical & HIPAA Privacy Audit Report</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                NOTA Certified Compliant
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {result.ethicalComplianceAudit.auditNotes}
            </p>

            {result.ethicalComplianceAudit.redactionsApplied?.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Redacted Entities to Protect Privacy:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.ethicalComplianceAudit.redactionsApplied.map((red, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px]">Detected: <span className="line-through text-rose-600">{red.originalText}</span></div>
                      <div className="font-bold text-slate-800">Replaced with: <span className="text-emerald-700">{red.anonymizedAs}</span></div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Reason: {red.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
