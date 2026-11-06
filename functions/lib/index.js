/**
 * Spotify API proxy — búsqueda (client credentials) y añadir a playlist (refresh token).
 * Desplegado como HTTPS Function; Firebase Hosting reescribe /api/spotify/** aquí.
 */
import express from "express";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
const spotifyClientSecret = defineSecret("SPOTIFY_CLIENT_SECRET");
const spotifyRefreshToken = defineSecret("SPOTIFY_REFRESH_TOKEN");
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SEARCH_PER_WINDOW = 120;
const MAX_ADD_PER_WINDOW = 40;
const rateBuckets = new Map();
function clientIp(req) {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length > 0)
        return xf.split(",")[0].trim();
    return req.socket.remoteAddress ?? "unknown";
}
function rateLimit(ip, kind) {
    const now = Date.now();
    let b = rateBuckets.get(ip);
    if (!b || now > b.resetAt) {
        b = { search: 0, add: 0, resetAt: now + RATE_WINDOW_MS };
        rateBuckets.set(ip, b);
    }
    if (kind === "search") {
        if (b.search >= MAX_SEARCH_PER_WINDOW)
            return false;
        b.search += 1;
    }
    else {
        if (b.add >= MAX_ADD_PER_WINDOW)
            return false;
        b.add += 1;
    }
    return true;
}
function pickCorsOrigin(origin) {
    if (!origin)
        return null;
    try {
        const u = new URL(origin);
        const h = u.hostname;
        if (h === "localhost" || h === "127.0.0.1")
            return origin;
        if (h.endsWith(".web.app") || h.endsWith(".firebaseapp.com"))
            return origin;
        const extra = process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        if (extra.some((o) => origin === o))
            return origin;
        return null;
    }
    catch {
        return null;
    }
}
let ccCache = null;
let userCache = null;
async function getClientCredentialsToken() {
    const now = Date.now();
    if (ccCache && ccCache.expires > now + 30_000)
        return ccCache.token;
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!id || !secret)
        throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
    const basic = Buffer.from(`${id}:${secret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Spotify token (client): ${res.status} ${t}`);
    }
    const data = (await res.json());
    ccCache = {
        token: data.access_token,
        expires: now + (data.expires_in ?? 3600) * 1000,
    };
    return ccCache.token;
}
async function getUserAccessToken() {
    const now = Date.now();
    if (userCache && userCache.expires > now + 30_000)
        return userCache.token;
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
    if (!id || !secret || !refresh) {
        throw new Error("Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET or SPOTIFY_REFRESH_TOKEN");
    }
    const basic = Buffer.from(`${id}:${secret}`).toString("base64");
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
    });
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Spotify token (refresh): ${res.status} ${t}`);
    }
    const data = (await res.json());
    userCache = {
        token: data.access_token,
        expires: now + (data.expires_in ?? 3600) * 1000,
    };
    return userCache.token;
}
function checkAccess(req) {
    const expected = process.env.ACCESS_CODE?.trim() ?? "";
    if (!expected)
        return true;
    const h = req.headers["x-access-code"];
    const fromHeader = typeof h === "string" ? h : Array.isArray(h) ? h[0] : "";
    const fromBody = req.method === "POST" && req.body && typeof req.body === "object" && "accessCode" in req.body
        ? String(req.body.accessCode ?? "")
        : "";
    const provided = fromHeader || fromBody;
    return provided === expected;
}
function buildApp() {
    const app = express();
    app.use(express.json({ limit: "32kb" }));
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        const allowed = pickCorsOrigin(origin);
        if (allowed) {
            res.setHeader("Access-Control-Allow-Origin", allowed);
            res.setHeader("Vary", "Origin");
        }
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Access-Code");
        if (req.method === "OPTIONS") {
            res.status(204).end();
            return;
        }
        next();
    });
    app.get("/api/spotify/health", (_req, res) => {
        res.json({ ok: true });
    });
    app.get("/api/spotify/search", async (req, res) => {
        if (!checkAccess(req)) {
            res.status(401).json({ error: "Código de acceso incorrecto." });
            return;
        }
        const ip = clientIp(req);
        if (!rateLimit(ip, "search")) {
            res.status(429).json({ error: "Demasiadas búsquedas. Prueba más tarde." });
            return;
        }
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (q.length < 2) {
            res.status(400).json({ error: "Escribe al menos 2 caracteres." });
            return;
        }
        if (q.length > 120) {
            res.status(400).json({ error: "Búsqueda demasiado larga." });
            return;
        }
        try {
            const token = await getClientCredentialsToken();
            const url = new URL("https://api.spotify.com/v1/search");
            url.searchParams.set("q", q);
            url.searchParams.set("type", "track");
            url.searchParams.set("limit", "10");
            const spotifyRes = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (spotifyRes.status === 429) {
                const retry = spotifyRes.headers.get("Retry-After");
                res.status(503).json({
                    error: "Spotify está saturado. Espera unos segundos e inténtalo de nuevo.",
                    retryAfter: retry ? Number(retry) : undefined,
                });
                return;
            }
            if (!spotifyRes.ok) {
                const t = await spotifyRes.text();
                res.status(502).json({ error: "No se pudo buscar en Spotify.", detail: t.slice(0, 200) });
                return;
            }
            const json = (await spotifyRes.json());
            const items = json.tracks?.items ?? [];
            res.json({
                tracks: items.map((t) => ({
                    id: t.id,
                    name: t.name,
                    artists: t.artists.map((a) => a.name).join(", "),
                    album: t.album?.name ?? "",
                    image: t.album?.images?.[0]?.url ?? "",
                })),
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: "Error interno al buscar." });
        }
    });
    app.post("/api/spotify/add", async (req, res) => {
        if (!checkAccess(req)) {
            res.status(401).json({ error: "Código de acceso incorrecto." });
            return;
        }
        const ip = clientIp(req);
        if (!rateLimit(ip, "add")) {
            res.status(429).json({ error: "Demasiados intentos. Prueba más tarde." });
            return;
        }
        const playlistId = process.env.SPOTIFY_PLAYLIST_ID?.trim();
        if (!playlistId) {
            res.status(500).json({ error: "Playlist no configurada en el servidor." });
            return;
        }
        const trackId = req.body && typeof req.body === "object" && typeof req.body.trackId === "string"
            ? req.body.trackId.trim()
            : "";
        if (!/^[0-9A-Za-z]{22}$/.test(trackId)) {
            res.status(400).json({ error: "Identificador de canción no válido." });
            return;
        }
        try {
            const token = await getUserAccessToken();
            const spotifyRes = await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`],
                }),
            });
            if (spotifyRes.status === 429) {
                res.status(503).json({ error: "Spotify pide esperar. Inténtalo en unos segundos." });
                return;
            }
            if (spotifyRes.status === 401) {
                userCache = null;
                res.status(502).json({ error: "Sesión de Spotify caducada. Contacta con los novios." });
                return;
            }
            if (!spotifyRes.ok) {
                const t = await spotifyRes.text();
                res.status(502).json({ error: "No se pudo añadir la canción.", detail: t.slice(0, 200) });
                return;
            }
            res.json({ ok: true });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ error: "Error interno al añadir la canción." });
        }
    });
    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });
    return app;
}
let cachedApp = null;
function getApp() {
    if (!cachedApp)
        cachedApp = buildApp();
    return cachedApp;
}
export const spotifyApi = onRequest({
    region: "europe-west1",
    secrets: [spotifyClientSecret, spotifyRefreshToken],
    memory: "256MiB",
    timeoutSeconds: 30,
    maxInstances: 10,
}, (req, res) => {
    getApp()(req, res);
});
