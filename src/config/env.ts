/**
 * Safe Environment Configuration Layer
 * Distinguishes development, test, and production environments.
 * Encapsulates public Vite client configuration without exposing server secrets.
 */

export type EnvironmentMode = 'development' | 'test' | 'production';

export interface AppEnvConfig {
  mode: EnvironmentMode;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    firestoreDatabaseId?: string;
  };
}

// Fallback values imported from firebase-applet-config.json if vite env is empty
import firebaseAppletConfig from '../../firebase-applet-config.json';

const mode: EnvironmentMode =
  (import.meta.env?.MODE as EnvironmentMode) ||
  (process.env.NODE_ENV as EnvironmentMode) ||
  'development';

export const ENV: AppEnvConfig = {
  mode,
  isDev: mode === 'development',
  isProd: mode === 'production',
  isTest: mode === 'test',
  firebase: {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey || '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain || '',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId || '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket || '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId || '',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId || '',
    firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId || '(default)',
  },
};
