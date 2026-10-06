import React, { useState } from 'react';
import {
  Droplet,
  Heart,
  Bone,
  Scissors,
  ArrowRight,
  Info,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonationCategory } from '../../types';

export const CategoryPillars: React.FC = () => {
  const { setActiveTab, setActiveFilterCategory, setIsRegisterDonorModalOpen } = useApp();
  const [activeGuide, setActiveGuide] = useState<DonationCategory | null>(null);

  const categories: {
    id: DonationCategory;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    tagClass: string;
    stats: string;
    guidelines: string[];
    complianceNote: string;
  }[] = [
    {
      id: 'blood',
      title: 'Blood Donor Finder',
      subtitle: 'Whole Blood, Apheresis Platelets & Plasma',
      description: 'Search compatible blood groups (ABO & Rh factor) with rapid emergency call-outs for trauma and surgery.',
      icon: <Droplet className="h-6 w-6 text-rose-600" />,
      colorClass: 'border-t-4 border-t-rose-600',
      tagClass: 'text-rose-700 bg-rose-50 border-rose-200',
      stats: 'Sample Blood Donors in Demo',
      guidelines: [
        'Must be at least 17 years old and weigh 110+ lbs',
        'Standard whole blood donation frequency: 56 days',
        'Platelet apheresis donors can donate every 7 days',
        'O- universal red cell donor; AB+ universal plasma donor'
      ],
      complianceNote: 'No commercial remuneration. Facilitated through licensed healthcare facilities only.'
    },
    {
      id: 'organ',
      title: 'Organ Donor Support',
      subtitle: 'Living Donation & Deceased Pledges',
      description: 'Educational registration and ethical living donor matching (Kidneys, Liver lobes) strictly via verified transplant centers.',
      icon: <Heart className="h-6 w-6 text-teal-600" />,
      colorClass: 'border-t-4 border-t-teal-600',
      tagClass: 'text-teal-700 bg-teal-50 border-teal-200',
      stats: 'Sample Organ Profiles in Demo',
      guidelines: [
        'Strictly non-commercial under NOTA (42 U.S.C. 274e)',
        'Living kidney & partial liver altruistic evaluation',
        'Deceased organ donor pledge card synchronization',
        'Hospital independent donor advocate assigned to each pledge'
      ],
      complianceNote: 'Facilitated exclusively through licensed surgical transplant centers.'
    },
    {
      id: 'bone_tissue',
      title: 'Bone & Tissue Support',
      subtitle: 'Bone Marrow, Stem Cells & Allografts',
      description: 'Connect with certified tissue banks and bone marrow registries for leukemia, lymphoma, and reconstructive surgery.',
      icon: <Bone className="h-6 w-6 text-indigo-600" />,
      colorClass: 'border-t-4 border-t-indigo-600',
      tagClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      stats: 'Sample Marrow Profiles in Demo',
      guidelines: [
        'Ages 18-40 eligible for bone marrow stem cell registry',
        'Simple cheek swab kit delivers full HLA high-res typing',
        'Tissue allografts (bone graft, cornea, skin, heart valves)',
        'Medical board clearance and viral panel screening required'
      ],
      complianceNote: 'Facilitated through accredited tissue banking facilities only.'
    },
    {
      id: 'hair',
      title: 'Hair Donor Finder',
      subtitle: 'Cranial Prosthetics for Pediatric & Adult Oncology',
      description: 'Support pediatric cancer patients and individuals with medical hair loss by donating clean, virgin hair for custom wigs.',
      icon: <Scissors className="h-6 w-6 text-amber-600" />,
      colorClass: 'border-t-4 border-t-amber-600',
      tagClass: 'text-amber-700 bg-amber-50 border-amber-200',
      stats: '53 Custom Wigs Gifted to Children',
      guidelines: [
        'Minimum donation length: 8 to 14+ inches',
        'Hair must be clean, 100% dry, and secured in a ponytail/braid',
        'Virgin (untreated) hair preferred; color-treated accepted by select NGOs',
        'Packaged in a sealed Ziploc bag for sanitary shipping'
      ],
      complianceNote: 'Wigs gifted 100% free of charge to cancer patients through registered 501(c)(3) partners.'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            4 Specialized Donation Programs
          </h2>
          <p className="text-xs text-slate-500">
            One unified platform connecting donors, recipients, and certified healthcare institutions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${cat.colorClass}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  {cat.icon}
                </div>
                <button
                  onClick={() => setActiveGuide(activeGuide === cat.id ? null : cat.id)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title="View clinical criteria"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {cat.title}
              </h3>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                {cat.subtitle}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {cat.description}
              </p>

              {/* Collapsible clinical criteria */}
              {activeGuide === cat.id && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs space-y-2 animate-in fade-in">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Eligibility & Criteria:</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                    {cat.guidelines.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                  <div className="pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-slate-400" />
                    <span>{cat.complianceNote}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-mono text-slate-500">
                {cat.stats}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveFilterCategory(cat.id);
                    setActiveTab('find-donors');
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors truncate"
                >
                  Find Donors
                </button>
                <button
                  onClick={() => {
                    setIsRegisterDonorModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center transition-colors truncate"
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
