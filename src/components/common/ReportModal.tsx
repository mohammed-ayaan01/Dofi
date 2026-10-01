import React, { useState } from 'react';
import { Flag, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModerationReport } from '../../types';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportingTarget, submitModerationReport } = useApp();
  const [reason, setReason] = useState<ModerationReport['reason']>('commercial_trade_attempt');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isReportModalOpen || !reportingTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitModerationReport({
      reportedItemId: reportingTarget.id,
      itemType: reportingTarget.type,
      reason,
      details: details.trim() || 'No additional details provided.'
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      setIsReportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-rose-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-rose-600 text-white">
              <Flag className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Report Integrity Concern</h3>
              <p className="text-xs text-slate-500">Flag "{reportingTarget.name}" for compliance audit</p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Our Clinical Compliance Officer has been notified. This record will undergo immediate review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Zero Tolerance: Commercial solicitation of biological material, unauthorized brokers, or abusive behavior results in immediate account termination.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Reason for Report
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as ModerationReport['reason'])}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="commercial_trade_attempt">Commercial buying/selling solicitation (Illegal)</option>
                <option value="suspicious_activity">Unverified credentials or suspicious requests</option>
                <option value="inaccurate_medical_info">Inaccurate or forged medical information</option>
                <option value="harassment">Unsolicited contact or harassment</option>
                <option value="other">Other compliance concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Specific Details & Evidence (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe the issue, messages, or unverified claims..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
