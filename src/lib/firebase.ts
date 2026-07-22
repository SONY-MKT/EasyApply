import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "caramel-ring-652jj",
  appId: "1:17279871340:web:d9eff5dd875907c9286b49",
  apiKey: "AIzaSyBuL_2TaJ83-19FscyA0wMeByKIPhnDRBE",
  authDomain: "caramel-ring-652jj.firebaseapp.com",
  storageBucket: "caramel-ring-652jj.firebasestorage.app",
  messagingSenderId: "17279871340"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, "ai-studio-easyapply-7588218e-27a1-4284-9544-6776b83abbc3");
export const auth = getAuth(app);
