import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  DonationCategory,
  DonationRequest,
  DonorProfile,
  Organization,
  NotificationItem,
  VerificationItem,
  ModerationReport,
  RequestStatus,
  ImpactStats,
  BloodGroup,
  ScheduledSlot,
  BloodDrive,
  PatientStory
} from '../types';
import {
  CURRENT_USER_MOCK,
  DEMO_USERS,
  ORGANIZATIONS_MOCK,
  DONOR_PROFILES_MOCK,
  DONATION_REQUESTS_MOCK,
  NOTIFICATIONS_MOCK,
  VERIFICATION_QUEUE_MOCK,
  MODERATION_REPORTS_MOCK,
  BLOOD_COMPATIBILITY_MAP,
  BLOOD_DRIVES_MOCK,
  PATIENT_STORIES_MOCK
} from '../data/mockData';
import { CancerHospital, WORLD_CANCER_HOSPITALS } from '../data/cancerHospitalsData';
import {
  auth,
  db,
  signInWithGoogle,
  signOutFirebaseUser,
  saveDonationRegistrationToFirestore,
  RegisteredAppUser,
  FirebaseDonationRegistration
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, setDoc, doc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  requests: DonationRequest[];
  donors: DonorProfile[];
  organizations: Organization[];
  bloodDrives: BloodDrive[];
  patientStories: PatientStory[];
  notifications: NotificationItem[];
  verificationQueue: VerificationItem[];
  reports: ModerationReport[];
  impactStats: ImpactStats;
  
  // UI state
  activeTab: 'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations';
  setActiveTab: (tab: 'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations') => void;
  activeFilterCategory: 'all' | DonationCategory;
  setActiveFilterCategory: (cat: 'all' | DonationCategory) => void;
  selectedRequest: DonationRequest | null;
  setSelectedRequest: (req: DonationRequest | null) => void;
  selectedDonor: DonorProfile | null;
  setSelectedDonor: (donor: DonorProfile | null) => void;
  isCreateRequestModalOpen: boolean;
  setIsCreateRequestModalOpen: (open: boolean) => void;
  isRegisterDonorModalOpen: boolean;
  setIsRegisterDonorModalOpen: (open: boolean) => void;
  isEthicsModalOpen: boolean;
  setIsEthicsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportingTarget: { id: string; name: string; type: 'donor' | 'request' | 'user' } | null;
  setReportingTarget: (target: { id: string; name: string; type: 'donor' | 'request' | 'user' } | null) => void;

  // AI Suite specific state & shortcuts
  aiPreselectedRequest: DonationRequest | null;
  setAiPreselectedRequest: (req: DonationRequest | null) => void;
  aiPreselectedDonor: DonorProfile | null;
  setAiPreselectedDonor: (donor: DonorProfile | null) => void;
  aiActiveModule: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude';
  setAiActiveModule: (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => void;
  openAiWithRequest: (req: DonationRequest) => void;
  openAiWithDonor: (donor: DonorProfile) => void;
  openAiModule: (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => void;

  // Cancer Hospital & Portal state
  selectedCancerHospital: CancerHospital | null;
  setSelectedCancerHospital: (hospital: CancerHospital | null) => void;
  cancerHospitalSearchQuery: string;
  setCancerHospitalSearchQuery: (query: string) => void;
  openHospitalPortalForCancerHospital: (hospital: CancerHospital) => void;

  // Firebase Auth & Live Database state
  firebaseUser: FirebaseUser | null;
  registeredAppUser: RegisteredAppUser | null;
  registeredAppUsersList: RegisteredAppUser[];
  firebaseDonationsList: FirebaseDonationRegistration[];
  isFirebaseLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutFirebase: () => Promise<void>;
  registerDonationToFirebase: (data: Partial<FirebaseDonationRegistration>) => Promise<FirebaseDonationRegistration>;

  // Actions
  createRequest: (newReq: Partial<DonationRequest>) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, note?: string) => void;
  registerDonor: (donorData: Partial<DonorProfile>) => void;
  approveVerification: (id: string, notes?: string) => void;
  rejectVerification: (id: string, notes?: string) => void;
  submitModerationReport: (report: { reportedItemId: string; itemType: 'donor' | 'request' | 'user'; reason: ModerationReport['reason']; details: string }) => void;
  resolveReport: (id: string) => void;
  dismissReport: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  computeMatchScore: (request: DonationRequest, donor: DonorProfile) => number;
  addDonorScheduledSlot: (donorId: string, slot: Omit<ScheduledSlot, 'id'>) => void;
  removeDonorScheduledSlot: (donorId: string, slotId: string) => void;
  registerForBloodDrive: (driveId: string) => boolean;
  likePatientStory: (storyId: string) => void;
  submitPatientStory: (story: Omit<PatientStory, 'id' | 'heartsCount' | 'isVerified'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dc4c_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER_MOCK;
  });

  const [requests, setRequests] = useState<DonationRequest[]>(() => {
    const saved = localStorage.getItem('dc4c_requests');
    return saved ? JSON.parse(saved) : DONATION_REQUESTS_MOCK;
  });

  const [donors, setDonors] = useState<DonorProfile[]>(() => {
    const saved = localStorage.getItem('dc4c_donors');
    if (!saved) return DONOR_PROFILES_MOCK;
    try {
      const parsed: DonorProfile[] = JSON.parse(saved);
      return parsed.map(p => {
        const defaultDonor = DONOR_PROFILES_MOCK.find(d => d.id === p.id);
        return {
          ...p,
          scheduledSlots: (p.scheduledSlots && p.scheduledSlots.length > 0)
            ? p.scheduledSlots
            : (defaultDonor?.scheduledSlots || [])
        };
      });
    } catch {
      return DONOR_PROFILES_MOCK;
    }
  });

  const [organizations] = useState<Organization[]>(ORGANIZATIONS_MOCK);

  const [bloodDrives, setBloodDrives] = useState<BloodDrive[]>(() => {
    const saved = localStorage.getItem('dc4c_blood_drives');
    return saved ? JSON.parse(saved) : BLOOD_DRIVES_MOCK;
  });

  const [patientStories, setPatientStories] = useState<PatientStory[]>(() => {
    const saved = localStorage.getItem('dc4c_patient_stories');
    return saved ? JSON.parse(saved) : PATIENT_STORIES_MOCK;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('dc4c_notifications');
    return saved ? JSON.parse(saved) : NOTIFICATIONS_MOCK;
  });

  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(() => {
    const saved = localStorage.getItem('dc4c_verifications');
    return saved ? JSON.parse(saved) : VERIFICATION_QUEUE_MOCK;
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem('dc4c_reports');
    return saved ? JSON.parse(saved) : MODERATION_REPORTS_MOCK;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations'>('dashboard');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'all' | DonationCategory>('all');
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [isRegisterDonorModalOpen, setIsRegisterDonorModalOpen] = useState(false);
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ id: string; name: string; type: 'donor' | 'request' | 'user' } | null>(null);

  // Firebase Auth & Firestore live state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [registeredAppUser, setRegisteredAppUser] = useState<RegisteredAppUser | null>(null);
  const [registeredAppUsersList, setRegisteredAppUsersList] = useState<RegisteredAppUser[]>([]);
  const [firebaseDonationsList, setFirebaseDonationsList] = useState<FirebaseDonationRegistration[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(false);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setCurrentUser(prev => ({
          ...prev,
          name: fbUser.displayName || prev.name,
          email: fbUser.email || prev.email,
          avatarUrl: fbUser.photoURL || prev.avatarUrl
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore users listener
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const users = snapshot.docs.map(d => d.data() as RegisteredAppUser);
        setRegisteredAppUsersList(users);
      } else {
        const initialUsers: RegisteredAppUser[] = [
          {
            id: 'usr_marcus_vance',
            displayName: 'Marcus Vance',
            email: 'marcus.vance@donorconnect4care.org',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            role: 'donor',
            isVerified: true,
            donationsRegisteredCount: 4,
            createdAt: '2024-01-15T08:30:00.000Z',
            lastLoginAt: new Date().toISOString(),
            provider: 'google'
          },
          {
            id: 'usr_ananya_sharma',
            displayName: 'Ananya Sharma, RN',
            email: 'ananya.sharma@donorconnect4care.org',
            photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            role: 'donor',
            isVerified: true,
            donationsRegisteredCount: 6,
            createdAt: '2024-02-10T11:20:00.000Z',
            lastLoginAt: new Date().toISOString(),
            provider: 'google'
          },
          {
            id: 'usr_elena_rostova',
            displayName: 'Elena Rostova',
            email: 'elena.rostova@care.net',
            photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
            role: 'recipient',
            isVerified: true,
            donationsRegisteredCount: 1,
            createdAt: '2024-03-01T14:45:00.000Z',
            lastLoginAt: new Date().toISOString(),
            provider: 'google'
          },
          {
            id: 'usr_dr_sarah_chen',
            displayName: 'Dr. Sarah Chen, MD',
            email: 'sarah.chen@metromedical.org',
            photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
            role: 'hospital_staff',
            isVerified: true,
            donationsRegisteredCount: 12,
            createdAt: '2023-11-01T09:00:00.000Z',
            lastLoginAt: new Date().toISOString(),
            provider: 'google'
          },
          {
            id: 'usr_compliance_officer',
            displayName: 'Platform Compliance Officer',
            email: 'compliance@donorconnect4care.org',
            photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
            role: 'admin',
            isVerified: true,
            donationsRegisteredCount: 0,
            createdAt: '2023-10-01T00:00:00.000Z',
            lastLoginAt: new Date().toISOString(),
            provider: 'google'
          }
        ];
        initialUsers.forEach(u => {
          setDoc(doc(db, 'users', u.id), u).catch(() => {});
        });
        setRegisteredAppUsersList(initialUsers);
      }
    }, (error) => {
      console.warn('[Firestore] users snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore donation registrations listener
  useEffect(() => {
    const q = query(collection(db, 'donation_registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const donations = snapshot.docs.map(d => d.data() as FirebaseDonationRegistration);
        setFirebaseDonationsList(donations);
      } else {
        const initialDonations: FirebaseDonationRegistration[] = [
          {
            id: 'reg_don_001',
            registeredByUserId: 'usr_marcus_vance',
            registeredByUserEmail: 'marcus.vance@donorconnect4care.org',
            registeredByUserName: 'Marcus Vance',
            donorName: 'Marcus Vance',
            phone: '+1 (312) 555-0199',
            email: 'marcus.vance@donorconnect4care.org',
            city: 'Chicago',
            state: 'IL',
            categories: ['blood', 'bone_tissue'],
            bloodGroup: 'O-',
            availabilityStatus: 'available_now',
            verificationBadge: 'Verified Platform Registrant',
            status: 'active',
            medicalNotes: 'Whole Blood & Platelets apheresis pledged. HLA swab kit completed.',
            createdAt: '2024-02-14T09:15:00.000Z'
          },
          {
            id: 'reg_don_002',
            registeredByUserId: 'usr_ananya_sharma',
            registeredByUserEmail: 'ananya.sharma@donorconnect4care.org',
            registeredByUserName: 'Ananya Sharma, RN',
            donorName: 'Ananya Sharma, RN',
            phone: '+1 (312) 555-0288',
            email: 'ananya.sharma@donorconnect4care.org',
            city: 'Evanston',
            state: 'IL',
            categories: ['blood', 'organ'],
            bloodGroup: 'A+',
            availabilityStatus: 'available_now',
            verificationBadge: 'Clinical Professional Verified',
            status: 'active',
            medicalNotes: 'Living altruistic kidney and cornea pledged. Consenting next-of-kin informed.',
            createdAt: '2024-03-05T13:40:00.000Z'
          },
          {
            id: 'reg_don_003',
            registeredByUserId: 'usr_dr_sarah_chen',
            registeredByUserEmail: 'sarah.chen@metromedical.org',
            registeredByUserName: 'Dr. Sarah Chen, MD',
            donorName: 'Chloe Bennett',
            phone: '+1 (312) 555-0377',
            email: 'chloe.bennett@care.org',
            city: 'Oak Park',
            state: 'IL',
            categories: ['hair'],
            availabilityStatus: 'available_now',
            verificationBadge: 'Wig Guild Certified',
            status: 'completed',
            medicalNotes: '14-inch untreated virgin hair pledged and packaged for pediatric cranial oncology prosthetics.',
            createdAt: '2024-03-12T16:20:00.000Z'
          },
          {
            id: 'reg_don_004',
            registeredByUserId: 'usr_marcus_vance',
            registeredByUserEmail: 'marcus.vance@donorconnect4care.org',
            registeredByUserName: 'Marcus Vance',
            donorName: 'David K. Miller',
            phone: '+1 (312) 555-0455',
            email: 'david.miller@donorconnect4care.org',
            city: 'Naperville',
            state: 'IL',
            categories: ['bone_tissue', 'blood'],
            bloodGroup: 'B+',
            availabilityStatus: 'scheduled',
            verificationBadge: 'FACT / NMDP Registered',
            status: 'scheduled',
            medicalNotes: 'Allogeneic bone marrow harvest procedure scheduled for acute leukemia patient.',
            scheduledDate: '2026-10-15',
            createdAt: '2024-03-20T10:00:00.000Z'
          }
        ];
        initialDonations.forEach(d => {
          setDoc(doc(db, 'donation_registrations', d.id), d).catch(() => {});
        });
        setFirebaseDonationsList(initialDonations);
      }
    }, (error) => {
      console.warn('[Firestore] donation_registrations snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsFirebaseLoading(true);
    try {
      const appUser = await signInWithGoogle();
      setRegisteredAppUser(appUser);
      const notif: NotificationItem = {
        id: `notif_login_${Date.now()}`,
        userId: appUser.id,
        title: 'Google Sign-In Successful',
        message: `Welcome, ${appUser.displayName}! Your account is securely connected to Firebase and tracked in Firestore.`,
        category: 'blood',
        urgency: 'standard',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [notif, ...prev]);
    } catch (err) {
      console.error('Firebase sign-in error:', err);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOutFirebaseUser();
      setFirebaseUser(null);
      setRegisteredAppUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const registerDonationToFirebase = async (data: Partial<FirebaseDonationRegistration>) => {
    const regRecord: Omit<FirebaseDonationRegistration, 'createdAt'> & { createdAt?: string } = {
      id: data.id || `reg_${Date.now()}`,
      registeredByUserId: firebaseUser ? firebaseUser.uid : currentUser.id,
      registeredByUserEmail: firebaseUser ? (firebaseUser.email || currentUser.email) : currentUser.email,
      registeredByUserName: firebaseUser ? (firebaseUser.displayName || currentUser.name) : currentUser.name,
      donorName: data.donorName || currentUser.name,
      phone: data.phone || currentUser.phone,
      email: data.email || currentUser.email,
      city: data.city || currentUser.city || 'Chicago',
      state: data.state || currentUser.state || 'IL',
      categories: data.categories || ['blood'],
      bloodGroup: data.bloodGroup || (data.categories?.includes('blood') ? 'O-' : undefined),
      availabilityStatus: data.availabilityStatus || 'available_now',
      verificationBadge: data.verificationBadge || 'Verified Platform Registrant',
      status: data.status || 'active',
      medicalNotes: data.medicalNotes || 'Donation registration submitted via verified clinical platform.',
      scheduledDate: data.scheduledDate
    };

    return await saveDonationRegistrationToFirestore(regRecord);
  };

  // AI Suite specific state
  const [aiPreselectedRequest, setAiPreselectedRequest] = useState<DonationRequest | null>(null);
  const [aiPreselectedDonor, setAiPreselectedDonor] = useState<DonorProfile | null>(null);
  const [aiActiveModule, setAiActiveModule] = useState<'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude'>('crossmatch');

  const openAiWithRequest = (req: DonationRequest) => {
    setAiPreselectedRequest(req);
    setAiActiveModule('crossmatch');
    setSelectedRequest(null);
    setActiveTab('ai-suite');
  };

  const openAiWithDonor = (donor: DonorProfile) => {
    setAiPreselectedDonor(donor);
    setAiActiveModule('crossmatch');
    setSelectedDonor(null);
    setActiveTab('ai-suite');
  };

  const openAiModule = (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => {
    setAiActiveModule(module);
    setActiveTab('ai-suite');
  };

  // Cancer Hospital state & portal navigation
  const [selectedCancerHospital, setSelectedCancerHospital] = useState<CancerHospital | null>(() => {
    return WORLD_CANCER_HOSPITALS[0]; // Default to MD Anderson Cancer Center
  });
  const [cancerHospitalSearchQuery, setCancerHospitalSearchQuery] = useState<string>('MD Anderson');

  const openHospitalPortalForCancerHospital = (hospital: CancerHospital) => {
    setSelectedCancerHospital(hospital);
    setCancerHospitalSearchQuery(hospital.shortName || hospital.name);
    setActiveTab('hospital');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('dc4c_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dc4c_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('dc4c_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('dc4c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dc4c_verifications', JSON.stringify(verificationQueue));
  }, [verificationQueue]);

  useEffect(() => {
    localStorage.setItem('dc4c_reports', JSON.stringify(reports));
  }, [reports]);

  const switchUserRole = (role: UserRole) => {
    const targetUser = DEMO_USERS[role] || {
      ...currentUser,
      role,
      name: role === 'hospital' ? 'Dr. Sarah Chen, MD' : role === 'admin' ? 'Compliance Administrator' : role === 'recipient' ? 'Elena Rostova (Recipient)' : 'Marcus Vance (Donor)'
    };
    setCurrentUser(targetUser);
  };

  const computeMatchScore = (request: DonationRequest, donor: DonorProfile): number => {
    if (!donor.categories.includes(request.category)) return 0;
    
    let score = 50; // base score if category matches
    
    // Specific match criteria
    if (request.category === 'blood' && request.bloodRequirements && donor.bloodDetails) {
      const compatibleList = BLOOD_COMPATIBILITY_MAP[request.bloodRequirements.targetBloodGroup] || [];
      if (compatibleList.includes(donor.bloodDetails.bloodGroup)) {
        score += 35;
      } else {
        return 0; // Incompatible blood type!
      }
      if (donor.bloodDetails.components.includes(request.bloodRequirements.component)) {
        score += 15;
      }
    } else if (request.category === 'organ' && request.organRequirements && donor.organDetails) {
      if (donor.organDetails.organsPledged.includes(request.organRequirements.organ)) {
        score += 40;
      } else {
        return 0;
      }
    } else if (request.category === 'bone_tissue' && request.boneTissueRequirements && donor.boneTissueDetails) {
      if (donor.boneTissueDetails.tissueTypes.includes(request.boneTissueRequirements.tissueType)) {
        score += 30;
      }
      if (donor.boneTissueDetails.hlaTypingAvailable) {
        score += 20;
      }
    } else if (request.category === 'hair' && request.hairRequirements && donor.hairDetails) {
      if (donor.hairDetails.lengthInches >= request.hairRequirements.minInches) {
        score += 30;
      } else {
        score -= 20;
      }
      if (request.hairRequirements.conditionAccepted.includes(donor.hairDetails.condition)) {
        score += 20;
      }
    }

    // Availability bonus
    if (donor.availabilityStatus === 'available_now') score += 10;
    else if (donor.availabilityStatus === 'available_24h') score += 5;
    else if (donor.availabilityStatus === 'cooldown') score -= 25;

    // Integrated Donation Scheduler matching bonus
    if (donor.scheduledSlots && donor.scheduledSlots.length > 0) {
      const matchingSlot = donor.scheduledSlots.find(
        s => s.procedureType === request.category && s.status === 'available'
      );
      if (matchingSlot) {
        score += 15; // Directly confirmed future scheduled slot for this clinical category
      } else {
        score += 5; // Has general scheduled availability
      }
    }

    // Distance factor (closer is better)
    if (donor.distanceKm <= 5) score += 10;
    else if (donor.distanceKm <= 15) score += 5;

    // Verification bonus
    if (donor.isVerified) score += 5;

    return Math.min(Math.max(score, 0), 100);
  };

  const createRequest = (newReq: Partial<DonationRequest>) => {
    const id = `req_${Date.now()}`;
    const fullRequest: DonationRequest = {
      id,
      category: newReq.category || 'blood',
      title: newReq.title || 'New Donation Requisition',
      patientAlias: newReq.patientAlias || 'Patient Confidential',
      patientAge: newReq.patientAge || 30,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      hospitalId: newReq.hospitalId || 'org_metro_univ',
      hospitalName: newReq.hospitalName || 'Metro University Hospital & Organ Transplant Institute',
      city: newReq.city || currentUser.city || 'Chicago',
      state: newReq.state || currentUser.state || 'IL',
      urgency: newReq.urgency || 'standard',
      status: 'pending',
      deadlineHoursRemaining: newReq.deadlineHoursRemaining || (newReq.urgency === 'emergency' ? 6 : 48),
      deadlineDate: newReq.deadlineDate || 'Within 48 Hours',
      createdAt: new Date().toISOString(),
      unitsNeeded: newReq.unitsNeeded || 1,
      unitsFulfilled: 0,
      matchedDonorIds: [],
      medicalNotes: newReq.medicalNotes || '',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          title: 'Requisition Submitted',
          description: `Clinical requisition submitted by ${currentUser.name} (${currentUser.role}).`,
          actorName: currentUser.name,
          actorRole: currentUser.role
        }
      ],
      bloodRequirements: newReq.bloodRequirements,
      organRequirements: newReq.organRequirements,
      boneTissueRequirements: newReq.boneTissueRequirements,
      hairRequirements: newReq.hairRequirements
    };

    // Auto find initial matching donors
    const matchedDonors = donors.filter(d => computeMatchScore(fullRequest, d) >= 70);
    fullRequest.matchedDonorIds = matchedDonors.map(d => d.id);

    setRequests(prev => [fullRequest, ...prev]);

    // Send notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `${fullRequest.urgency.toUpperCase()}: Requisition Created`,
      message: `Your request "${fullRequest.title}" was submitted and is queued for clinical verification.`,
      category: fullRequest.category,
      urgency: fullRequest.urgency,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Add to verification queue
    const queueItem: VerificationItem = {
      id: `verif_${Date.now()}`,
      type: 'medical_requisition',
      entityId: id,
      entityName: fullRequest.title,
      submittedAt: new Date().toISOString(),
      documentType: 'Clinical Requisition & Institutional Intake Form',
      documentRef: `FORM-REQ-${id.toUpperCase()}.PDF`,
      status: 'pending',
      notes: `Submitted by ${currentUser.name}. Requires hospital coordinator approval.`
    };
    setVerificationQueue(prev => [queueItem, ...prev]);
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus, note?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const eventTitles: Record<RequestStatus, string> = {
        pending: 'Requisition Pending Review',
        verified: 'Hospital Board Clearance Verified',
        matched: 'Donors Matched & Alerted',
        in_progress: 'Procedure / Screening Scheduled',
        completed: 'Donation Completed & Logged',
        cancelled: 'Requisition Cancelled'
      };

      const newTimelineEvent = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        title: eventTitles[newStatus],
        description: note || `Status progressed to ${newStatus} by ${currentUser.name}.`,
        actorName: currentUser.name,
        actorRole: currentUser.role
      };

      const updated = {
        ...req,
        status: newStatus,
        unitsFulfilled: newStatus === 'completed' ? req.unitsNeeded : req.unitsFulfilled,
        timeline: [...req.timeline, newTimelineEvent]
      };

      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated);
      }
      return updated;
    }));

    // Notification
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq) {
      const statusNotif: NotificationItem = {
        id: `notif_st_${Date.now()}`,
        userId: currentUser.id,
        title: `Status Updated: ${targetReq.patientAlias}`,
        message: `Request status transitioned to "${newStatus.replace('_', ' ').toUpperCase()}".`,
        category: targetReq.category,
        urgency: targetReq.urgency,
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [statusNotif, ...prev]);
    }
  };

  const registerDonor = (donorData: Partial<DonorProfile>) => {
    const existingIndex = donors.findIndex(d => d.userId === currentUser.id);
    if (existingIndex >= 0) {
      // Update existing
      setDonors(prev => {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          ...donorData,
          isVerified: true
        };
        return next;
      });
    } else {
      // Create new
      const newDonor: DonorProfile = {
        id: `dnr_${Date.now()}`,
        userId: currentUser.id,
        donorName: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        city: currentUser.city || 'Chicago',
        state: currentUser.state || 'IL',
        distanceKm: 2.5,
        categories: donorData.categories || ['blood'],
        isVerified: true,
        verificationBadge: 'Verified Platform Registrant',
        availabilityStatus: donorData.availabilityStatus || 'available_now',
        totalDonationsCount: 1,
        phone: currentUser.phone,
        email: currentUser.email,
        privacySetting: donorData.privacySetting || 'hospital_mediated',
        bloodDetails: donorData.bloodDetails,
        organDetails: donorData.organDetails,
        boneTissueDetails: donorData.boneTissueDetails,
        hairDetails: donorData.hairDetails
      };
      setDonors(prev => [newDonor, ...prev]);
    }

    // Persist donation registration to Firestore
    registerDonationToFirebase({
      donorName: currentUser.name,
      categories: donorData.categories || ['blood'],
      bloodGroup: donorData.bloodDetails?.bloodGroup,
      availabilityStatus: donorData.availabilityStatus || 'available_now',
      city: currentUser.city || 'Chicago',
      state: currentUser.state || 'IL',
      phone: currentUser.phone,
      email: currentUser.email,
      status: 'active'
    }).catch(err => console.warn('Firestore register error:', err));

    const notif: NotificationItem = {
      id: `notif_reg_${Date.now()}`,
      userId: currentUser.id,
      title: 'Donor Registry Updated',
      message: 'Your donor profile and preferences have been successfully recorded with verified status.',
      category: donorData.categories?.[0] || 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const approveVerification = (id: string, notes?: string) => {
    setVerificationQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'approved',
          reviewedBy: currentUser.name,
          notes: notes || 'Reviewed and approved according to clinical safety protocols.'
        };
      }
      return item;
    }));

    // If it's a request, advance request to verified
    const item = verificationQueue.find(i => i.id === id);
    if (item && item.type === 'medical_requisition') {
      updateRequestStatus(item.entityId, 'verified', 'Clinical requisition verified by platform compliance.');
    }
  };

  const rejectVerification = (id: string, notes?: string) => {
    setVerificationQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'rejected',
          reviewedBy: currentUser.name,
          notes: notes || 'Documentation insufficient or non-compliant.'
        };
      }
      return item;
    }));
  };

  const submitModerationReport = (report: { reportedItemId: string; itemType: 'donor' | 'request' | 'user'; reason: ModerationReport['reason']; details: string }) => {
    const newReport: ModerationReport = {
      id: `rep_${Date.now()}`,
      reportedItemId: report.reportedItemId,
      itemType: report.itemType,
      reporterName: currentUser.name,
      reason: report.reason,
      details: report.details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);

    const notif: NotificationItem = {
      id: `notif_rep_${Date.now()}`,
      userId: currentUser.id,
      title: 'Safety Report Logged',
      message: 'Thank you for protecting our community. The compliance committee has received the flagged record for prompt review.',
      category: 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const resolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const dismissReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addDonorScheduledSlot = (donorId: string, slotData: Omit<ScheduledSlot, 'id'>) => {
    const newSlot: ScheduledSlot = {
      ...slotData,
      id: `slot_${Date.now()}`
    };

    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const updatedSlots = [...(d.scheduledSlots || []), newSlot];
      const updatedDonor = {
        ...d,
        scheduledSlots: updatedSlots
      };
      if (selectedDonor && selectedDonor.id === donorId) {
        setSelectedDonor(updatedDonor);
      }
      return updatedDonor;
    }));

    // Notification
    const notif: NotificationItem = {
      id: `notif_slot_${Date.now()}`,
      userId: currentUser.id,
      title: 'Donation Procedure Slot Scheduled',
      message: `New availability slot scheduled for ${slotData.date} (${slotData.startTime}-${slotData.endTime}) for ${slotData.procedureType.replace('_', ' ')} donation.`,
      category: slotData.procedureType,
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const removeDonorScheduledSlot = (donorId: string, slotId: string) => {
    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const updatedSlots = (d.scheduledSlots || []).filter(s => s.id !== slotId);
      const updatedDonor = {
        ...d,
        scheduledSlots: updatedSlots
      };
      if (selectedDonor && selectedDonor.id === donorId) {
        setSelectedDonor(updatedDonor);
      }
      return updatedDonor;
    }));
  };

  const registerForBloodDrive = (driveId: string): boolean => {
    const drive = bloodDrives.find(d => d.id === driveId);
    if (!drive || drive.availableSlots <= 0) return false;

    setBloodDrives(prev => prev.map(d => {
      if (d.id === driveId) {
        return { ...d, availableSlots: Math.max(0, d.availableSlots - 1) };
      }
      return d;
    }));

    const newNotif: NotificationItem = {
      id: `notif_drv_${Date.now()}`,
      userId: currentUser.id,
      title: 'Blood Drive Slot Confirmed',
      message: `You are booked for ${drive.name} at ${drive.locationName} (${drive.hours}). Walk-ins also cleared.`,
      category: 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    return true;
  };

  const likePatientStory = (storyId: string) => {
    setPatientStories(prev => {
      const updated = prev.map(s => {
        if (s.id === storyId) {
          return { ...s, heartsCount: s.heartsCount + 1 };
        }
        return s;
      });
      localStorage.setItem('dc4c_patient_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const submitPatientStory = (storyData: Omit<PatientStory, 'id' | 'heartsCount' | 'isVerified'>) => {
    const newStory: PatientStory = {
      ...storyData,
      id: `story_${Date.now()}`,
      heartsCount: 1,
      isVerified: true
    };
    setPatientStories(prev => {
      const updated = [newStory, ...prev];
      localStorage.setItem('dc4c_patient_stories', JSON.stringify(updated));
      return updated;
    });

    const notif: NotificationItem = {
      id: `notif_story_${Date.now()}`,
      userId: currentUser.id,
      title: 'Success Story Submitted & Published',
      message: `Thank you, ${storyData.recipientName}! Your recipient journey is now featured to inspire the DonorConnect 4Care community.`,
      category: storyData.category,
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const impactStats: ImpactStats = {
    activeRequests: requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length,
    availableDonors: donors.filter(d => d.availabilityStatus === 'available_now' || d.availabilityStatus === 'available_24h').length,
    criticalEmergencies: requests.filter(r => r.urgency === 'emergency' && r.status !== 'completed').length,
    verifiedHospitals: organizations.filter(o => o.isVerified).length,
    livesTouchedCount: 148,
    bloodUnitsCollected: 412,
    hairWigsGifted: 53,
    organTransplantsFacilitated: 19,
    marrowPledgesRegistered: 84
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUserRole,
        requests,
        donors,
        organizations,
        bloodDrives,
        notifications,
        verificationQueue,
        reports,
        impactStats,
        activeTab,
        setActiveTab,
        activeFilterCategory,
        setActiveFilterCategory,
        selectedRequest,
        setSelectedRequest,
        selectedDonor,
        setSelectedDonor,
        isCreateRequestModalOpen,
        setIsCreateRequestModalOpen,
        isRegisterDonorModalOpen,
        setIsRegisterDonorModalOpen,
        isEthicsModalOpen,
        setIsEthicsModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        reportingTarget,
        setReportingTarget,
        createRequest,
        updateRequestStatus,
        registerDonor,
        approveVerification,
        rejectVerification,
        submitModerationReport,
        resolveReport,
        dismissReport,
        markNotificationRead,
        markAllNotificationsRead,
        computeMatchScore,
        addDonorScheduledSlot,
        removeDonorScheduledSlot,
        registerForBloodDrive,
        patientStories,
        likePatientStory,
        submitPatientStory,
        aiPreselectedRequest,
        setAiPreselectedRequest,
        aiPreselectedDonor,
        setAiPreselectedDonor,
        aiActiveModule,
        setAiActiveModule,
        openAiWithRequest,
        openAiWithDonor,
        openAiModule,
        selectedCancerHospital,
        setSelectedCancerHospital,
        cancerHospitalSearchQuery,
        setCancerHospitalSearchQuery,
        openHospitalPortalForCancerHospital,
        firebaseUser,
        registeredAppUser,
        registeredAppUsersList,
        firebaseDonationsList,
        isFirebaseLoading,
        loginWithGoogle,
        logoutFirebase,
        registerDonationToFirebase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
