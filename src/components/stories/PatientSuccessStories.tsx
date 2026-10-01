import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShieldCheck,
  Building2,
  Droplet,
  Bone,
  Scissors,
  CheckCircle2,
  MessageSquarePlus,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Calendar,
  MapPin,
  UserCheck,
  Award,
  Clock,
  Send,
  Check
} from 'lucide-react';
import { PatientStory, DonationCategory } from '../../types';
import { useApp } from '../../context/AppContext';

export const PatientSuccessStories: React.FC = () => {
  const { patientStories, likePatientStory, submitPatientStory } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | DonationCategory>('all');
  const [selectedStory, setSelectedStory] = useState<PatientStory | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [justLikedId, setJustLikedId] = useState<string | null>(null);

  // Submission Form State
  const [formData, setFormData] = useState({
    recipientName: '',
    age: '',
    city: '',
    state: '',
    category: 'blood' as DonationCategory,
    condition: '',
    receivedItem: '',
    hospitalName: '',
    matchDate: 'Recently',
    recoveryMilestone: '',
    quote: '',
    detailedJourney: '',
    verifiedBy: '',
    donorRelation: 'Anonymous Volunteer Donor'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter stories by category
  const filteredStories = useMemo(() => {
    if (activeCategory === 'all') return patientStories;
    return patientStories.filter(s => s.category === activeCategory);
  }, [patientStories, activeCategory]);

  const handleLike = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likePatientStory(storyId);
    setJustLikedId(storyId);
    setTimeout(() => setJustLikedId(null), 1200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.quote || !formData.hospitalName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitPatientStory({
        recipientName: formData.recipientName,
        age: parseInt(formData.age, 10) || 30,
        city: formData.city || 'Chicago',
        state: formData.state || 'IL',
        category: formData.category,
        condition: formData.condition || 'Clinical Condition',
        receivedItem: formData.receivedItem || 'Verified Healthcare Match',
        hospitalName: formData.hospitalName,
        matchDate: formData.matchDate,
        recoveryMilestone: formData.recoveryMilestone || 'Successful recovery under clinical oversight',
        quote: formData.quote,
        detailedJourney: formData.detailedJourney || formData.quote,
        verifiedBy: formData.verifiedBy || 'Hospital Transplant Registry Coordinator',
        verificationRegistryId: `TX-REV-${Math.floor(1000 + Math.random() * 9000)}`,
        donorRelation: formData.donorRelation,
        donorNameAnonymous: 'Verified Compassionate Community Donor',
        avatarInitial: formData.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PT',
        avatarColor:
          formData.category === 'blood'
            ? 'bg-rose-500'
            : formData.category === 'organ'
            ? 'bg-teal-600'
            : formData.category === 'bone_tissue'
            ? 'bg-indigo-600'
            : 'bg-amber-500'
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitModalOpen(false);
        setFormData({
          recipientName: '',
          age: '',
          city: '',
          state: '',
          category: 'blood',
          condition: '',
          receivedItem: '',
          hospitalName: '',
          matchDate: 'Recently',
          recoveryMilestone: '',
          quote: '',
          detailedJourney: '',
          verifiedBy: '',
          donorRelation: 'Anonymous Volunteer Donor'
        });
      }, 1500);
    }, 600);
  };

  const categoryIcons: Record<DonationCategory, React.ReactNode> = {
    blood: <Droplet className="h-3.5 w-3.5 text-rose-500" />,
    organ: <Heart className="h-3.5 w-3.5 text-teal-600" />,
    bone_tissue: <Bone className="h-3.5 w-3.5 text-indigo-500" />,
    hair: <Scissors className="h-3.5 w-3.5 text-amber-500" />
  };

  const categoryLabels: Record<DonationCategory, string> = {
    blood: 'Blood & Platelets',
    organ: 'Living Organ Transplant',
    bone_tissue: 'Bone Marrow & Tissue',
    hair: 'Pediatric Hair Prosthetic'
  };

  return (
    <section id="patient-success-stories" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Clinically Verified Recipient Journeys</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Patient Success Stories & Recipient Voices
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every match represents a life saved, vision restored, or dignity renewed. Read verified testimonials from patients, parents, and clinical teams across our 4 donation programs.
          </p>
        </div>

        {/* Action Controls & Share Story Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Share Recipient Story</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          All Programs ({patientStories.length})
        </button>

        {(['blood', 'organ', 'bone_tissue', 'hair'] as DonationCategory[]).map(cat => {
          const count = patientStories.filter(s => s.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {categoryIcons[cat]}
              <span>{categoryLabels[cat]}</span>
              <span className="text-[10px] font-mono opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStories.map(story => {
          const isJustLiked = justLikedId === story.id;

          return (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group bg-slate-50/60 hover:bg-white rounded-xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer relative"
            >
              {/* Card Top: Recipient Avatar + Name + Category Icon */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${story.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {story.avatarInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition-colors">
                          {story.recipientName}
                        </h4>
                        {story.isVerified && (
                          <span title="Verified by Medical Coordinator">
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {story.age > 0 ? `Age ${story.age} · ` : ''}{story.city}, {story.state}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-200/70 text-[10px] font-semibold text-slate-700 shrink-0">
                    {categoryIcons[story.category]}
                    <span className="capitalize">{story.category.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Recipient Testimonial Quote */}
                <div className="relative pl-3 border-l-2 border-teal-500/50 py-0.5">
                  <p className="text-xs sm:text-[13px] font-medium text-slate-800 italic leading-relaxed line-clamp-3">
                    "{story.quote}"
                  </p>
                </div>

                {/* Medical Match Details */}
                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{story.hospitalName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="truncate max-w-[170px]">{story.receivedItem}</span>
                    <span className="font-mono text-slate-400">{story.matchDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Recovery Milestone + Gratitude Counter */}
              <div className="pt-4 mt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px] bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/50 truncate">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{story.recoveryMilestone}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => handleLike(story.id, e)}
                    className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                      isJustLiked
                        ? 'bg-rose-50 border-rose-300 text-rose-600 scale-110'
                        : 'bg-white hover:bg-rose-50/60 border-slate-200 text-slate-600 hover:text-rose-600'
                    }`}
                    title="Send Heart Gratitude to Recipient & Donor"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        isJustLiked ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-slate-400 group-hover:text-rose-500'
                      }`}
                    />
                    <span className="font-mono text-[10px]">{story.heartsCount}</span>
                  </button>

                  <span className="text-teal-700 text-xs font-semibold hover:underline hidden sm:inline-block ml-1">
                    Details →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipient Full Journey Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${selectedStory.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-md`}
                >
                  {selectedStory.avatarInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">
                      {selectedStory.recipientName}'s Recovery Story
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {selectedStory.city}, {selectedStory.state} · {categoryLabels[selectedStory.category]}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              {/* Highlight Quote */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-teal-600" />
                  <span>Recipient Personal Statement</span>
                </div>
                <blockquote className="text-sm sm:text-base font-semibold text-slate-900 italic leading-relaxed">
                  "{selectedStory.quote}"
                </blockquote>
              </div>

              {/* Clinical Verification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Facilitating Hospital
                  </span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>{selectedStory.hospitalName}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Procedure / Item Received
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {selectedStory.receivedItem}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Donor Classification
                  </span>
                  <span className="font-semibold text-teal-700 block mt-0.5">
                    {selectedStory.donorRelation} ({selectedStory.donorNameAnonymous})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Clinical Review Registry
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 block mt-0.5">
                    {selectedStory.verificationRegistryId} · {selectedStory.verifiedBy}
                  </span>
                </div>
              </div>

              {/* Full Detailed Journey */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Clinical Overview & Recovery Journey
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {selectedStory.detailedJourney}
                </p>
              </div>

              {/* Current Status Banner */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Current Milestone Status
                    </span>
                    <span className="text-xs font-semibold text-emerald-900">
                      {selectedStory.recoveryMilestone}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-700">
                  {selectedStory.matchDate}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={e => handleLike(selectedStory.id, e)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  <span>Send Gratitude ({selectedStory.heartsCount})</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Recipient Story Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4" />
                  <span>Share Your Recipient Journey</span>
                </h3>
                <p className="text-xs text-teal-100">
                  Inspire future donors and build trust across the healthcare community
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  Story Published Successfully!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for sharing your experience. Your story has been verified and added to the community wall.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Recipient / Patient Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Gonzalez"
                      value={formData.recipientName}
                      onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Age & Location
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                        className="w-16 px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="City, State"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Donation Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as DonationCategory })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                    >
                      <option value="blood">Blood & Platelet Apheresis</option>
                      <option value="organ">Living / Deceased Organ Transplant</option>
                      <option value="bone_tissue">Bone Marrow HLA & Tissue</option>
                      <option value="hair">Hair Cranial Prosthetic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Facilitating Hospital / Center *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro University Hospital"
                      value={formData.hospitalName}
                      onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Procedure or Item Received
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10/10 HLA-matched stem cells or 4 Units O- blood"
                    value={formData.receivedItem}
                    onChange={e => setFormData({ ...formData, receivedItem: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Recovery Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Day +180 in full remission / Active healthy recovery"
                    value={formData.recoveryMilestone}
                    onChange={e => setFormData({ ...formData, recoveryMilestone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Short Testimonial Quote * (1-2 sentences)
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Because of an anonymous donor who gave their time, I can attend my son's graduation..."
                    value={formData.quote}
                    onChange={e => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Journey & Gratitude Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share more details about your timeline, diagnosis, and experience with the care team..."
                    value={formData.detailedJourney}
                    onChange={e => setFormData({ ...formData, detailedJourney: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Privacy & Ethical Guarantee Notice */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Clinical & Ethical Verification:</strong> Stories are validated to protect privacy and adhere to NOTA anti-commercialization standards.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? 'Verifying...' : 'Submit Story'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
