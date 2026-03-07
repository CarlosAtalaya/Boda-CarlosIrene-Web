/**
 * Inicialización de Firebase para la web de boda.
 * Usa variables de entorno con prefijo PUBLIC_ para exponerlas al cliente (Astro).
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Obtiene la instancia de Firebase App (inicialización lazy).
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const hasValidConfig = Object.values(firebaseConfig).every(
      (v) => typeof v === "string" && v.length > 0
    );
    if (!hasValidConfig) {
      throw new Error(
        "Configuración de Firebase incompleta. Revisa las variables en .env"
      );
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Obtiene la instancia de Firestore.
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}
