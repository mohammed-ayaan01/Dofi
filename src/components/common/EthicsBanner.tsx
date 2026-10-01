import React, { useState } from 'react';
import { ShieldAlert, ChevronRight, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EthicsBanner: React.FC = () => {
  const { setIsEthicsModalOpen } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside aria-label="Legal & ethical compliance notice" className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5" />
          </span>
          <p className="font-normal text-slate-300">
            <strong className="font-semibold text-white">Strict Safety & Legal Notice:</strong> Commercial buying or selling of organs, blood, bone, tissue, or human biological materials is strictly illegal. All donations are facilitated exclusively via licensed healthcare facilities.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEthicsModalOpen(true)}
            className="inline-flex items-center gap-1 font-medium text-teal-400 hover:text-teal-300 transition-colors focus-visible:outline-none"
          >
            <Lock className="h-3 w-3" />
            <span>Compliance Protocols</span>
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors px-1"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
};
