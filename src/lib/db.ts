import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { LoanApplication, AppSettings, ActivityLog } from '../types';
import { defaultSettings } from '../defaultSettings';

// Applications
const APPS_COLLECTION = 'applications';

export const subscribeToApplications = (callback: (apps: LoanApplication[]) => void) => {
  const q = query(collection(db, APPS_COLLECTION), orderBy('appliedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
    callback(apps);
  }, (error) => {
    console.error("Firestore applications subscription error:", error);
  });
};

export const addApplication = async (app: LoanApplication) => {
  const docRef = doc(db, APPS_COLLECTION, app.id);
  await setDoc(docRef, app);
  return app.id;
};

export const updateApplication = async (id: string, updates: Partial<LoanApplication>) => {
  const docRef = doc(db, APPS_COLLECTION, id);
  await updateDoc(docRef, updates);
};

export const deleteApplication = async (id: string) => {
  const docRef = doc(db, APPS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Settings
const SETTINGS_DOC = 'settings/main';

export const subscribeToSettings = (callback: (settings: AppSettings) => void) => {
  const docRef = doc(db, SETTINGS_DOC);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...defaultSettings, ...docSnap.data() } as AppSettings);
    } else {
      callback(defaultSettings);
    }
  }, (error) => {
    console.error("Firestore settings subscription error:", error);
    callback(defaultSettings);
  });
};

export const updateSettings = async (settings: AppSettings) => {
  const docRef = doc(db, SETTINGS_DOC);
  await setDoc(docRef, settings, { merge: true });
};

// Logs
const LOGS_COLLECTION = 'activity_logs';

export const subscribeToLogs = (callback: (logs: ActivityLog[]) => void) => {
  const q = query(collection(db, LOGS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
    callback(logs);
  }, (error) => {
    console.error("Firestore logs subscription error:", error);
  });
};

export const addActivityLog = async (log: Omit<ActivityLog, 'id'>) => {
  await addDoc(collection(db, LOGS_COLLECTION), log);
};
