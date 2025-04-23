import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTjL8hLbzzLzQBoEdKM4LxIJ7KnfV_BoY",
  authDomain: "komsuyemekapp.firebaseapp.com",
  projectId: "komsuyemekapp",
  storageBucket: "komsuyemekapp.appspot.com",
  messagingSenderId: "384520409144",
  appId: "1:384520409144:web:827ed32a184d44a80ed6cd",
  measurementId: "G-SHDQ5LPNSR"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };