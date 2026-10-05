import React, { useEffect, useState } from 'react';
import { Globe2, AlertTriangle, ExternalLink, FlaskConical } from 'lucide-react';

interface NottoStats {
  totalDeceasedDonors2023: number;
  totalOrganTransplants2023: number;
  registeredTransplantCenters: number;
  estimatedWaitlistKidney: number;
  cornealTransplants2023: number;
  mostActiveStateForDeceasedDonation: string;
  dataYear: number;
  dataSource: string;
  disclaimer: string;
}

interface NottoResponse {
  source: string;
  dataType: string;
  liveApiAvailable: boolean;
  note: string;
  officialPortal: string;
  statistics: NottoStats;
  lastPublished: string;
  fetchedAt: string;
}

interface EraktkoshResponse {
  source: string;
  integrationStatus: string;
  reason: string;
  officialPortal: string;
  contactForIntegration: string;
  phone: string;
  lastChecked: string;
}

export const ExternalStatsWidget: React.FC = () => {
  const [nottoData, setNottoData] = useState<NottoResponse | null>(null);
  const [eraktkoshData, setEraktkoshData] = useState<EraktkoshResponse | null>(null);
  const [nottoStatus, setNottoStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [eraktkoshStatus, setEraktkoshStatus] = useState<'loading' | 'pending' | 'error'>('loading');

  useEffect(() => {
    // Fetch NOTTO official statistics from our backend
    fetch('/api/external/notto')
      .then(r => r.json())
      .then((data: NottoResponse) => {
        setNottoData(data);
        setNottoStatus('loaded');
      })
      .catch(() => setNottoStatus('error'));

    // Fetch e-RaktKosh adapter status from our backend
    fetch('/api/external/eraktkosh')
      .then(r => r.json())
      .then((data: EraktkoshResponse) => {
        setEraktkoshData(data);
        setEraktkoshStatus('pending');
      })
      .catch(() => setEraktkoshStatus('error'));
  }, []);

  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <section className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Globe2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">External Reference Data</h3>
            <p className="text-[11px] text-slate-400">Official government sources — not real-time stock</p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Reference Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NOTTO Panel */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">NOTTO India</div>
              <div className="text-[10px] text-slate-400">National Organ & Tissue Transplant Organisation</div>
            </div>
            <span className="text-[9px] font-bold uppercase bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 px-1.5 py-0.5 rounded">
              Official Figures
            </span>
          </div>

          {nottoStatus === 'loading' && (
            <div className="text-xs text-slate-500 animate-pulse">Loading official statistics...</div>
          )}
          {nottoStatus === 'error' && (
            <div className="text-xs text-rose-400">Could not load statistics.</div>
          )}
          {nottoStatus === 'loaded' && nottoData && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 rounded-lg p-2.5">
                  <div className="text-lg font-bold text-teal-400 font-mono tabular-nums">
                    {fmt(nottoData.statistics.totalOrganTransplants2023)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Organ transplants ({nottoData.statistics.dataYear})</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5">
                  <div className="text-lg font-bold text-sky-400 font-mono tabular-nums">
                    {fmt(nottoData.statistics.totalDeceasedDonors2023)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Deceased donors ({nottoData.statistics.dataYear})</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5">
                  <div className="text-lg font-bold text-indigo-400 font-mono tabular-nums">
                    {nottoData.statistics.registeredTransplantCenters}+
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Transplant centers</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5">
                  <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                    {nottoData.statistics.mostActiveStateForDeceasedDonation}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Most active state</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-700/50 pt-2">
                Source: {nottoData.statistics.dataSource}<br />
                Published: {nottoData.lastPublished}
                <a href={nottoData.officialPortal} target="_blank" rel="noopener noreferrer"
                  className="ml-2 text-teal-500 hover:text-teal-400 inline-flex items-center gap-0.5">
                  notto.mohfw.gov.in <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* e-RaktKosh Panel */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">e-RaktKosh</div>
              <div className="text-[10px] text-slate-400">MoHFW Blood Bank Platform</div>
            </div>
            <span className="text-[9px] font-bold uppercase bg-amber-900/40 text-amber-400 border border-amber-700/50 px-1.5 py-0.5 rounded">
              Integration Pending
            </span>
          </div>

          <div className="flex items-start gap-2.5 bg-amber-950/30 border border-amber-800/30 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200/80 leading-relaxed">
              <strong className="text-amber-300">No Public API Available.</strong> e-RaktKosh does not expose a public REST API. Integration requires institutional credentials from MoHFW, issued only to licensed blood banks.
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="h-3 w-3 text-slate-500" />
              <span>Adapter architecture: <span className="text-teal-400">Ready</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <FlaskConical className="h-3 w-3 text-slate-500" />
              <span>Required env vars: <code className="text-slate-300 bg-slate-900/60 px-1 rounded text-[10px]">ERAKTKOSH_INSTITUTION_TOKEN</code></span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-700/50 pt-2">
            To integrate: contact{' '}
            <a href="mailto:mraktkosh@gmail.com" className="text-teal-500 hover:text-teal-400">mraktkosh@gmail.com</a>
            {' '}or visit{' '}
            <a href="https://eraktkosh.mohfw.gov.in" target="_blank" rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-400 inline-flex items-center gap-0.5">
              eraktkosh.mohfw.gov.in <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <p className="text-[10px] text-slate-600 leading-relaxed border-t border-slate-800 pt-3">
        External reference data is displayed for informational purposes only. NOTTO statistics represent official national aggregate figures published by the Ministry of Health & Family Welfare, Government of India. They do not reflect individual donor availability on this platform.
      </p>
    </section>
  );
};
