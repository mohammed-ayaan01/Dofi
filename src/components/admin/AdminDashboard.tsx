import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Building2,
  UserCheck,
  Flag,
  Search,
  Lock,
  Clock,
  Sparkles,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const {
    verificationQueue,
    approveVerification,
    rejectVerification,
    reports,
    resolveReport,
    dismissReport,
    currentUser,
    registeredAppUsersList,
    firebaseDonationsList,
    setActiveTab: setAppActiveTab
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verification' | 'reports' | 'audit'>('verification');

  const pendingVerifications = verificationQueue.filter(v => v.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold uppercase mb-2">
            <Lock className="h-3.5 w-3.5" />
            <span>Compliance Governance Console</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Platform Verification & Ethical Moderation
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Enforcing zero-commercialization policies, clinical licensing validations, and fraud prevention
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAppActiveTab('registrations')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Database className="h-4 w-4" />
            <span>Live Database ({registeredAppUsersList.length} Users · {firebaseDonationsList.length} Donations) →</span>
          </button>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Governance Officer</div>
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pending Verifications</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {pendingVerifications.length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Requires clinical document review</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Moderation Reports Flagged</div>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1">
            {pendingReports.length}
          </div>
          <div className="text-[11px] text-rose-500 font-semibold mt-1">Zero-commercialization enforcement</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Platform Compliance Rating</div>
          <div className="text-2xl font-bold text-teal-700 font-mono mt-1">
            100%
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Full NOTA & WHO standard adherence</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'verification'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinical Verification Queue ({pendingVerifications.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ethics Moderation Reports ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Audit Logs & Rules
        </button>
      </div>

      {/* Verification Queue Tab */}
      {activeTab === 'verification' && (
        <div className="space-y-3">
          {verificationQueue.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    item.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : item.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {item.status}
                  </span>
                  <span className="font-bold text-slate-900 text-xs uppercase">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span>·</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {item.entityName}
                </h3>

                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Document Type: <strong className="text-slate-800">{item.documentType}</strong></span>
                  <span>·</span>
                  <span className="font-mono text-slate-500 text-[11px]">{item.documentRef}</span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {item.status === 'pending' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => rejectVerification(item.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveVerification(item.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                  >
                    Approve Credentials
                  </button>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-500">
                  Reviewed by: <strong className="text-slate-800">{item.reviewedBy || 'Admin'}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Moderation Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    report.status === 'pending'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {report.status}
                  </span>
                  <span className="font-bold text-rose-700 text-xs">
                    Violation Type: {report.reason.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span>·</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Reporter: {report.reporterName}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-medium">
                  Reported Target: <span className="font-mono font-bold text-slate-900">{report.reportedItemId}</span> ({report.itemType})
                </div>

                <p className="text-xs text-slate-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                  {report.details}
                </p>
              </div>

              {report.status === 'pending' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => dismissReport(report.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => resolveReport(report.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
                  >
                    Action & Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">
            Automated Audit & Compliance Controls
          </h3>
          <p>
            The DonorConnect 4Care system maintains immutable audit trails of all requisition status changes, user communications, and verification approvals. Commercial solicitation keywords and unauthorized match brokerages are automatically flagged.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 space-y-1">
            <div>[AUDIT 2026-09-25 08:15:02] STAT Crossmatch Initiated by Dr. Sarah Chen (Metro Univ Hospital)</div>
            <div>[AUDIT 2026-09-25 07:35:10] Donor Marcus Vance auto-matched with Request #req_emergency_001</div>
            <div>[AUDIT 2026-09-24 18:00:22] Oncology Board Approval Ref #PED-BMT-2026-904 verified for Leo R.</div>
            <div>[AUDIT 2026-09-23 14:00:00] Hair Donation package #CROWN-2026-04 verified by Crowns of Courage NGO</div>
          </div>
        </div>
      )}
    </div>
  );
};
