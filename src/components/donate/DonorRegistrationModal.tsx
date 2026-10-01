import React, { useState } from 'react';
import {
  X,
  Heart,
  Droplet,
  Bone,
  Scissors,
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DonationCategory,
  BloodGroup,
  BloodComponent,
  OrganType,
  BoneTissueType,
  HairCondition,
  HairTexture
} from '../../types';

export const DonorRegistrationModal: React.FC = () => {
  const {
    isRegisterDonorModalOpen,
    setIsRegisterDonorModalOpen,
    registerDonor,
    currentUser,
    openAiModule
  } = useApp();

  const [selectedCategories, setSelectedCategories] = useState<DonationCategory[]>(['blood']);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available_now' | 'available_24h' | 'on_call'>('available_now');
  const [privacySetting, setPrivacySetting] = useState<'hospital_mediated' | 'direct_authorized'>('hospital_mediated');

  // Blood details
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [bloodComponents, setBloodComponents] = useState<BloodComponent[]>(['whole_blood', 'platelets']);

  // Organ details
  const [organsPledged, setOrgansPledged] = useState<OrganType[]>(['kidney', 'cornea']);
  const [organDonationType, setOrganDonationType] = useState<'living_altruistic' | 'deceased_registry'>('living_altruistic');
  const [nextOfKinInformed, setNextOfKinInformed] = useState(true);

  // Bone / Tissue
  const [tissueTypes, setTissueTypes] = useState<BoneTissueType[]>(['bone_marrow', 'stem_cells']);
  const [swabKitRequested, setSwabKitRequested] = useState(true);

  // Hair details
  const [hairLength, setHairLength] = useState<number>(14);
  const [hairCondition, setHairCondition] = useState<HairCondition>('virgin_untreated');
  const [hairTexture, setHairTexture] = useState<HairTexture>('straight');
  const [hairColor, setHairColor] = useState('Natural Brown');

  // Ethics agreement
  const [ethicsAccepted, setEthicsAccepted] = useState(false);

  if (!isRegisterDonorModalOpen) return null;

  const toggleCategory = (cat: DonationCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ethicsAccepted) return;

    const donorData: any = {
      categories: selectedCategories,
      availabilityStatus,
      privacySetting,
      totalDonationsCount: 1,
      isVerified: true
    };

    if (selectedCategories.includes('blood')) {
      donorData.bloodDetails = {
        bloodGroup,
        components: bloodComponents,
        rhFactor: bloodGroup.includes('-') ? '-' : '+',
        hemoglobinLevel: '14.8 g/dL'
      };
    }

    if (selectedCategories.includes('organ')) {
      donorData.organDetails = {
        organsPledged,
        donationType: organDonationType,
        transplantCenterRegistryId: `IL-DOR-${Date.now().toString().slice(-6)}`,
        consentingNextOfKin: nextOfKinInformed
      };
    }

    if (selectedCategories.includes('bone_tissue')) {
      donorData.boneTissueDetails = {
        tissueTypes,
        hlaTypingAvailable: true,
        marrowRegistryId: `NMDP-IL-${Date.now().toString().slice(-5)}`,
        swabKitStatus: swabKitRequested ? 'completed' : 'not_requested'
      };
    }

    if (selectedCategories.includes('hair')) {
      donorData.hairDetails = {
        lengthInches: hairLength,
        condition: hairCondition,
        texture: hairTexture,
        color: hairColor,
        packagedMethod: 'braided_ziplock',
        willingToMail: true
      };
    }

    registerDonor(donorData);
    setIsRegisterDonorModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-teal-600 text-white">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Register as Voluntary Donor
              </h2>
              <p className="text-xs text-slate-500">
                Pledge assistance across Blood, Organ, Bone Marrow, and Hair programs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegisterDonorModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* AI Pre-Screen Callout */}
          <div className="p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-xl flex items-center justify-between gap-3 border border-emerald-800/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-white">Unsure About Eligibility?</div>
                <div className="text-[11px] text-slate-300">
                  Pre-screen medications, travel deferrals, tattoos, and health history with our AI triage assistant.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsRegisterDonorModalOpen(false);
                openAiModule('screener');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition cursor-pointer shadow-xs"
            >
              Pre-Screen with AI →
            </button>
          </div>

          {/* Select Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Select Donation Program(s) You Wish to Register For:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'blood' as DonationCategory, label: 'Blood Donor', icon: <Droplet className="h-4 w-4 text-rose-600" /> },
                { id: 'organ' as DonationCategory, label: 'Organ Pledge', icon: <Heart className="h-4 w-4 text-teal-600" /> },
                { id: 'bone_tissue' as DonationCategory, label: 'Bone & Tissue', icon: <Bone className="h-4 w-4 text-indigo-600" /> },
                { id: 'hair' as DonationCategory, label: 'Hair Donor', icon: <Scissors className="h-4 w-4 text-amber-600" /> }
              ].map(cat => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 font-bold text-slate-900 ring-1 ring-teal-500'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blood Details */}
          {selectedCategories.includes('blood') && (
            <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3">
              <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                <Droplet className="h-4 w-4 text-rose-600" />
                <span>Blood Banking Profile</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                    Your Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full p-2 rounded border border-rose-300 text-xs bg-white"
                  >
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>
                        Group {bg} {bg === 'O-' ? '(Universal Donor)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                    Eligible Components
                  </label>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={bloodComponents.includes('whole_blood')}
                        onChange={() => {
                          setBloodComponents(prev =>
                            prev.includes('whole_blood')
                              ? prev.filter(c => c !== 'whole_blood')
                              : [...prev, 'whole_blood']
                          );
                        }}
                      />
                      <span>Whole Blood</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={bloodComponents.includes('platelets')}
                        onChange={() => {
                          setBloodComponents(prev =>
                            prev.includes('platelets')
                              ? prev.filter(c => c !== 'platelets')
                              : [...prev, 'platelets']
                          );
                        }}
                      />
                      <span>Platelets</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={bloodComponents.includes('plasma')}
                        onChange={() => {
                          setBloodComponents(prev =>
                            prev.includes('plasma')
                              ? prev.filter(c => c !== 'plasma')
                              : [...prev, 'plasma']
                          );
                        }}
                      />
                      <span>Plasma</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organ Details */}
          {selectedCategories.includes('organ') && (
            <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl space-y-3">
              <h4 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-teal-600" />
                <span>Organ Donation Pledge</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                    Donation Model
                  </label>
                  <select
                    value={organDonationType}
                    onChange={e => setOrganDonationType(e.target.value as any)}
                    className="w-full p-2 rounded border border-teal-300 text-xs bg-white"
                  >
                    <option value="living_altruistic">Living Altruistic Evaluation (Kidney / Liver lobe)</option>
                    <option value="deceased_registry">Official Deceased Registry Pledge Synchronization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                    Organs Included in Pledge
                  </label>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {(['kidney', 'liver_lobe', 'cornea'] as OrganType[]).map(o => (
                      <label key={o} className="flex items-center gap-1 capitalize">
                        <input
                          type="checkbox"
                          checked={organsPledged.includes(o)}
                          onChange={() => {
                            setOrgansPledged(prev =>
                              prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]
                            );
                          }}
                        />
                        <span>{o.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[11px] text-teal-900">
                <input
                  type="checkbox"
                  checked={nextOfKinInformed}
                  onChange={e => setNextOfKinInformed(e.target.checked)}
                />
                <span>I have discussed my organ donation pledge with my family / next-of-kin.</span>
              </label>
            </div>
          )}

          {/* Bone & Tissue */}
          {selectedCategories.includes('bone_tissue') && (
            <div className="p-4 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-3">
              <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <Bone className="h-4 w-4 text-indigo-600" />
                <span>Bone Marrow & Tissue Registry</span>
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] text-indigo-900 font-semibold">
                  <input
                    type="checkbox"
                    checked={swabKitRequested}
                    onChange={e => setSwabKitRequested(e.target.checked)}
                  />
                  <span>Mail me a free cheek swab kit to register my HLA typing on the national marrow registry.</span>
                </label>
              </div>
            </div>
          )}

          {/* Hair Details */}
          {selectedCategories.includes('hair') && (
            <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3">
              <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Scissors className="h-4 w-4 text-amber-600" />
                <span>Hair Donation Specifications</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                    Available Length
                  </label>
                  <select
                    value={hairLength}
                    onChange={e => setHairLength(Number(e.target.value))}
                    className="w-full p-2 rounded border border-amber-300 text-xs bg-white"
                  >
                    <option value={8}>8 Inches</option>
                    <option value={10}>10 Inches</option>
                    <option value={12}>12 Inches</option>
                    <option value={14}>14 Inches</option>
                    <option value={16}>16+ Inches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                    Condition
                  </label>
                  <select
                    value={hairCondition}
                    onChange={e => setHairCondition(e.target.value as any)}
                    className="w-full p-2 rounded border border-amber-300 text-xs bg-white"
                  >
                    <option value="virgin_untreated">Virgin (Untreated)</option>
                    <option value="color_treated_safe">Color-Treated (Gentle)</option>
                    <option value="gray_permitted">Gray Permitted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                    Texture
                  </label>
                  <select
                    value={hairTexture}
                    onChange={e => setHairTexture(e.target.value as any)}
                    className="w-full p-2 rounded border border-amber-300 text-xs bg-white capitalize"
                  >
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                    <option value="coily">Coily</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Availability Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Privacy & Availability Preferences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Availability Status
                </label>
                <select
                  value={availabilityStatus}
                  onChange={e => setAvailabilityStatus(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="available_now">Available Immediately</option>
                  <option value="available_24h">Available within 24 Hours</option>
                  <option value="on_call">On-Call for Emergency Transfusions</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Contact Privacy Mode
                </label>
                <select
                  value={privacySetting}
                  onChange={e => setPrivacySetting(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="hospital_mediated">Hospital Mediated Only (Most Secure)</option>
                  <option value="direct_authorized">Direct Contact for Verified Coordinators</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mandatory Ethics Affirmation */}
          <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Voluntary Altruistic Declaration</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              I acknowledge that donation of organs, bone, tissue, blood, or hair is strictly voluntary and non-commercial. I affirm I am not seeking nor will accept monetary compensation.
            </p>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ethicsAccepted}
                onChange={e => setEthicsAccepted(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>I Accept Platform Health & Legal Guidelines</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterDonorModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!ethicsAccepted}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                ethicsAccepted
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Complete Registration & Join Registry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
