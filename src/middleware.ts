/**
 * Middleware de seguridad: inyecta headers HTTP en desarrollo local.
 * En producción, Firebase Hosting aplica los headers definidos en firebase.json.
 */
import { defineMiddleware } from "astro:middleware";

// CSP: img-src y connect-src sin wildcards (ZAP 10055). ws/wss específicos para HMR en dev.
// COEP se omite (unsafe-none) para permitir el iframe embed de Spotify (third-party resource).
const SECURITY_HEADERS: [string, string][] = [
  [
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://*.vitejs.dev https://open.spotify.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com https://www.google.com https://www.gstatic.com https://i.scdn.co https://*.scdn.co https://*.spotifycdn.com; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://*.firebaseapp.com https://api.spotify.com https://open.spotify.com ws://localhost:4321 ws://127.0.0.1:4321 ws://192.168.1.230:4321 wss://localhost:4321 wss://127.0.0.1:4321 wss://192.168.1.230:4321; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; frame-src https://www.google.com https://open.spotify.com",
  ],
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Cross-Origin-Embedder-Policy", "unsafe-none"],
  ["Cross-Origin-Opener-Policy", "same-origin-allow-popups"],
  ["Cross-Origin-Resource-Policy", "cross-origin"],
  [
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  ],
];

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }

  return response;
});
