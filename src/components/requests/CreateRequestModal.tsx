import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertCircle,
  ShieldCheck,
  Building2,
  Droplet,
  Heart,
  Bone,
  Scissors,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DonationCategory,
  UrgencyLevel,
  BloodGroup,
  BloodComponent,
  OrganType,
  BoneTissueType,
  HairCondition
} from '../../types';

export const CreateRequestModal: React.FC = () => {
  const {
    isCreateRequestModalOpen,
    setIsCreateRequestModalOpen,
    createRequest,
    organizations,
    currentUser
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [category, setCategory] = useState<DonationCategory>('blood');
  const [title, setTitle] = useState('');
  const [patientAlias, setPatientAlias] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [urgency, setUrgency] = useState<UrgencyLevel>('emergency');
  const [deadlineHours, setDeadlineHours] = useState<number>(6);
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [hospitalId, setHospitalId] = useState<string>(organizations[0]?.id || 'org_metro_univ');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Category Specific Fields
  const [targetBloodGroup, setTargetBloodGroup] = useState<BloodGroup>('O-');
  const [bloodComponent, setBloodComponent] = useState<BloodComponent>('whole_blood');
  const [targetOrgan, setTargetOrgan] = useState<OrganType>('kidney');
  const [surgeonName, setSurgeonName] = useState('Dr. Jonathan Wei, FACS');
  const [targetTissue, setTargetTissue] = useState<BoneTissueType>('bone_marrow');
  const [minHairInches, setMinHairInches] = useState<number>(12);
  const [hairRecipientType, setHairRecipientType] = useState<'pediatric_cancer' | 'adult_oncology' | 'alopecia_support'>('pediatric_cancer');

  // Ethical Declaration Checkbox
  const [ethicsAgreed, setEthicsAgreed] = useState(false);

  if (!isCreateRequestModalOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ethicsAgreed) return;

    const selectedOrg = organizations.find(o => o.id === hospitalId);

    const newReqData: any = {
      category,
      title: title.trim() || `${urgency.toUpperCase()}: ${category.replace('_', ' ').toUpperCase()} Requisition for ${patientAlias}`,
      patientAlias: patientAlias.trim() || 'Patient Confidential',
      patientAge: Number(patientAge),
      urgency,
      deadlineHoursRemaining: Number(deadlineHours),
      deadlineDate: urgency === 'emergency' ? `In ${deadlineHours} Hours` : `Within ${deadlineHours} Hours`,
      unitsNeeded: Number(unitsNeeded),
      hospitalId,
      hospitalName: selectedOrg ? selectedOrg.name : 'Authorized Regional Medical Center',
      city: selectedOrg ? selectedOrg.city : 'Chicago',
      state: selectedOrg ? selectedOrg.state : 'IL',
      medicalNotes: medicalNotes.trim() || 'Urgent clinical need confirmed by attending hospital coordinator.'
    };

    if (category === 'blood') {
      newReqData.bloodRequirements = {
        targetBloodGroup,
        compatibleBloodGroups: [targetBloodGroup],
        component: bloodComponent,
        isStatCrossmatchRequired: urgency === 'emergency'
      };
    } else if (category === 'organ') {
      newReqData.organRequirements = {
        organ: targetOrgan,
        transplantSurgeonName: surgeonName,
        clinicalBoardApprovalRef: `TX-REF-${Date.now().toString().slice(-6)}`,
        praScore: '0%'
      };
    } else if (category === 'bone_tissue') {
      newReqData.boneTissueRequirements = {
        tissueType: targetTissue,
        requiredHlaLoci: ['HLA-A*02:01', 'HLA-B*44:02'],
        transplantProtocol: 'Standard Clinical Transplant Protocol'
      };
    } else if (category === 'hair') {
      newReqData.hairRequirements = {
        minInches: minHairInches,
        conditionAccepted: ['virgin_untreated'] as HairCondition[],
        recipientType: hairRecipientType,
        wigMakerPartner: selectedOrg ? selectedOrg.name : 'Registered Cancer Hair Guild'
      };
    }

    createRequest(newReqData);
    setIsCreateRequestModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Submit Clinical Donation Requisition
            </h2>
            <p className="text-xs text-slate-500">
              Step {step} of 4: {
                step === 1 ? 'Select Donation Category' :
                step === 2 ? 'Clinical Specifications & Urgency' :
                step === 3 ? 'Hospital Affiliation & Patient Details' :
                'Ethical & Legal Compliance Affirmation'
              }
            </p>
          </div>
          <button
            onClick={() => setIsCreateRequestModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-teal-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-900">
                Choose Donation Program
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'blood' as DonationCategory,
                    title: 'Blood / Platelets / Plasma',
                    desc: 'Emergency whole blood or apheresis matching for trauma and acute care.',
                    icon: <Droplet className="h-5 w-5 text-rose-600" />
                  },
                  {
                    id: 'organ' as DonationCategory,
                    title: 'Organ Donor Requisition',
                    desc: 'Living altruistic matching (Kidney/Liver) or deceased registry coordination.',
                    icon: <Heart className="h-5 w-5 text-teal-600" />
                  },
                  {
                    id: 'bone_tissue' as DonationCategory,
                    title: 'Bone Marrow & Tissue',
                    desc: 'Stem cell, allograft, and bone marrow HLA registry search.',
                    icon: <Bone className="h-5 w-5 text-indigo-600" />
                  },
                  {
                    id: 'hair' as DonationCategory,
                    title: 'Hair Donation for Cranial Prosthetics',
                    desc: 'Virgin hair requirements for pediatric cancer and alopecia wigs.',
                    icon: <Scissors className="h-5 w-5 text-amber-600" />
                  }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      category === opt.id
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {opt.icon}
                      <span className="font-bold text-slate-900 text-xs">{opt.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Requisition Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Critical STAT: O- Negative Blood Required for Pediatric Surgery"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CLINICAL SPECIFICATIONS & URGENCY */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Urgency Classification
                  </label>
                  <select
                    value={urgency}
                    onChange={e => {
                      const u = e.target.value as UrgencyLevel;
                      setUrgency(u);
                      if (u === 'emergency') setDeadlineHours(6);
                      else if (u === 'urgent') setDeadlineHours(24);
                      else setDeadlineHours(72);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="emergency">Emergency STAT (Immediate Hospital Action)</option>
                    <option value="urgent">Urgent (&lt;24 Hours)</option>
                    <option value="standard">Standard (&lt;72 Hours / Scheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Deadline (Hours Remaining)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={deadlineHours}
                    onChange={e => setDeadlineHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Category Conditional Controls */}
              {category === 'blood' && (
                <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-rose-950 text-xs">Blood Banking Requirements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                        Target Blood Group
                      </label>
                      <select
                        value={targetBloodGroup}
                        onChange={e => setTargetBloodGroup(e.target.value as BloodGroup)}
                        className="w-full p-2 rounded border border-rose-300 text-xs bg-white"
                      >
                        {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                          <option key={bg} value={bg}>
                            Group {bg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                        Component Needed
                      </label>
                      <select
                        value={bloodComponent}
                        onChange={e => setBloodComponent(e.target.value as BloodComponent)}
                        className="w-full p-2 rounded border border-rose-300 text-xs bg-white capitalize"
                      >
                        <option value="whole_blood">Whole Blood</option>
                        <option value="platelets">Apheresis Platelets</option>
                        <option value="plasma">Fresh Frozen Plasma</option>
                        <option value="red_blood_cells">Packed Red Blood Cells</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                      Units Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={unitsNeeded}
                      onChange={e => setUnitsNeeded(Number(e.target.value))}
                      className="w-full p-2 rounded border border-rose-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {category === 'organ' && (
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-teal-950 text-xs">Transplant Specification</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                        Organ Type
                      </label>
                      <select
                        value={targetOrgan}
                        onChange={e => setTargetOrgan(e.target.value as OrganType)}
                        className="w-full p-2 rounded border border-teal-300 text-xs bg-white capitalize"
                      >
                        <option value="kidney">Kidney (Living Altruistic)</option>
                        <option value="liver_lobe">Liver Lobe (Partial living)</option>
                        <option value="cornea">Cornea</option>
                        <option value="heart">Heart (UNOS Waitlist)</option>
                        <option value="lung">Lungs</option>
                        <option value="pancreas">Pancreas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                        Attending Surgeon
                      </label>
                      <input
                        type="text"
                        value={surgeonName}
                        onChange={e => setSurgeonName(e.target.value)}
                        className="w-full p-2 rounded border border-teal-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {category === 'bone_tissue' && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-indigo-950 text-xs">Tissue Specification</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                      Tissue or Cell Category
                    </label>
                    <select
                      value={targetTissue}
                      onChange={e => setTargetTissue(e.target.value as BoneTissueType)}
                      className="w-full p-2 rounded border border-indigo-300 text-xs bg-white capitalize"
                    >
                      <option value="bone_marrow">Bone Marrow (Allogeneic)</option>
                      <option value="stem_cells">Peripheral Blood Stem Cells (PBSC)</option>
                      <option value="bone_graft">Orthopedic Bone Graft</option>
                      <option value="cornea_tissue">Corneal Tissue</option>
                      <option value="skin_graft">Burn Skin Graft Allograft</option>
                      <option value="heart_valve">Heart Valve</option>
                    </select>
                  </div>
                </div>
              )}

              {category === 'hair' && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-amber-950 text-xs">Hair Requirement Specifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Minimum Length (Inches)
                      </label>
                      <select
                        value={minHairInches}
                        onChange={e => setMinHairInches(Number(e.target.value))}
                        className="w-full p-2 rounded border border-amber-300 text-xs bg-white"
                      >
                        <option value={8}>8 Inches</option>
                        <option value={10}>10 Inches</option>
                        <option value={12}>12 Inches</option>
                        <option value={14}>14 Inches (Ideal for Long Wigs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Recipient Population
                      </label>
                      <select
                        value={hairRecipientType}
                        onChange={e => setHairRecipientType(e.target.value as any)}
                        className="w-full p-2 rounded border border-amber-300 text-xs bg-white"
                      >
                        <option value="pediatric_cancer">Pediatric Oncology (&lt;18yo)</option>
                        <option value="adult_oncology">Adult Cancer Patient</option>
                        <option value="alopecia_support">Alopecia Areata Support</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: HOSPITAL & PATIENT DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Patient Alias / Initials (HIPAA Protected)
                  </label>
                  <input
                    type="text"
                    value={patientAlias}
                    onChange={e => setPatientAlias(e.target.value)}
                    placeholder="e.g., Patient T.R. (Bed 4A)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Affiliated Hospital or Organization
                </label>
                <select
                  value={hospitalId}
                  onChange={e => setHospitalId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.regulatoryBody.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Clinical Summary & Medical Justification
                </label>
                <textarea
                  rows={3}
                  value={medicalNotes}
                  onChange={e => setMedicalNotes(e.target.value)}
                  placeholder="Detail clinical diagnosis, trauma circumstances, lab clearance, or wig maker preferences..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: ETHICS AFFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-amber-900">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>National Organ Transplant Act & Platform Ethics Declaration</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  By submitting this clinical donation request, you solemnly declare under penalty of perjury and platform ban that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                  <li>No monetary compensation, commercial exchange, or valuable consideration is offered or requested.</li>
                  <li>All surgical, apheresis, and tissue handling procedures will occur exclusively within certified healthcare institutions.</li>
                  <li>The clinical urgency and patient necessity have been verified by a qualified medical professional.</li>
                  <li>Donors retain complete, uncoerced voluntary consent at all times.</li>
                </ul>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-300 bg-slate-50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ethicsAgreed}
                  onChange={e => setEthicsAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                  I certify that this requisition complies with federal organ transplant laws, voluntary non-commercial guidelines, and clinical ethics standards.
                </span>
              </label>
            </div>
          )}
        </form>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!ethicsAgreed}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                ethicsAgreed
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              Publish Requisition to Clinical Network
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
