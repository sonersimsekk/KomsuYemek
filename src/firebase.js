import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
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
const storage = getStorage(app);

function uriToBlob(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Fotoğraf okunamadı.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

function guessContentType(uri) {
  const clean = uri.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.heic') || clean.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extensionFor(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/heic') return 'heic';
  return 'jpg';
}

export async function uploadPostImage(uri, userId) {
  const contentType = guessContentType(uri);
  const blob = await uriToBlob(uri);
  if (blob.size && blob.size > 5 * 1024 * 1024) {
    if (typeof blob.close === 'function') blob.close();
    throw new Error('Fotoğraf 5 MB sınırını aşıyor. Daha küçük bir fotoğraf seçin.');
  }

  const filename = `posts/${userId}/${Date.now()}.${extensionFor(contentType)}`;
  const storageRef = ref(storage, filename);
  try {
    await uploadBytes(storageRef, blob, { contentType });
  } finally {
    if (typeof blob.close === 'function') blob.close();
  }
  return getDownloadURL(storageRef);
}

export { auth, db, storage };
