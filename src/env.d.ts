/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ACCESS_CODE: string;
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_SPOTIFY_PLAYLIST_ID: string;
  readonly PUBLIC_SPOTIFY_PLAYLIST_COLLAB_URL: string;
  readonly PUBLIC_IBAN: string;
  readonly PUBLIC_WEATHER_TEST_DATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
