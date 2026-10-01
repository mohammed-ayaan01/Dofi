import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom Database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification test as specified by Firebase Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection to Firestore verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database initializing.');
    }
    return false;
  }
}
testConnection();

// Types for Firebase App Users and Donation Registrations
export interface RegisteredAppUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'donor' | 'recipient' | 'hospital_staff' | 'admin';
  isVerified: boolean;
  donationsRegisteredCount: number;
  createdAt: string;
  lastLoginAt: string;
  provider: string;
}

export interface FirebaseDonationRegistration {
  id: string;
  registeredByUserId: string;
  registeredByUserEmail: string;
  registeredByUserName: string;
  donorName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  categories: string[];
  bloodGroup?: string;
  availabilityStatus: string;
  verificationBadge: string;
  status: 'active' | 'in_screening' | 'scheduled' | 'completed';
  medicalNotes?: string;
  scheduledDate?: string;
  createdAt: string;
}

/**
 * Sign in using Google Auth and synchronize user record into Firestore `users` collection.
 */
export async function signInWithGoogle(): Promise<RegisteredAppUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  const existingSnap = await getDoc(userDocRef);

  const nowIso = new Date().toISOString();

  let appUser: RegisteredAppUser;

  if (existingSnap.exists()) {
    const data = existingSnap.data() as RegisteredAppUser;
    appUser = {
      ...data,
      displayName: fbUser.displayName || data.displayName || 'Registered User',
      email: fbUser.email || data.email,
      photoURL: fbUser.photoURL || data.photoURL,
      lastLoginAt: nowIso
    };
    await updateDoc(userDocRef, {
      displayName: appUser.displayName,
      photoURL: appUser.photoURL,
      lastLoginAt: nowIso
    });
  } else {
    appUser = {
      id: fbUser.uid,
      email: fbUser.email || 'user@donorconnect4care.org',
      displayName: fbUser.displayName || 'Registered Community Member',
      photoURL: fbUser.photoURL || undefined,
      role: 'donor',
      isVerified: true,
      donationsRegisteredCount: 0,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      provider: 'google'
    };
    await setDoc(userDocRef, appUser);
  }

  return appUser;
}

/**
 * Sign out current Firebase user
 */
export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Register a donation record in Firestore `donation_registrations`
 */
export async function saveDonationRegistrationToFirestore(
  registration: Omit<FirebaseDonationRegistration, 'createdAt'> & { createdAt?: string }
): Promise<FirebaseDonationRegistration> {
  const recordId = registration.id || `reg_${Date.now()}`;
  const nowIso = registration.createdAt || new Date().toISOString();

  const fullRecord: FirebaseDonationRegistration = {
    ...registration,
    id: recordId,
    createdAt: nowIso
  };

  const regDocRef = doc(db, 'donation_registrations', recordId);
  await setDoc(regDocRef, fullRecord);

  // If registered by a user, increment user's registered count
  if (registration.registeredByUserId) {
    try {
      const userRef = doc(db, 'users', registration.registeredByUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const cur = (userSnap.data().donationsRegisteredCount || 0) + 1;
        await updateDoc(userRef, { donationsRegisteredCount: cur });
      }
    } catch (e) {
      console.warn('Could not increment user donation count:', e);
    }
  }

  return fullRecord;
}

/**
 * Fetch all users who registered in this app
 */
export async function fetchRegisteredUsers(): Promise<RegisteredAppUser[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as RegisteredAppUser);
  } catch (err) {
    console.warn('[Firebase] fetchRegisteredUsers fallback or error:', err);
    return [];
  }
}

/**
 * Fetch all registered donations
 */
export async function fetchDonationRegistrations(): Promise<FirebaseDonationRegistration[]> {
  try {
    const q = query(collection(db, 'donation_registrations'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as FirebaseDonationRegistration);
  } catch (err) {
    console.warn('[Firebase] fetchDonationRegistrations error:', err);
    return [];
  }
}
