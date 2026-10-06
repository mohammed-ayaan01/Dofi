import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, CheckCircle2, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Historical monthly trend data for successful matches over time
const MONTHLY_TREND_DATA = [
  { month: 'Apr', bloodMatches: 24, organMatches: 3, boneMatches: 6, hairMatches: 4, totalMatches: 37, emergencyStat: 14 },
  { month: 'May', bloodMatches: 31, organMatches: 2, boneMatches: 8, hairMatches: 7, totalMatches: 48, emergencyStat: 18 },
  { month: 'Jun', bloodMatches: 42, organMatches: 4, boneMatches: 11, hairMatches: 9, totalMatches: 66, emergencyStat: 22 },
  { month: 'Jul', bloodMatches: 48, organMatches: 5, boneMatches: 14, hairMatches: 11, totalMatches: 78, emergencyStat: 26 },
  { month: 'Aug', bloodMatches: 57, organMatches: 4, boneMatches: 19, hairMatches: 14, totalMatches: 94, emergencyStat: 31 },
  { month: 'Sep', bloodMatches: 68, organMatches: 6, boneMatches: 23, hairMatches: 18, totalMatches: 115, emergencyStat: 39 },
];

export const DonationImpactCharts: React.FC = () => {
  const { impactStats, donors, requests } = useApp();
  const [timeframe, setTimeframe] = useState<'6m' | 'quarter'>('6m');
  const [trendMetric, setTrendMetric] = useState<'total' | 'detailed'>('total');

  // Calculate real-time category distribution from existing state
  const bloodDonorsCount = donors.filter(d => d.categories.includes('blood')).length;
  const organDonorsCount = donors.filter(d => d.categories.includes('organ')).length;
  const boneDonorsCount = donors.filter(d => d.categories.includes('bone_tissue')).length;
  const hairDonorsCount = donors.filter(d => d.categories.includes('hair')).length;

  const bloodRequestsCount = requests.filter(r => r.category === 'blood').length;
  const organRequestsCount = requests.filter(r => r.category === 'organ').length;
  const boneRequestsCount = requests.filter(r => r.category === 'bone_tissue').length;
  const hairRequestsCount = requests.filter(r => r.category === 'hair').length;

  const categoryDistributionData = [
    {
      category: 'Blood',
      donors: bloodDonorsCount * 28 + 120, // scaled representative volume
      fulfilled: 412,
      activeReqs: bloodRequestsCount,
      color: '#e11d48',
      lightColor: '#ffe4e6',
    },
    {
      category: 'Organ',
      donors: organDonorsCount * 14 + 48,
      fulfilled: 19,
      activeReqs: organRequestsCount,
      color: '#0d9488',
      lightColor: '#ccfbf1',
    },
    {
      category: 'Bone & Tissue',
      donors: boneDonorsCount * 18 + 64,
      fulfilled: 84,
      activeReqs: boneRequestsCount,
      color: '#4f46e5',
      lightColor: '#e0e7ff',
    },
    {
      category: 'Hair',
      donors: hairDonorsCount * 16 + 50,
      fulfilled: 53,
      activeReqs: hairRequestsCount,
      color: '#d97706',
      lightColor: '#fef3c7',
    },
  ];

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Title and Control Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Donation Activity Charts
            </h3>
            <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Demonstration Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Illustrative sample data showing how activity would appear across Blood, Organ, Bone, and Hair categories. Not real clinical outcomes.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setTrendMetric('total')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                trendMetric === 'total'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overall Matches
            </button>
            <button
              onClick={() => setTrendMetric('detailed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                trendMetric === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By 4 Categories
            </button>
          </div>
        </div>
      </div>

      {/* Sample Metrics Bar — clearly labelled as demonstration */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50 p-3.5 rounded-xl border border-amber-200/80 text-xs">
        <div>
          <span className="text-[11px] text-amber-700 font-medium">Sample Matches</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">438</div>
          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5 mt-0.5">
            Demo data — not real outcomes
          </span>
        </div>
        <div>
          <span className="text-[11px] text-amber-700 font-medium">Demo Response Time</span>
          <div className="text-xl font-bold text-rose-700 font-mono mt-0.5">3.2 hrs</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5">Illustrative figure</span>
        </div>
        <div>
          <span className="text-[11px] text-amber-700 font-medium">AI Analysis Demo</span>
          <div className="text-xl font-bold text-teal-700 font-mono mt-0.5">AI-Assisted</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5">Requires clinical review</span>
        </div>
        <div>
          <span className="text-[11px] text-amber-700 font-medium">Platform Status</span>
          <div className="text-xl font-bold text-indigo-700 font-mono mt-0.5">100%</div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-0.5">Strict NOTA & WHO standard</span>
        </div>
      </div>

      {/* Dual Charts Grid: Left = Trend Line Over Time, Right = Bar Distribution by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Trend Line for Successful Matches Over Time */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              <span>Successful Matches Over Time (Trend)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Past 6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendMetric === 'total' ? (
                <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="statGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="totalMatches"
                    name="All Successful Matches"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#totalGlow)"
                  />
                  <Area
                    type="monotone"
                    dataKey="emergencyStat"
                    name="Emergency STAT Matches"
                    stroke="#e11d48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#statGlow)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="bloodMatches" name="Blood" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="organMatches" name="Organ" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="boneMatches" name="Bone/Tissue" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="hairMatches" name="Hair" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Steady growth in matched donor requisitions</span>
            <span className="font-semibold text-teal-700">115 matches in Sep</span>
          </div>
        </div>

        {/* Chart 2: Bar Chart showing Distribution by Donation Type */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>Distribution by Donation Type (Fulfilled vs Registered)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">4 Donation Programs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryDistributionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="fulfilled" name="Fulfilled Donations / Units" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="donors" name="Registered Available Donors" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 text-center text-[10px]">
            <div className="text-rose-700 font-medium">
              <span className="block font-bold">Blood</span>
              <span>Sample data</span>
            </div>
            <div className="text-teal-700 font-medium">
              <span className="block font-bold">Organ</span>
              <span>Sample data</span>
            </div>
            <div className="text-indigo-700 font-medium">
              <span className="block font-bold">Bone/Marrow</span>
              <span>Sample data</span>
            </div>
            <div className="text-amber-700 font-medium">
              <span className="block font-bold">Hair</span>
              <span>53 Wigs Gifted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
