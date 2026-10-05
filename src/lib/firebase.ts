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

// Log the Firebase project being used at startup (development aid)
console.log('[Firebase] Initializing with project:', firebaseConfig.projectId);
console.log('[Firebase] Auth domain:', firebaseConfig.authDomain);

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore — using default database for dofi-healthcare-platform
export const db = getFirestore(app);

// Connection verification test
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
 * Sign in using Google Auth popup.
 *
 * IMPORTANT: This function ONLY handles the OAuth popup.
 * Firestore user record sync is handled separately in onAuthStateChanged (AppContext).
 * This prevents Firestore permission errors from breaking the auth flow.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  console.log('[Firebase Auth] Starting Google Sign-In popup...');
  console.log('[Firebase Auth] Project:', firebaseConfig.projectId);
  console.log('[Firebase Auth] Auth domain:', firebaseConfig.authDomain);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[Firebase Auth] Sign-in popup completed successfully.');
    console.log('[Firebase Auth] User UID:', result.user.uid);
    console.log('[Firebase Auth] User email:', result.user.email);
    console.log('[Firebase Auth] User displayName:', result.user.displayName);
    return result.user;
  } catch (error: unknown) {
    // Surface the full error — never swallow it silently
    const firebaseError = error as { code?: string; message?: string };
    console.error('[Firebase Auth] ❌ Google Sign-In FAILED');
    console.error('[Firebase Auth] Error code:', firebaseError?.code || 'unknown');
    console.error('[Firebase Auth] Error message:', firebaseError?.message || String(error));

    // Provide actionable guidance for known error codes
    if (firebaseError?.code === 'auth/popup-closed-by-user') {
      console.warn('[Firebase Auth] User closed the popup before completing sign-in.');
    } else if (firebaseError?.code === 'auth/popup-blocked') {
      console.error('[Firebase Auth] Popup was blocked by the browser. Enable popups for localhost:3000.');
    } else if (firebaseError?.code === 'auth/operation-not-allowed') {
      console.error('[Firebase Auth] Google Sign-In provider is NOT enabled in Firebase Console.');
      console.error('[Firebase Auth] → Go to: https://console.firebase.google.com/project/dofi-healthcare-platform/authentication/providers');
      console.error('[Firebase Auth] → Enable "Google" as a sign-in provider.');
    } else if (firebaseError?.code === 'auth/unauthorized-domain') {
      console.error('[Firebase Auth] This domain is not authorized for Google Sign-In.');
      console.error('[Firebase Auth] → Go to: https://console.firebase.google.com/project/dofi-healthcare-platform/authentication/settings');
      console.error('[Firebase Auth] → Add "localhost" to the Authorized Domains list.');
    } else if (firebaseError?.code === 'auth/configuration-not-found') {
      console.error('[Firebase Auth] Firebase Auth configuration not found for this project.');
      console.error('[Firebase Auth] → Ensure Google provider is enabled in Firebase Console.');
    }

    throw error;
  }
}

/**
 * Sync or create a Firestore user record after successful Firebase Auth.
 * Called from AppContext onAuthStateChanged — AFTER the popup completes.
 */
export async function syncUserToFirestore(fbUser: FirebaseUser): Promise<RegisteredAppUser> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const nowIso = new Date().toISOString();

  try {
    const existingSnap = await getDoc(userDocRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data() as RegisteredAppUser;
      const appUser: RegisteredAppUser = {
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
      }).catch(e => console.warn('[Firebase] Could not update lastLoginAt:', e));
      console.log('[Firebase] Existing user record updated:', appUser.id);
      return appUser;
    } else {
      const appUser: RegisteredAppUser = {
        id: fbUser.uid,
        email: fbUser.email || '',
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
      console.log('[Firebase] New user record created:', appUser.id);
      return appUser;
    }
  } catch (error) {
    console.warn('[Firebase] Firestore user sync error (auth still succeeded):', error);
    // Return a minimal user record based on Firebase Auth data — don't break auth
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'Registered User',
      photoURL: fbUser.photoURL || undefined,
      role: 'donor',
      isVerified: false,
      donationsRegisteredCount: 0,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      provider: 'google'
    };
  }
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
