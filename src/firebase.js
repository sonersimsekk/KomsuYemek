import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { createAuth } from './authPersistence';

const firebaseConfig = {
  apiKey: 'AIzaSyCTjL8hLbzzLzQBoEdKM4LxIJ7KnfV_BoY',
  authDomain: 'komsuyemekapp.firebaseapp.com',
  projectId: 'komsuyemekapp',
  storageBucket: 'komsuyemekapp.appspot.com',
  messagingSenderId: '384520409144',
  appId: '1:384520409144:web:827ed32a184d44a80ed6cd',
  measurementId: 'G-SHDQ5LPNSR',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = createAuth(app);

function createDb(firebaseApp) {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } catch (error) {
    return getFirestore(firebaseApp);
  }
}

const db = createDb(app);

export { auth, db };
