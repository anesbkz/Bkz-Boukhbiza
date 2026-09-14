import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { ENV } from './env';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functionsInstance: Functions;

try {
  if (!getApps().length) {
    app = initializeApp({
      apiKey: ENV.firebase.apiKey,
      authDomain: ENV.firebase.authDomain,
      projectId: ENV.firebase.projectId,
      storageBucket: ENV.firebase.storageBucket,
      messagingSenderId: ENV.firebase.messagingSenderId,
      appId: ENV.firebase.appId,
    });
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  functionsInstance = getFunctions(app);

  const databaseId = ENV.firebase.firestoreDatabaseId;
  if (databaseId && databaseId !== '(default)') {
    db = getFirestore(app, databaseId);
  } else {
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw or expose handle
  throw error;
}

export { app, auth, db, functionsInstance };

